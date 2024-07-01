import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/Supabase/supabaseClient';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Button from '../Button';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { getUser } from '@/utils/supabase';
import { toast } from 'react-toastify';
import { Puff } from 'react-loader-spinner';

interface Violation {
  class: string;
  score: number;
  count?: number;
  timestamp: string;
  updated_at: string;
}
interface ViolationDetectorProps {
  testID: string;
  userID: string;
  showVid?: boolean;
}
interface AggregatedViolation {
  [key: string]: Violation;
}

const ViolationDetector: React.FC<ViolationDetectorProps> = ({ testID, userID, showVid = false }) => {
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cocoModel, setCocoModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [faceDetection, setFaceDetection] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(showVid);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const createBE = async () => {
      await tf.setBackend('webgl');
    };
    createBE();

    const loadModel = async () => {
      try {
        const loadedcocoModel = await cocoSsd.load();
        setCocoModel(loadedcocoModel);
        const faceModel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const faceModelDetector = await faceLandmarksDetection.createDetector(faceModel, { runtime: 'tfjs', refineLandmarks: true });
        setFaceDetection(faceModelDetector);
      } catch (error) {
        console.error('Error loading cocoModel:', error);
      }
    };

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.srcObject = stream;
          hiddenVideoRef.current.play().catch((error) => console.error('Error playing hidden video:', error));
        }
        if (displayVideoRef.current) {
          displayVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error setting up camera:', error);
      }
    };

    const initialize = async () => {
      await loadModel();
      await setupCamera();
      setIsLoading(false);
    };

    initialize();

    return () => {
      if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
        const stream = hiddenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const detectFrame = async (retryCount = 0) => {
      if (cocoModel && hiddenVideoRef.current && hiddenVideoRef.current.readyState === 4) {
        try {
          const predictions = await cocoModel.detect(hiddenVideoRef.current);
          const facePredictions = await faceDetection?.estimateFaces(hiddenVideoRef.current, { flipHorizontal: false });
          const timestamp = new Date().toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
          });

          let faceDetected = false;
          let externalDeviceDetected = false;

          predictions.forEach(pred => {
            if (pred.class === 'person') {
              faceDetected = true;
            }
            if (['cell phone', 'books', 'foreign object', 'phone', 'calculator', 'hand'].includes(pred.class)) {
              externalDeviceDetected = true;
              setViolations(prev => [...prev, {
                class: pred.class,
                score: pred.score,
                timestamp,
                updated_at: timestamp,
              }]);
            }
          });

          if (facePredictions && facePredictions?.length > 0) {
            faceDetected = true;
            const face = facePredictions[0];
            const keypoints = face.keypoints;

            const leftEye = keypoints[33];
            const rightEye = keypoints[263];
            const nose = keypoints[1];
            const leftEar = keypoints[234];
            const rightEar = keypoints[454];

            const xDistance = Math.abs(leftEye.x - rightEye.x);
            const yDistance = Math.abs(leftEye.y - nose.y);

            if (yDistance / xDistance > 0.5) {
              setViolations(prev => [...prev, {
                class: 'facial features (eye, nose) movement',
                score: 1,
                timestamp,
                updated_at: timestamp,
              }]);
            }

            // Detect head movement by checking the relative positions of the eyes, nose, and ears
            const headMovementThreshold = 70; // After multiple tests of the model '70' is the appropriate threshold for head movement
            const initialNoseX = keypoints[1].x;

            const headMovementDetected =
              Math.abs(nose.x - initialNoseX) > headMovementThreshold ||
              Math.abs(leftEye.x - nose.x) > headMovementThreshold ||
              Math.abs(rightEye.x - nose.x) > headMovementThreshold ||
              Math.abs(leftEar.x - nose.x) > headMovementThreshold ||
              Math.abs(rightEar.x - nose.x) > headMovementThreshold;

            if (headMovementDetected) {
              setViolations(prev => [...prev, {
                class: 'head movement/looking away',
                score: 1,
                timestamp,
                updated_at: timestamp,
              }]);
            };
          }

          if (!faceDetected) {
            setViolations(prev => [...prev, {
              class: 'face not in screen',
              score: 1,
              timestamp,
              updated_at: timestamp,
            }]);
          }

          requestAnimationFrame(() => detectFrame());
        } catch (error) {
          console.error('Error detecting frame:', error);
          // restart 5 times if it fails to start
          if (retryCount < 5) {
            console.log(retryCount) //check the fails before proper start
            setTimeout(() => detectFrame(retryCount + 1), 30000);
          } else {
            detectFrame(0);
          }
        }
      } else {
        setTimeout(() => detectFrame(retryCount), 30000);
      }
    };

    if (cameraActive) {
      detectFrame();
    }
  }, [cocoModel, cameraActive, faceDetection]);

  const handleSaveViolations = async () => {
    try {
      const aggregatedViolations: AggregatedViolation = violations.reduce((acc: AggregatedViolation, violation: Violation) => {
        const key: string = violation.class;
        if (!acc[key]) {
          acc[key] = { ...violation, count: 1 };
        } else {
          acc[key].count = (acc[key].count ?? 0) + 1;
        }
        return acc;
      }, {});

      const aggregatedViolationsArray: Violation[] = Object.values(aggregatedViolations);

      setIsLoading(true);
      const { data: user } = await getUser({ username: userID })

      const det = await supabase.from('violations').insert(
        aggregatedViolationsArray.map(violation => ({
          test_id: testID,
          user_id: user?.id,
          score: violation.count,
          type: violation.class,
          created_at: violation.timestamp,
          updated_at: violation.updated_at,
        }))
      );
      setIsLoading(false);
      if (det.error) {
        console.error('Error saving violations:', det.error);
      } else {
        toast.success(det.statusText || 'Successful!', {
          position: 'top-right',
          className: 'bg-green-500 text-white',
          progressClassName: 'bg-green-700',
        });

      }
    } catch (error) {
      console.error('Error saving violations:', error);
    }
  };

  const handleCloseCamera = () => {
    if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
      setCameraActive(!cameraActive);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Puff
            visible={true}
            height="80"
            width="80"
            color="#00bfff"
            ariaLabel="puff-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col min-h-100 lg:flex-row">
            <div className="w-full lg:w-3/5 bg-gray-100 p-4">
              <h2 className="text-xl font-semibold">Test Content</h2>
            </div>
            <div className="w-full lg:w-2/5 p-4">
              <video ref={hiddenVideoRef} width="450" height="400" className={cameraActive ? '' : "hidden"} />
              {showVideo && cameraActive && (
                <div className="flex flex-col lg:flex-row h-full">
                  <div className="w-full ">
                    <video ref={displayVideoRef} width="450" height="400" className="w-full h-auto" />
                  </div>
                  <div className="w-full min-h-100 overflow-y-auto py-1.2 px-3">
                    <h3 className="text-md font-bold py-2 px-1">Violations</h3>
                    {violations.length > 0 ? (
                      <>
                        <ul className="bg-black max-h-80 overflow-y-auto rounded-md">
                          {violations.map((violation, index) => (
                            <li key={index} className="text-red-500 text-xs divide-y py-1 px-2" >{`${new Date(violation.timestamp).toLocaleString(undefined, {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZoneName: undefined
                            })} - ${violation.class}`}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>No violations detected.</p>
                    )}
                    <div className="flex justify-center mt-2 space-x-2">
                      <Button
                        onClick={handleSaveViolations}
                        text='Save'
                        bgColor='bg-blue'
                        isLoading={isLoading}
                      />
                      {(<Button
                        onClick={handleCloseCamera}
                        text={cameraActive ? 'Close Video' : 'Show Video'}
                        bgColor={cameraActive ? 'bg-red' : 'bg-green'}
                      />)}
                    </div>
                  </div>
                </div>
              )}
              {!showVideo && (
                <div className="w-full min-h-100 overflow-y-auto py-1.2 px-3">
                  <h3 className="text-md font-bold py-2 px-1">Violations</h3>
                  {violations.length > 0 ? (
                    <ul className="bg-black max-h-80 overflow-y-auto rounded-md">
                      {violations.map((violation, index) => (
                        <li key={index} className="text-red-500 text-xs divide-y py-1.5 px-2">{`${violation.timestamp} - ${violation.class}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No violations detected.</p>
                  )}
                  <div className="flex justify-center mt-2 space-x-2">
                    <Button
                      onClick={handleSaveViolations}
                      text='Save'
                      bgColor='bg-blue'
                      isLoading={isLoading}
                    />
                    {(<Button
                      onClick={handleCloseCamera}
                      text={cameraActive ? 'Close Video' : 'Show Video'}
                      bgColor={cameraActive ? 'bg-red' : 'bg-green'}
                    />)}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-4">

          </div>
        </>
      )}
    </div>
  );
};

export default ViolationDetector;