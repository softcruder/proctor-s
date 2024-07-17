import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export const initializeTFBackend = async () => {
  try {
    await tf.setBackend('webgl');
    return { loaded: true };
  } catch (error) {
    console.error('Error setting TensorFlow backend:', error);
    return { loaded: false, error };
  }
};

export const loadCocoModel = async () => {
  try {
    const model = await cocoSsd.load();
    return { loaded: true, model };
  } catch (error) {
    console.error('Error loading object detection (COCO-SSD) model:', error);
    return { loaded: false, error };
  }
};

export const loadFaceModel = async () => {
  try {
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detector = await faceLandmarksDetection.createDetector(model, { runtime: 'tfjs', refineLandmarks: true });
    return { loaded: true, detector };
  } catch (error) {
    console.error('Error loading face model:', error);
    return { loaded: false, error };
  }
};

export const setupCamera = async (videoElement: HTMLVideoElement) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await videoElement.play();
    return { loaded: true, stream };
  } catch (error) {
    console.error('Error setting up camera:', error);
    return { loaded: false, error };
  }
};
