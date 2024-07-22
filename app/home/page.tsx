"use client"
import React, { useEffect, useRef, useState } from 'react';
import { setupCamera } from '@/helpers';
import VideoDetector, { Violation } from '@/lib/Detector';
import { capitalizeTheFirstLetter } from '@/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card/card';
import { useUtilsContext } from '@/context/UtilsContext';
import RangeComponent from '@/components/ui/Range/index';

const Home = () => {
  const { notify } = useUtilsContext();
  const hiddenRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<string | MediaStream | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [violations, setViolations] = useState<{ [key: string]: Violation }>({});
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0.85); // Default confidence value
  const [lookingAwayThreshold, setLookingAwayThreshold] = useState<number>(0.3);

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

  const callNotify = (text: string, type: string, description: string) => {
    notify(text, { type, description });
  };

  useEffect(() => {
    const initCamera = async () => {
      const { videoStream, success } = await setupCamera(hiddenRef);
      setVideoStream(videoStream);
      setSuccess(success);
    };

    initCamera();
  }, []);

  const detectorRef = useRef<VideoDetector | null>(null);

  useEffect(() => {
    if (hiddenRef.current && success) {
      const detector = new VideoDetector({
        onViolation: (violation) => {
          // console.log('Violation detected:', violation);
          setViolations(prev => ({ ...prev, [violation.type]: violation }));
          notify("Violation Detected!", { description: capitalizeTheFirstLetter(violation.type.replaceAll('_', ' ')) });
        },
        frameInterval: 2, // Process every other frame
        minDetectionConfidence: detectionConfidence, // Set initial confidence
      });

      detector.initialize(hiddenRef.current).then(() => {
        detector.start();
        notify("Detection started!", { type: "success" });
      });

      detectorRef.current = detector;
    }

    return () => {
      detectorRef.current?.stop();
    };
  }, [notify, success, detectionConfidence]);

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
    <div className="p-4 justify-center">
      <video ref={hiddenRef} autoPlay autoFocus width="350" />
      <div className="flex flex-wrap space-x-2 mt-4">
        {Object.entries(violations).map(([type, violation]) => (
          <Card key={type} className="w-72 m-5">
            <CardHeader>{capitalizeTheFirstLetter(type.replaceAll('_', ' '))}</CardHeader>
            <CardContent>
              <p>Count: {violation.count}</p>
              <p>Last detected: {new Date(violation.timestamps[violation.timestamps.length - 1]).toLocaleString()}</p>
              {imageURLs[type] && <img src={imageURLs[type]} alt={`${type} snapshot`} width={180} height={140} />}
            </CardContent>
          </Card>
        ))}
      </div>
      <RangeComponent
        min={0.1}
        max={1.0}
        value={detectionConfidence}
        onChange={adjustMinDetectionConfidence}
        label="Detection Confidence"
        additionalStyles="mt-6"
      />
      <RangeComponent
        min={0.1}
        max={0.5}
        value={lookingAwayThreshold}
        onChange={adjustLookingAwayThreshold}
        label="Detection Confidence"
        additionalStyles="mt-6"
      />
    </div>
  );
};

export default Home;
