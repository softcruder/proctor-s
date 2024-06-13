// components/ViolationDetector.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/lib/Supabase/supabaseClient';

interface Violation {
  class: string;
  score: number;
  timestamp: string;
}

interface ViolationDetectorProps {
  testID: string;
  userID: string;
}

const ViolationDetector: React.FC<ViolationDetectorProps> = ({ testID, userID }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);

  useEffect(() => {
    // const loadModel = async () => {
    //   const loadedModel = await cocoSsd.load();
    //   setModel(loadedModel);
    // };

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    };

    loadModel();
    setupCamera();
  }, []);

  useEffect(() => {
    if (model && videoRef.current) {
      const detectFrame = async () => {
        if (videoRef.current) {
          const predictions = await model.detect(videoRef.current);
          if (predictions.length > 0) {
            const timestamp = new Date().toISOString();
            const newViolations = predictions.map((pred: { class: any; score: any; }) => ({
              class: pred.class,
              score: pred.score,
              timestamp
            }));
            setViolations(prev => [...prev, ...newViolations]);
          }
          requestAnimationFrame(detectFrame);
        }
      };

      detectFrame();
    }
  }, [model]);

  const handleSaveViolations = async () => {
    const { error } = await supabase.from('violations').insert(violations.map(violation => ({
      test_id: testID,
      user_id: userID,
      ...violation
    })));

    if (error) {
      console.error('Error saving violations:', error);
    } else {
      console.log('Violations saved successfully');
    }
  };

  return (
    <div>
      <video ref={videoRef} width="600" height="400" />
      <button onClick={handleSaveViolations}>Save Violations</button>
    </div>
  );
};

export default ViolationDetector;