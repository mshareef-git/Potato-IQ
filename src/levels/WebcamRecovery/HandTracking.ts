import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandCoords } from './types';

export type HandFrameCallback = (coords: HandCoords) => void;

class HandTrackingService {
  private landmarker: HandLandmarker | null = null;
  private animFrameId: number | null = null;
  private isRunning = false;
  private lastVideoTime = -1;
  private isPinching = false;
  private smoothedX = 0.5;
  private smoothedY = 0.5;
  private hasDetectedOnce = false;

  /**
   * Initializes the HandLandmarker instance.
   * Tries local /wasm and /models/hand_landmarker.task first, then falls back to CDN.
   */
  async initialize(): Promise<void> {
    if (this.landmarker) return;

    let visionFileset;
    try {
      // 1. Try local wasm
      visionFileset = await FilesetResolver.forVisionTasks('/wasm');
    } catch (err) {
      console.warn('Local /wasm load failed, falling back to CDN:', err);
      visionFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
    }

    // Try GPU delegate, fallback to CPU
    try {
      this.landmarker = await HandLandmarker.createFromOptions(visionFileset, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (gpuError) {
      console.warn('GPU delegate failed, trying CPU / remote model:', gpuError);
      try {
        this.landmarker = await HandLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (localCpuError) {
        console.warn('Local model failed, trying remote model asset:', localCpuError);
        this.landmarker = await HandLandmarker.createFromOptions(visionFileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }
    }
  }

  /**
   * Starts video frame inference loop.
   */
  start(video: HTMLVideoElement, onFrame: HandFrameCallback): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPinching = false;

    const processFrame = () => {
      if (!this.isRunning) return;

      if (
        this.landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== this.lastVideoTime
      ) {
        this.lastVideoTime = video.currentTime;
        const now = performance.now();

        try {
          const results = this.landmarker.detectForVideo(video, now);

          if (results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0];
            this.hasDetectedOnce = true;

            // Landmark indices
            // 0: Wrist
            // 4: Thumb tip
            // 8: Index fingertip
            // 9: Middle MCP
            const wrist = hand[0];
            const thumbTip = hand[4];
            const indexTip = hand[8];
            const middleMcp = hand[9];

            // Mirrored horizontal mapping:
            // Since preview is scaleX(-1), moving hand right in real life moves mirrored X right
            const rawMirroredX = 1 - indexTip.x;
            const rawY = indexTip.y;

            // Smoothing filter (alpha = 0.45)
            const alpha = 0.45;
            this.smoothedX = this.smoothedX + alpha * (rawMirroredX - this.smoothedX);
            this.smoothedY = this.smoothedY + alpha * (rawY - this.smoothedY);

            // Pinch calculation normalized by hand scale (wrist to middle MCP distance)
            const pinchPixelDist = Math.hypot(
              thumbTip.x - indexTip.x,
              thumbTip.y - indexTip.y
            );
            const handScale = Math.max(
              0.04,
              Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y)
            );
            const normalizedPinch = pinchPixelDist / handScale;

            // Hysteresis thresholds
            if (!this.isPinching && normalizedPinch < 0.38) {
              this.isPinching = true;
            } else if (this.isPinching && normalizedPinch > 0.52) {
              this.isPinching = false;
            }

            onFrame({
              x: Math.max(0, Math.min(1, this.smoothedX)),
              y: Math.max(0, Math.min(1, this.smoothedY)),
              isPinching: this.isPinching,
              pinchDistance: normalizedPinch,
              hasHand: true,
            });
          } else {
            // Hand lost
            if (this.isPinching) {
              this.isPinching = false;
            }
            onFrame({
              x: this.smoothedX,
              y: this.smoothedY,
              isPinching: false,
              pinchDistance: 1,
              hasHand: false,
            });
          }
        } catch (err) {
          // Log non-fatal frame detection error
          console.debug('HandLandmarker inference warning:', err);
        }
      }

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.animFrameId = requestAnimationFrame(processFrame);
  }

  /**
   * Pauses the loop without disposing of the model.
   */
  stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Completely stops and cleans up MediaPipe instance.
   */
  dispose(): void {
    this.stop();
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // ignore
      }
      this.landmarker = null;
    }
    this.hasDetectedOnce = false;
  }

  get hasEverDetected(): boolean {
    return this.hasDetectedOnce;
  }
}

export const handTracking = new HandTrackingService();
