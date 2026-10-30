export type WebcamRecoveryState =
  | 'intro'
  | 'permission-error'
  | 'framing'
  | 'calibrating'
  | 'puzzle'
  | 'completed';

export type InputMode = 'hand' | 'mouse';

export interface PuzzleTileData {
  id: number;
  originalIndex: number;
  currentPosition: number;
  dataUrl: string;
}

export interface HandCoords {
  x: number; // 0..1 normalized mirrored (0=left, 1=right)
  y: number; // 0..1 normalized (0=top, 1=bottom)
  isPinching: boolean;
  pinchDistance: number;
  hasHand: boolean;
}

export type CameraErrorType =
  | 'denied'
  | 'not-found'
  | 'in-use'
  | 'unsupported'
  | 'insecure'
  | 'model-error';

export interface CameraErrorInfo {
  type: CameraErrorType;
  message: string;
}
