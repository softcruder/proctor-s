"use client"
import React, { useEffect, useRef, useState } from 'react';
import { setupCamera } from '@/helpers';
import VideoDetector, { Violation } from '@/lib/Detector';

const Home = () => {
  const hiddenRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<string | MediaStream | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [violations, setViolations] = useState<{ [key: string]: Violation }>({});

  useEffect(() => {
    const initCamera = async () => {
      const { videoStream, success } = await setupCamera(hiddenRef);
      setVideoStream(videoStream);
      setSuccess(success);
    };

    initCamera();
  }, []); // Empty dependency array means this effect runs once on mount
  const detectorRef = useRef<VideoDetector | null>(null);

  useEffect(() => {
    if (hiddenRef.current && success) {
      const detector = new VideoDetector({
        onViolation: (violation) => {
          console.log('Violation detected:', violation);
          setViolations(prev => ({...prev, [violation.type]: violation}));
          // Handle violation (e.g., update UI, send to server)
        },
        frameInterval: 2 // Process every other frame
      });

      detector.initialize(hiddenRef.current).then(() => {
        detector.start();
      });

      detectorRef.current = detector;
    }

    return () => {
      // detectorRef.current?.stop();
    };
  }, [success]);

  return (
    <div>
      <video ref={hiddenRef} autoPlay autoFocus />
      {/* <video src={videoStream as string | undefined} ref={displayRef}></video> */}
      <div>
        {Object.entries(violations).map(([type, violation]) => (
          <div key={type}>
            <h3>{type}</h3>
            <p>Count: {violation.count}</p>
            <p>Last detected: {violation.timestamps[violation.timestamps.length - 1]}</p>
            {violation.lastSnapshot && <>{violation.lastSnapshot}</>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home
