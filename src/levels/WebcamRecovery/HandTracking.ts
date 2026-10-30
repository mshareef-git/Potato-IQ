import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandTrackingStatus } from './types';

export interface HandFrameState {
  hasHand: boolean;
  boardNormX: number; // 0..1
  boardNormY: number; // 0..1
  isPinching: boolean;
  pinchRatio: number;
  fps: number;
}

export type HandStatusListener = (status: HandTrackingStatus, errorMsg?: string) => void;

class HandTrackingService {
  private landmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private isRunning = false;
  private isDetecting = false;
  private animFrameId: number | null = null;
  private lastTimestamp = -1;
  private lastInferenceTime = 0;
  private smoothedX = 0.5;
  private smoothedY = 0.5;
  private isPinching = false;
  private lastStatus: HandTrackingStatus = 'not-started';

  // Frame state read directly by canvas renderer without React overhead
  private currentState: HandFrameState = {
    hasHand: false,
    boardNormX: 0.5,
    boardNormY: 0.5,
    isPinching: false,
    pinchRatio: 1,
    fps: 0,
  };

  // FPS tracking
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  private currentFps = 0;
  public lastError: string | null = null;

  getCurrentState(): HandFrameState {
    return this.currentState;
  }

  getStatus(): HandTrackingStatus {
    return this.lastStatus;
  }

  async initialize(onStatusChange?: HandStatusListener): Promise<boolean> {
    if (this.landmarker) {
      this.lastStatus = 'ready';
      onStatusChange?.('ready');
      return true;
    }
    if (this.isInitializing) return false;

    this.isInitializing = true;
    this.lastStatus = 'loading';
    this.lastError = null;
    onStatusChange?.('loading');

    try {
      let fileset;
      try {
        fileset = await FilesetResolver.forVisionTasks('/wasm');
      } catch (err) {
        console.warn('Local /wasm load failed, using CDN fallback:', err);
        fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      }

      // Try GPU delegate, fallback to CPU delegate
      try {
        this.landmarker = await HandLandmarker.createFromOptions(fileset, {
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
        console.warn('GPU delegate failed for HandLandmarker, trying CPU delegate:', gpuError);
        this.landmarker = await HandLandmarker.createFromOptions(fileset, {
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
      }

      this.isInitializing = false;
      this.lastStatus = 'ready';
      onStatusChange?.('ready');
      return true;
    } catch (finalError: any) {
      console.error('MediaPipe HandLandmarker initialization failed:', finalError);
      this.isInitializing = false;
      this.lastStatus = 'error';
      this.lastError = finalError?.message || 'Failed to load hand tracking model.';
      onStatusChange?.('error', this.lastError || undefined);
      return false;
    }
  }

  start(video: HTMLVideoElement, onStatusChange?: HandStatusListener) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = -1;
    this.lastInferenceTime = 0;
    this.frameCount = 0;
    this.lastFpsUpdateTime = performance.now();

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      // Throttle inference to ~30 FPS (every 33ms) so frame processing is lightweight
      if (
        this.landmarker &&
        !this.isDetecting &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        timestamp - this.lastInferenceTime >= 33
      ) {
        this.isDetecting = true;
        this.lastInferenceTime = timestamp;

        try {
          const now = Math.max(timestamp, this.lastTimestamp + 1);
          this.lastTimestamp = now;

          const results = this.landmarker.detectForVideo(video, now);

          // Update FPS
          this.frameCount++;
          if (timestamp - this.lastFpsUpdateTime >= 1000) {
            this.currentFps = Math.round(
              (this.frameCount * 1000) / (timestamp - this.lastFpsUpdateTime)
            );
            this.frameCount = 0;
            this.lastFpsUpdateTime = timestamp;
          }

          if (results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0];
            const wrist = hand[0];
            const thumbTip = hand[4];
            const indexTip = hand[8];
            const middleMcp = hand[9];

            // Mirrored horizontal coordinates (1 - indexTip.x)
            const rawMirroredX = 1 - indexTip.x;
            const rawY = indexTip.y;

            // Comfortable reach margin (center 84% maps to full board)
            const margin = 0.08;
            const clampedX = Math.max(margin, Math.min(1 - margin, rawMirroredX));
            const clampedY = Math.max(margin, Math.min(1 - margin, rawY));
            const targetNormX = (clampedX - margin) / (1 - 2 * margin);
            const targetNormY = (clampedY - margin) / (1 - 2 * margin);

            // Smoothing filter (alpha = 0.45)
            const alpha = 0.45;
            this.smoothedX = this.smoothedX + alpha * (targetNormX - this.smoothedX);
            this.smoothedY = this.smoothedY + alpha * (targetNormY - this.smoothedY);

            // Pinch calculation relative to palm size
            const pinchDist = Math.hypot(
              thumbTip.x - indexTip.x,
              thumbTip.y - indexTip.y
            );
            const palmScale = Math.max(
              0.04,
              Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y)
            );
            const pinchRatio = pinchDist / palmScale;

            // Hysteresis thresholds
            if (!this.isPinching && pinchRatio < 0.38) {
              this.isPinching = true;
            } else if (this.isPinching && pinchRatio > 0.52) {
              this.isPinching = false;
            }

            this.currentState = {
              hasHand: true,
              boardNormX: Math.max(0, Math.min(1, this.smoothedX)),
              boardNormY: Math.max(0, Math.min(1, this.smoothedY)),
              isPinching: this.isPinching,
              pinchRatio,
              fps: this.currentFps,
            };

            const newStatus = this.isPinching ? 'pinching' : 'hand-detected';
            if (this.lastStatus !== newStatus) {
              this.lastStatus = newStatus;
              onStatusChange?.(newStatus);
            }
          } else {
            // Hand not detected in this frame
            this.isPinching = false;
            this.currentState = {
              hasHand: false,
              boardNormX: this.smoothedX,
              boardNormY: this.smoothedY,
              isPinching: false,
              pinchRatio: 1,
              fps: this.currentFps,
            };

            if (this.lastStatus !== 'no-hand') {
              this.lastStatus = 'no-hand';
              onStatusChange?.('no-hand');
            }
          }
        } catch (err: any) {
          console.debug('HandLandmarker inference warning:', err);
        } finally {
          this.isDetecting = false;
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    this.isDetecting = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  dispose() {
    this.stop();
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // ignore
      }
      this.landmarker = null;
    }
    this.isInitializing = false;
    this.lastStatus = 'not-started';
    this.currentState = {
      hasHand: false,
      boardNormX: 0.5,
      boardNormY: 0.5,
      isPinching: false,
      pinchRatio: 1,
      fps: 0,
    };
  }

  get isReady(): boolean {
    return this.landmarker !== null;
  }
}

export const handTracking = new HandTrackingService();
