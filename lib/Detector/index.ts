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
    if (context) {
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
}

function drawBoundingBox(face: Detection, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, isViolation: boolean) {
    const { xCenter, yCenter, width, height } = face.boundingBox;

    const x = (xCenter - width / 2) * canvas.width;
    const y = (yCenter - height / 2) * canvas.height;
    const w = width * canvas.width;
    const h = height * canvas.height;

    context.strokeStyle = isViolation ? 'red' : 'green';
    context.lineWidth = 2;
    context.strokeRect(x, y, w, h);

    // Draw face center
    context.fillStyle = 'blue';
    context.beginPath();
    context.arc(xCenter * canvas.width, yCenter * canvas.height, 5, 0, 2 * Math.PI);
    context.fill();
}

function drawThresholdLines(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, threshold: number) {
    context.strokeStyle = 'yellow';
    context.lineWidth = 1;
    context.setLineDash([5, 5]);

    // Vertical lines
    context.beginPath();
    context.moveTo(threshold * canvas.width, 0);
    context.lineTo(threshold * canvas.width, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo((1 - threshold) * canvas.width, 0);
    context.lineTo((1 - threshold) * canvas.width, canvas.height);
    context.stroke();

    // Horizontal lines
    context.beginPath();
    context.moveTo(0, threshold * canvas.height);
    context.lineTo(canvas.width, threshold * canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, (1 - threshold) * canvas.height);
    context.lineTo(canvas.width, (1 - threshold) * canvas.height);
    context.stroke();

    context.setLineDash([]);
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
    private debugCanvas: HTMLCanvasElement;
    private debugContext: CanvasRenderingContext2D | null;

    constructor(options: DetectionOptions = {}) {
        this.options = {
            frameInterval: options.frameInterval || 5,
            onViolation: options.onViolation || (() => {}),
            lookingAwayThreshold: options.lookingAwayThreshold || 0.3,
            minDetectionConfidence: options.minDetectionConfidence || 0.8
        };
        this.lookingAwayThreshold = this.options.lookingAwayThreshold || 0.23;
        this.minDetectionConfidence = this.options.minDetectionConfidence || 0.85;
        this.debugCanvas = document.createElement('canvas');
        this.debugContext = this.debugCanvas.getContext('2d');
    }

    async initialize(videoElement: HTMLVideoElement): Promise<void> {
        this.cocoModel = await cocoSsd.load();
        this.faceModel = new FaceDetection({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        });

        this.faceModel.setOptions({
            model: 'full',
            minDetectionConfidence: this.options.minDetectionConfidence || this.minDetectionConfidence,
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

        // Set up debug canvas
        this.debugCanvas.width = videoElement.videoWidth;
        this.debugCanvas.height = videoElement.videoHeight;
        document.body.appendChild(this.debugCanvas); // Append to body for debugging
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
        
        const isTooLeft = xCenter - width/2 < this.lookingAwayThreshold;
        const isTooRight = xCenter + width/2 > 1 - this.lookingAwayThreshold;
        const isTooHigh = yCenter - height/2 < this.lookingAwayThreshold;
        const isTooLow = yCenter + height/2 > 1 - this.lookingAwayThreshold;

        return isTooLeft || isTooRight || isTooHigh || isTooLow;
    }

    private async processFrame(videoElement: HTMLVideoElement): Promise<void> {
        if (!this.cocoModel || !this.lastFaceDetectionResult || !this.debugContext) return;

        const objects = await this.cocoModel.detect(videoElement);
        const faceDetections = this.lastFaceDetectionResult;

        // Clear the debug canvas
        this.debugContext.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

        // Draw the video frame on the debug canvas
        this.debugContext.drawImage(videoElement, 0, 0, this.debugCanvas.width, this.debugCanvas.height);

        // Draw threshold lines
        drawThresholdLines(this.debugContext, this.debugCanvas, this.lookingAwayThreshold);

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
            this.updateViolation('face_movement_detected', videoElement);
            this.debugContext.fillStyle = 'red';
            this.debugContext.font = '24px Arial';
            this.debugContext.fillText('No Face Detected', 10, 30);
        } else if (faceDetections.detections.length > 1) {
            this.updateViolation('multiple_faces', videoElement);
            this.debugContext.fillStyle = 'red';
            this.debugContext.font = '24px Arial';
            this.debugContext.fillText('Multiple Faces Detected', 10, 30);
        } else if (faceDetections.detections.length === 1) {
            const face = faceDetections.detections[0];
            const isViolation = this.isLookingAway(face);
            
            if (isViolation) {
                this.updateViolation('user_looking_away', videoElement);
            }
            
            drawBoundingBox(face, this.debugContext, this.debugCanvas, isViolation);

            // Display face position information
            this.debugContext.fillStyle = 'white';
            this.debugContext.font = '16px Arial';
            this.debugContext.fillText(`Face Center: (${face.boundingBox.xCenter.toFixed(2)}, ${face.boundingBox.yCenter.toFixed(2)})`, 10, 60);
            this.debugContext.fillText(`Face Size: ${face.boundingBox.width.toFixed(2)} x ${face.boundingBox.height.toFixed(2)}`, 10, 90);
            this.debugContext.fillText(`Looking Away: ${isViolation ? 'Yes' : 'No'}`, 10, 120);
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

    getDebug() {
        const debug = {
            context: this.debugContext,
            canvas: this.debugCanvas,
        }
        return debug;
    }
}

export default VideoDetector;
