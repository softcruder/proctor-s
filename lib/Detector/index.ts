import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import { FaceLandmarker, FaceLandmarkerResult, FilesetResolver } from '@mediapipe/tasks-vision'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_FACE_OVAL, FACEMESH_LIPS, NormalizedLandmark } from '@mediapipe/face_mesh'

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

function drawBoundingBox(landmarks: NormalizedLandmark[], context: CanvasRenderingContext2D, isViolation: boolean) {
    const minX = Math.min(...landmarks.map(l => l.x));
    const maxX = Math.max(...landmarks.map(l => l.x));
    const minY = Math.min(...landmarks.map(l => l.y));
    const maxY = Math.max(...landmarks.map(l => l.y));

    const width = maxX - minX;
    const height = maxY - minY;

    context.strokeStyle = isViolation ? 'red' : 'green';
    context.lineWidth = 2;
    context.strokeRect(minX, minY, width, height);

    // Draw face center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    context.fillStyle = 'blue';
    context.beginPath();
    context.arc(centerX, centerY, 5, 0, 2 * Math.PI);
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
    private faceLandmarker: FaceLandmarker | null = null;
    private camera: Camera | null = null;
    private isRunning = false;
    private options: DetectionOptions;
    private lastFaceDetectionResult: FaceLandmarkerResult | null = null;
    private violations: { [key: string]: Violation} = {};
    private lookingAwayThreshold: number;
    private minDetectionConfidence: number;
    private debugCanvas: HTMLCanvasElement;
    private debugContext: CanvasRenderingContext2D | null;

    constructor(options: DetectionOptions = {}) {
        this.options = {
            frameInterval: options.frameInterval || 1,
            onViolation: options.onViolation || (() => {}),
            lookingAwayThreshold: options.lookingAwayThreshold || 0.23,
            minDetectionConfidence: options.minDetectionConfidence || 0.5
        };
        this.lookingAwayThreshold = this.options.lookingAwayThreshold || 0.23;
        this.minDetectionConfidence = this.options.minDetectionConfidence || 0.5;
        this.debugCanvas = document.createElement('canvas');
        this.debugContext = this.debugCanvas.getContext('2d');
    }

    async initialize(videoElement: HTMLVideoElement): Promise<void> {
        this.cocoModel = await cocoSsd.load();

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        });

        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                if (!this.isRunning) return;
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

    private isLookingAway(landmarks: NormalizedLandmark[]): boolean {
        const convertedLandmarks = Array.isArray(landmarks) ? landmarks.map(l => [l.x, l.y]) : landmarks;
        const minX = Math.min(...convertedLandmarks.map(l => l[0]));
        const maxX = Math.max(...convertedLandmarks.map(l => l[0]));
        const minY = Math.min(...convertedLandmarks.map(l => l[1]));
        const maxY = Math.max(...convertedLandmarks.map(l => l[1]));
    
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        const isTooLeft = centerX < this.lookingAwayThreshold * this.debugCanvas.width;
        const isTooRight = centerX > (1 - this.lookingAwayThreshold) * this.debugCanvas.width;
        const isTooHigh = centerY < this.lookingAwayThreshold * this.debugCanvas.height;
        const isTooLow = centerY > (1 - this.lookingAwayThreshold) * this.debugCanvas.height;
    
        return isTooLeft || isTooRight || isTooHigh || isTooLow;
    }

    private async processFrame(videoElement: HTMLVideoElement): Promise<void> {
        if (!this.cocoModel || !this.faceLandmarker || !this.debugContext) return;

        const objects = await this.cocoModel.detect(videoElement);
        this.lastFaceDetectionResult = this.faceLandmarker.detectForVideo(videoElement, performance.now());

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
        // if (this.lastFaceDetectionResult.faceLandmarks.length === 0) {
        //     this.updateViolation('no_face_detected', videoElement);
        //     this.debugContext.fillStyle = 'red';
        //     this.debugContext.font = '24px Arial';
        //     this.debugContext.fillText('No Face Detected', 10, 30);
        // } else
         if (this.lastFaceDetectionResult.faceLandmarks.length > 1) {
            this.updateViolation('multiple_faces', videoElement);
            this.debugContext.fillStyle = 'red';
            this.debugContext.font = '24px Arial';
            this.debugContext.fillText('Multiple Faces Detected', 10, 30);
        } else if (this.lastFaceDetectionResult.faceLandmarks.length === 1) {
            const landmarks = this.lastFaceDetectionResult.faceLandmarks[0];
            const isViolation = this.isLookingAway(landmarks);
            
            if (isViolation) {
                this.updateViolation('user_looking_away', videoElement);
            }
            
            // Draw face landmarks
            drawConnectors(this.debugContext, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
            drawConnectors(this.debugContext, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
            drawConnectors(this.debugContext, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
            drawConnectors(this.debugContext, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
            drawConnectors(this.debugContext, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
            drawConnectors(this.debugContext, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
            drawConnectors(this.debugContext, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });

            drawBoundingBox(landmarks, this.debugContext, isViolation);

            // Display face position information
            this.debugContext.fillStyle = 'white';
            this.debugContext.font = '16px Arial';
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