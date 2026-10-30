export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'stream-ready'
  | 'video-ready'
  | 'permission-denied'
  | 'camera-not-found'
  | 'camera-busy'
  | 'overconstrained'
  | 'unsupported'
  | 'playback-failed'
  | 'error';

export type HandTrackingStatus =
  | 'not-started'
  | 'loading'
  | 'ready'
  | 'no-hand'
  | 'hand-detected'
  | 'pinching'
  | 'error';

export type InputMode = 'hand' | 'mouse';

export interface CameraErrorInfo {
  name: string;
  message: string;
  origin: string;
  isSecureContext: boolean;
  status: CameraStatus;
}

export interface HandTrackingDebugInfo {
  hasHand: boolean;
  x: number;
  y: number;
  isPinching: boolean;
  pinchDistance: number;
  selectedTile: number | null;
  fps: number;
  detectorReady: boolean;
  cameraStatus: CameraStatus;
  handStatus: HandTrackingStatus;
  trackInfo?: {
    label: string;
    readyState: string;
    muted: boolean;
    enabled: boolean;
    width?: number;
    height?: number;
    frameRate?: number;
  };
  videoInfo?: {
    readyState: number;
    videoWidth: number;
    videoHeight: number;
    paused: boolean;
  };
}
