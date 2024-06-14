import * as tf from '@tensorflow/tfjs';

let model: tf.GraphModel | null = null;

export const loadModel = async (): Promise<void> => {
  model = await tf.loadGraphModel('/public/models/model.json');
};

export const predict = async (image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, model: tf.GraphModel | null): Promise<tf.Tensor> => {
  if (!model) {
    await loadModel();
  }

  const tensor = tf.browser.fromPixels(image).resizeBilinear([224, 224]).expandDims(0).toFloat();
  const predictions = model!.predict(tensor) as tf.Tensor;  // Use non-null assertion since we ensure model is loaded
  return predictions;
};