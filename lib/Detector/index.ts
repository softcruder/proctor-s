import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import * as faceDetection from '@mediapipe/face_detection'
import { Camera } from '@mediapipe/camera_utils'
// Define the structure of a violation
interface Violation {
    type: string; // Type of violation
    count: number; // Number of violations
    lastSnapshot: HTMLCanvasElement | null; // Last captured frame as a snapshot
    timestamps: number[]; // Timestamps of the violations
}

// Define the structure of the detection result
interface DetectionResult {
    violations: Violation[]; // Array of violations
    modelsStarted: boolean; // Flag indicating if the models have started
}

// Define the options for detection
interface DetectionOptions {
    onViolation?: (violation: Violation) => void; // Callback function for handling violations
    frameInterval?: number; // Interval between processing frames
}

// Define the structure of face detection results
interface FaceDetectionResult {
    detections: Array<{
        boundingBox: {
            xCenter: number;
            yCenter: number;
            width: number;
            height: number;
        };
        landmarks: Array<{ x: number; y: number }>;
        score: number[];
    }>;
}

// Function to capture a frame from a video element
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

// Class for video detection
class VideoDetector {
    private cocoModel: cocoSsd.ObjectDetection | null = null; // COCO-SSD object detection model
    private faceModel: faceDetection.FaceDetection | null = null; // Face detection model
    private camera: Camera | null = null; // Camera instance
    private isRunning = false; // Flag indicating if the detection is running
    private options: DetectionOptions; // Detection options

    constructor(options: DetectionOptions = {}) {
        this.options = {
            frameInterval: options.frameInterval || 1, // Process every frame by default
            onViolation: options.onViolation || (() => {}) // Empty callback function by default
        };
    }

    // Initialize the video detector
    async initialize(videoStream: HTMLVideoElement): Promise<void> {
        this.cocoModel = await cocoSsd.load(); // Load the COCO-SSD model
        this.faceModel = new faceDetection.FaceDetection({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        }); // Create a new face detection model
        this.faceModel.setOptions({ selfieMode: true, model: 'short', minDetectionConfidence: 0.5 }); // Set face detection options

        this.camera = new Camera(videoStream, {
            onFrame: async () => {
                if (!this.isRunning) return;
                await this.processFrame(videoStream); // Process each frame
            },
        }); // Create a camera instance with the video stream
    }

    // Start the video detection
    async start(): Promise<void> {
        if (!this.camera) throw new Error('VideoDetector not initialized');
        this.isRunning = true;
        await this.camera.start(); // Start the camera
    }

    // Stop the video detection
    stop(): void {
        this.isRunning = false;
        this.camera?.stop(); // Stop the camera
    }

    // Process a frame for object and face detection
    private async processFrame(videoStream: HTMLVideoElement): Promise<void> {
        if (!this.cocoModel || !this.faceModel) return;

        const objects = await this.cocoModel.detect(videoStream); // Detect objects in the frame
        const faceDetections = await this.faceModel.send({ image: videoStream }) as unknown as FaceDetectionResult; // Detect faces in the frame

        const violations: Violation[] = []; // Array to store violations

        // Check for object violations
        const checkObject = (className: string, violationType: string) => {
            if (objects.some(object => object.class === className)) {
                const violation: Violation = {
                    type: violationType,
                    count: 1,
                    lastSnapshot: captureFrame(videoStream),
                    timestamps: [Date.now()]
                };
                violations.push(violation);
                this.options.onViolation?.(violation); // Call the violation callback function
            }
        };

        checkObject('cell phone', 'phone_detected'); // Check for cell phone violation
        checkObject('book', 'book_detected'); // Check for book violation
        checkObject('laptop', 'laptop_detected'); // Check for calculator violation

        // Check for face violations
        if (faceDetections.detections.length > 1) {
            const violation: Violation = {
                type: 'multiple_faces',
                count: 1,
                lastSnapshot: captureFrame(videoStream),
                timestamps: [Date.now()]
            };
            violations.push(violation);
            this.options.onViolation?.(violation); // Call the violation callback function
        } else if (faceDetections.detections.length === 1) {
            const face = faceDetections.detections[0];
            const { xCenter, yCenter } = face.boundingBox;
            if (xCenter < 0.3 || xCenter > 0.7 || yCenter < 0.3 || yCenter > 0.7) {
                const violation: Violation = {
                    type: 'user_looking_away',
                    count: 1,
                    lastSnapshot: captureFrame(videoStream),
                    timestamps: [Date.now()]
                };
                violations.push(violation);
                this.options.onViolation?.(violation); // Call the violation callback function
            }
        }

        // Clean up tensors
        tf.dispose(tf.stack(objects.map(obj => obj.bbox)));
    }
}

export default VideoDetector; // Export the VideoDetector class