import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import * as faceDetection from '@mediapipe/face_detection'
import { Camera } from '@mediapipe/camera_utils'

interface Violation {
	type: string
	count: number
	lastSnapshot: HTMLCanvasElement | null
	timestamps: number[]
}

interface DetectionResult {
	violations: Violation[]
	modelsStarted: boolean
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

async function detect(videoStream: HTMLVideoElement): Promise<DetectionResult> {
	const cocoModel = await cocoSsd.load()
	const faceModel = new faceDetection.FaceDetection({
		locateFile: (file: any) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
	})
	faceModel.setOptions({ model: 'short', minDetectionConfidence: 0.5 })

	let violations: Violation[] = []
	let modelsStarted = false
	let violationCounts = {
		phoneDetected: 0,
		booksDetected: 0,
		calculatorDetected: 0,
		multipleFaces: 0,
		userLookingAway: 0
	}
	let lastSnapshots = {
		phoneDetected: null as HTMLCanvasElement | null,
		booksDetected: null as HTMLCanvasElement | null,
		calculatorDetected: null as HTMLCanvasElement | null,
		multipleFaces: null as HTMLCanvasElement | null,
		userLookingAway: null as HTMLCanvasElement | null
	}
	let violationTimestamps = {
		phoneDetected: [] as number[],
		booksDetected: [] as number[],
		calculatorDetected: [] as number[],
		multipleFaces: [] as number[],
		userLookingAway: [] as number[]
	}

	let frameCounter = 0
	const FRAME_SKIP = 3 // Process every 3rd frame

	const camera = new Camera(videoStream, {
		onFrame: async () => {
			frameCounter++
			if (frameCounter % FRAME_SKIP !== 0) return

			const detections: any = await faceModel.send({ image: videoStream })
			const objects = await cocoModel.detect(videoStream)

			modelsStarted = true
            // const now = new Date().toISOString()

			// Detect phone
			const phoneDetected = objects.some(object => object.class === 'cell phone')
			const booksDetected = objects.some(object => object.class === 'cell phone')
			const calculatorDetected = objects.some(object => object.class === 'cell phone')
			if (phoneDetected) {
				violationCounts.phoneDetected++
				lastSnapshots.phoneDetected = captureFrame(videoStream)
				violationTimestamps.phoneDetected.push(Date.now())
			}
			if (booksDetected) {
				violationCounts.booksDetected++
				lastSnapshots.booksDetected = captureFrame(videoStream)
				violationTimestamps.booksDetected.push(Date.now())
			}
			if (calculatorDetected) {
				violationCounts.calculatorDetected++
				lastSnapshots.calculatorDetected = captureFrame(videoStream)
				violationTimestamps.calculatorDetected.push(Date.now())
			}
            // if (['cell phone', 'books', 'foreign object', 'phone', 'calculator', 'hand'].includes(pred.class)) {
            //     externalDeviceDetected = true;
            //     setViolations(prev => [...prev, {
            //       class: pred.class,
            //       score: pred.score,
            //       timestamp,
            //       updated_at: timestamp,
            //     }]);
            //   }

			// Detect multiple faces
			if (detections.length > 1) {
				violationCounts.multipleFaces++
				lastSnapshots.multipleFaces = captureFrame(videoStream)
				violationTimestamps.multipleFaces.push(Date.now())
			}

			// Detect user looking away
			if (detections.length === 1) {
				const face = detections[0]
				const { xCenter, yCenter } = face.landmarks[0]
				const isLookingAway = xCenter < 0.3 || xCenter > 0.7 || yCenter < 0.3 || yCenter > 0.7

				if (isLookingAway) {
					violationCounts.userLookingAway++
					lastSnapshots.userLookingAway = captureFrame(videoStream);
					violationTimestamps.userLookingAway.push(Date.now())
				}
			}

			// Dispose tensors properly
			tf.dispose(tf.stack(objects.map(obj => obj.bbox)))
			tf.dispose(detections)
		}
	})

	camera.start()

	return new Promise<DetectionResult>((resolve) => {
		// Continuously check for violations
		setInterval(() => {
			violations = [
				{
					type: 'phone_detected',
					count: violationCounts.phoneDetected,
					lastSnapshot: lastSnapshots.phoneDetected,
					timestamps: violationTimestamps.phoneDetected
				},
				{
					type: 'book_detected',
					count: violationCounts.booksDetected,
					lastSnapshot: lastSnapshots.booksDetected,
					timestamps: violationTimestamps.booksDetected
				},
				{
					type: 'calculator_detected',
					count: violationCounts.calculatorDetected,
					lastSnapshot: lastSnapshots.calculatorDetected,
					timestamps: violationTimestamps.calculatorDetected
				},
				{
					type: 'multiple_faces',
					count: violationCounts.multipleFaces,
					lastSnapshot: lastSnapshots.multipleFaces,
					timestamps: violationTimestamps.multipleFaces
				},
				{
					type: 'user_looking_away',
					count: violationCounts.userLookingAway,
					lastSnapshot: lastSnapshots.userLookingAway,
					timestamps: violationTimestamps.userLookingAway
				}
			]

			if (modelsStarted) {
				resolve({ violations, modelsStarted })
			}
		}, 1000)
	})
}

export default detect;