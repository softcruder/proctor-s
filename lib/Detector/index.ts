import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import { Detection, FaceDetection, Results } from '@mediapipe/face_detection'
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
    lookingAwayThreshold?: number
    minDetectionConfidence?: number
}

function captureFrame(videoElement: HTMLVideoElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    let blobUrl = "";
    if (context) {
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }
    // canvas.toBlob(blob => {
    //     if (blob) {
    //         const newImageURLs = URL.createObjectURL(blob);
    //         // setImageURLs(prevImageURLs => ({ ...prevImageURLs, ...newImageURLs }));
    //         blobUrl = newImageURLs;
    //     }})
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
    private lookingAwayThreshold: number;
    private minDetectionConfidence: number;
    // private setLookingAwayThreshold: () => {}

    constructor(options: DetectionOptions = {}) {
        this.options = {
            frameInterval: options.frameInterval || 1,
            onViolation: options.onViolation || (() => {}),
            lookingAwayThreshold: options.lookingAwayThreshold || 0.3,
            minDetectionConfidence: options.minDetectionConfidence || 0.8
        };
        this.lookingAwayThreshold = this.options.lookingAwayThreshold || 0.25;
        this.minDetectionConfidence = this.options.minDetectionConfidence || 0.8;
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

    private isLookingAway(face: Detection): boolean {
        const { xCenter, yCenter, width, height } = face.boundingBox;
        
        // Check if the face is too close to the edges of the frame
        const isTooLeft = xCenter - width/2 < this.lookingAwayThreshold;
        const isTooRight = xCenter + width/2 > 1 - this.lookingAwayThreshold;
        const isTooHigh = yCenter - height/2 < this.lookingAwayThreshold;
        const isTooLow = yCenter + height/2 > 1 - this.lookingAwayThreshold;

        return isTooLeft || isTooRight || isTooHigh || isTooLow;
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
        if (faceDetections.detections.length < 1) {
            this.updateViolation('no_face detected', videoElement);
        } else if (faceDetections.detections.length > 1) {
            this.updateViolation('multiple_faces', videoElement);
        } else if (faceDetections.detections.length === 1) {
            const face = faceDetections.detections[faceDetections.detections.length - 1];
            // const { xCenter, yCenter } = face.boundingBox;
            // if (xCenter < 0.3 || xCenter > 0.7 || yCenter < 0.3 || yCenter > 0.7) {
            //     this.updateViolation('user_looking_away', videoElement);
            // }
            if (this.isLookingAway(face)) {
                this.updateViolation('user_looking_away', videoElement);
            }
            // console.log(face.landmarks)
        }

        // Clean up tensors
        objects.forEach((obj) => tf.dispose(obj.bbox));
    }

    getViolations(): { [key: string]: Violation } {
        return this.violations;
    }

    setLookingAwayThreshold(threshold: number): void {
        this.lookingAwayThreshold = threshold;
    }

    setMinDetectionConfidence(confidence: number): void {
        this.minDetectionConfidence = confidence;
    }
    
    getDetectionConfidence() {
        return this.minDetectionConfidence;
    }

}

export default VideoDetector;