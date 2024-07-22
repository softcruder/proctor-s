import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import { FaceDetection, Results } from '@mediapipe/face_detection'
import { Camera } from '@mediapipe/camera_utils'

export interface Violation {
    type: string
    count: number
    lastSnapshot: HTMLCanvasElement | null
    timestamps: string[]
}

interface DetectionOptions {
    onViolation?: (violation: Violation) => void
    frameInterval?: number
}

function captureFrame(videoElement: HTMLVideoElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
}

class VideoDetector {
    private cocoModel: cocoSsd.ObjectDetection | null = null;
    private faceModel: FaceDetection | null = null;
    private camera: Camera | null = null;
    private isRunning = false;
    private options: DetectionOptions;
    private lastFaceDetectionResult: Results | null = null;
    private violations: { [key: string]: Violation} = {};

    constructor(options: DetectionOptions = {}) {
        this.options = {
            frameInterval: options.frameInterval || 1,
            onViolation: options.onViolation || (() => {})
        };
    }

    async initialize(videoElement: HTMLVideoElement): Promise<void> {
        this.cocoModel = await cocoSsd.load();
        this.faceModel = new FaceDetection({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        });

        this.faceModel.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5
        });

        await this.faceModel.initialize();

        this.faceModel.onResults((results: Results) => {
            this.lastFaceDetectionResult = results;
        });

        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                if (!this.isRunning) return;
                await this.faceModel!.send({image: videoElement});
                await this.processFrame(videoElement);
            },
        });
    }

    async start(): Promise<void> {
        if (!this.camera) throw new Error('VideoDetector not initialized');
        this.isRunning = true;
        await this.camera.start();
    }

    stop(): void {
        this.isRunning = false;
        this.camera?.stop();
    }

    private updateViolation(type: string, videoElement: HTMLVideoElement): void {
        if (!this.violations[type]) {
            this.violations[type] = {
                type,
                count: 0,
                lastSnapshot: null,
                timestamps: []
            };
        }

        this.violations[type].count++;
        this.violations[type].lastSnapshot = captureFrame(videoElement);
        this.violations[type].timestamps.push(new Date().toISOString());

        this.options.onViolation?.(this.violations[type]);
    }

    private async processFrame(videoElement: HTMLVideoElement): Promise<void> {
        if (!this.cocoModel || !this.lastFaceDetectionResult) return;

        const objects = await this.cocoModel.detect(videoElement);
        const faceDetections = this.lastFaceDetectionResult;

        // Check for object violations
        const checkObject = (className: string, violationType: string) => {
            if (objects.some(object => object.class === className)) {
                this.updateViolation(violationType, videoElement);
            }
        };

        checkObject('cell phone', 'phone_detected');
        checkObject('book', 'book_detected');
        checkObject('calculator', 'calculator_detected');

        // Check for face violations
        if (faceDetections.detections.length > 1) {
            this.updateViolation('multiple_faces', videoElement);
        } else if (faceDetections.detections.length === 1) {
            const face = faceDetections.detections[0];
            const { xCenter, yCenter } = face.boundingBox;
            if (xCenter < 0.3 || xCenter > 0.7 || yCenter < 0.3 || yCenter > 0.7) {
                this.updateViolation('user_looking_away', videoElement);
            }
        }

        // Clean up tensors
        tf.dispose(tf.stack(objects.map(obj => obj.bbox)));
    }

    getViolations(): { [key: string]: Violation } {
        return this.violations;
    }
}

export default VideoDetector;