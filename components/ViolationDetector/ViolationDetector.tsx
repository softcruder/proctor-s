import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/Supabase/supabaseClient';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Button from '../Button';
import * as tf from '@tensorflow/tfjs';

interface Violation {
  class: string;
  score: number;
  timestamp: string;
  updated_at: string;
}

interface ViolationDetectorProps {
  testID: string;
  userID: string;
  showVid?: boolean;
}

const ViolationDetector: React.FC<ViolationDetectorProps> = ({ testID, userID, showVid = true }) => {
  const displayVideoRef = useRef<HTMLVideoElement | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(showVid);

  useEffect(() => {
    const createBE = async () => {
      await tf.setBackend('webgl');
    };
    createBE();

    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
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

    loadModel();
    setupCamera();

    return () => {
      if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
        const stream = hiddenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const detectFrame = async (retryCount = 0) => {
      if (model && hiddenVideoRef.current && hiddenVideoRef.current.readyState === 4) {
        try {
          const predictions = await model.detect(hiddenVideoRef.current);
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
            if (pred.class === 'cell phone') {
              externalDeviceDetected = true;
              setViolations(prev => [...prev, {
                class: 'cell phone',
                score: pred.score,
                timestamp,
                updated_at: timestamp,
              }]);
            }
          });

          if (!faceDetected) {
            setViolations(prev => [...prev, {
              class: 'looking away',
              score: 1,
              timestamp,
              updated_at: timestamp,
            }]);
          }

          requestAnimationFrame(() => detectFrame());
        } catch (error) {
          console.error('Error detecting frame:', error);
          if (retryCount < 5) {
            console.log(retryCount)
            setTimeout(() => detectFrame(retryCount + 1), 30000);
          } else {
            detectFrame(0); // restart after 5 failed attempts
          }
        }
      } else {
        setTimeout(() => detectFrame(retryCount), 30000);
      }
    };

    if (cameraActive) {
      detectFrame();
    }
  }, [model, cameraActive]);

  const handleSaveViolations = async () => {
    try {
      const { error } = await supabase.from('violations').insert(
        violations.map(violation => ({
          test_id: testID,
          user_id: userID,
          ...violation,
        }))
      );

      if (error) {
        console.error('Error saving violations:', error);
      } else {
        console.log('Violations saved successfully');
      }
    } catch (error) {
      console.error('Error saving violations:', error);
    }
  };

  const handleCloseCamera = () => {
    if (displayVideoRef.current && displayVideoRef.current.srcObject) {
      setShowVideo(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col min-h-100 lg:flex-row">
        <div className="w-full lg:w-3/5 bg-gray-100 p-4">
          <h2 className="text-xl font-semibold">Test Content</h2>
        </div>
        <div className="w-full lg:w-2/5 p-4">
          <video ref={hiddenVideoRef} width="450" height="400" className="hidden" />
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
                  <Button
                    onClick={handleSaveViolations}
                    text='Save'
                    bgColor='bg-blue'
                  />
                  </>
                ) : (
                  <p>No violations detected.</p>
                )}
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
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        {cameraActive && showVideo ? (
          <Button
            onClick={handleCloseCamera}
            text='Show Video'
            bgColor='bg-red'
          />
        ) : (<Button
          onClick={handleCloseCamera}
          text='Close Video'
          bgColor='bg-slate'
        />)}
      </div>
    </div>
  );
};

export default ViolationDetector;