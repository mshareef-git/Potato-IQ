import React from 'react';
import { DogeshAvatar } from './DogeshAvatar';

export interface DogeshBlockerProps {
  active: boolean;
  onDismiss: () => void;
}

export const DogeshBlocker: React.FC<DogeshBlockerProps> = ({ active, onDismiss }) => {
  if (!active) return null;

  return (
    <div
      onClick={onDismiss}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-[1px] animate-fade-in cursor-pointer select-none"
      title="Click anywhere to shoo Dogesh away!"
    >
      <div className="bg-[var(--pink)] text-white border-4 border-black p-4 rounded-xl shadow-[8px_8px_0px_#000] flex flex-col items-center gap-2 max-w-xs text-center animate-bounce-subtle">
        <DogeshAvatar state="smug" size={90} />
        <div className="font-heading text-sm uppercase">
          🚨 DOGESH INSPECTION IN PROGRESS 🚨
        </div>
        <p className="text-xs font-semibold text-pink-100">
          "I'm shielding you from your own bad decisions."
        </p>
        <span className="text-[10px] bg-black text-yellow-300 font-heading px-2 py-0.5 rounded border border-white">
          TAP TO SHOO AWAY (or wait 2s)
        </span>
      </div>
    </div>
  );
};
