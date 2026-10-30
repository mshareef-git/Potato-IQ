import React from 'react';
import { DraggableGif, FloatingGifInstance } from './DraggableGif';

export interface FloatingGifManagerProps {
  instances: FloatingGifInstance[];
  onCloseGif: (instanceId: string) => void;
  onPositionChange: (instanceId: string, x: number, y: number) => void;
}

export const FloatingGifManager: React.FC<FloatingGifManagerProps> = ({
  instances,
  onCloseGif,
  onPositionChange,
}) => {
  if (!instances.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {instances.map((inst) => (
        <DraggableGif
          key={inst.instanceId}
          instance={inst}
          onClose={onCloseGif}
          onPositionChange={onPositionChange}
        />
      ))}
    </div>
  );
};
