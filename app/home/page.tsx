"use client"
import React, { useEffect, useRef, useState } from 'react';
import { setupCamera, toggleCamera } from '@/helpers';
import VideoDetector, { Violation } from '@/lib/Detector';
import { capitalizeTheFirstLetter } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card/card';
import { useUtilsContext } from '@/context/UtilsContext';
import RangeComponent from '@/components/ui/Range/index';
import Button from '@/components/shared/Button'; // Assuming this is the Button component
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import Image from 'next/image';

const Home = () => {
  const { notify } = useUtilsContext();
  const hiddenRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<string | MediaStream | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [violations, setViolations] = useState<{ [key: string]: Violation }>({});
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0.85); // Default confidence value
  const [lookingAwayThreshold, setLookingAwayThreshold] = useState<number>(0.23); // Default looking away threshold that works
  const detectorRef = useRef<VideoDetector | null>(null);
  // const debugCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    const newImageURLs: { [key: string]: string } = {};

    Object.entries(violations).forEach(([type, violation]) => {
      if (violation.lastSnapshot) {
        violation.lastSnapshot.toBlob(blob => {
          if (blob) {
            newImageURLs[type] = URL.createObjectURL(blob);
            setImageURLs(prevImageURLs => ({ ...prevImageURLs, ...newImageURLs }));
          }
        });
      }
    });
  }, [violations]);

  // const callNotify = (text: string, type: string, description: string) => {
  //   notify(text, { type, description });
  // };

  const cameraToggle = async (bool: boolean) => {
    const toggleRes = await toggleCamera(hiddenRef, bool);
    setCameraOn(toggleRes.success);
    return toggleRes;
  }

  const startDetection = async () => {
    const camera = await cameraToggle(true);
    if (!camera.stream) {
      return;
    }
    const { videoStream, success, error } = await setupCamera(hiddenRef, camera.stream);
    setVideoStream(videoStream);
    setSuccess(success);
    if(error) {
      notify("Please grant access to your camera!")
    }

    if (hiddenRef.current && success) {
      const detector = new VideoDetector({
        onViolation: (violation) => {
          setViolations(prev => ({ ...prev, [violation.type]: violation }));
          // notify("Violation Detected!", { description: capitalizeTheFirstLetter(violation.type.replaceAll('_', ' ')) });
        },
        frameInterval: 3, // Process every other frame
        minDetectionConfidence: detectionConfidence, // Set initial confidence
      });

      await detector.initialize(hiddenRef.current);
      detector.start();
      notify("Detection started!", { type: "success" });

      detectorRef.current = detector;
    }
  };

  const stopDetection = async () => {
    if (detectorRef.current) {
      detectorRef.current?.stop();
      detectorRef.current = null;
    }
    if (hiddenRef.current?.srcObject) {
      const stream = hiddenRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      hiddenRef.current.srcObject = null;
    }
    cameraToggle(false);
    setSuccess(false);
    notify("Model stopped successfully!", { type: "success" });
  }

  const adjustMinDetectionConfidence = (newConfidence: number) => {
    setDetectionConfidence(newConfidence);
    if (detectorRef.current) {
      detectorRef.current.setMinDetectionConfidence(newConfidence);
    }
  };

  const adjustLookingAwayThreshold = (newThreshold: number) => {
    setLookingAwayThreshold(newThreshold);
    detectorRef.current?.setLookingAwayThreshold(newThreshold);
  };

  return (
    <div className="flex flex-col p-4 justify-center">
      <div className="flex justify-between space-x-4">
      <video ref={hiddenRef} autoPlay autoFocus controls width="350" />
      <Image src={detectorRef.current?.getDebug().canvas.toDataURL('image/png') || ""} alt="debugger" />
      <div className="flex flex-col items-start space-x-4">
      <div className="flex flex-row gap-1 items-center justify-center space-x-0">
        <Button variant={success ? 'danger': 'primary'} onClick={success ? stopDetection : startDetection} >
        {success ? ('Stop') : 'Start'} Detector
      </Button>
        <Button variant='transparent' onClick={() => {}} >
        <span className='py-1'>{cameraOn || success ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}</span>
      </Button>
        {/* <Button variant='danger' onClick={stopDetection} >
        Stop Detector
      </Button> */}
      </div>
        <RangeComponent
        min={0.1}
        max={1.0}
        value={detectionConfidence}
        onChange={adjustMinDetectionConfidence}
        label="Detection Confidence"
        additionalStyles="items-start mt-3"
      />
      <RangeComponent
        min={0.1}
        max={0.5}
        value={lookingAwayThreshold}
        onChange={adjustLookingAwayThreshold}
        label="Looking Away Threshold"
        additionalStyles="items-start"
      />
      </div>
      </div>

      <div className="flex flex-wrap space-x-10 mt-4">
        {Object.entries(violations).map(([type, violation], index) => (
          <Card key={type} className={`w-52 ${index !== 0 ? 'm-5' : 'mt-5 mb-5 ml-5'}`}>
            <CardHeader>{capitalizeTheFirstLetter(type.replaceAll('_', ' '))}</CardHeader>
            <CardContent>
              <p>Count: {violation.count}</p>
              <p>Last detected: {new Date(violation.timestamps[violation.timestamps.length - 1]).toLocaleString()}</p>
              {imageURLs[type] && <img src={imageURLs[type]} alt={`${type} snapshot`} width={180} height={140} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;