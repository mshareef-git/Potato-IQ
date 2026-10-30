import React from 'react';
import { DogeshAvatar } from './DogeshAvatar';
import { Shield } from 'lucide-react';

export interface DogeshBlockerProps {
  active: boolean;
  onDismiss: () => void;
  position?: 'bottom-center' | 'right-edge' | 'center-right';
}

export const DogeshBlocker: React.FC<DogeshBlockerProps> = ({
  active,
  onDismiss,
  position = 'bottom-center',
}) => {
  if (!active) return null;

  const positionClasses = {
    'bottom-center': 'fixed bottom-16 left-1/2 -translate-x-1/2',
    'right-edge': 'fixed right-8 bottom-28',
    'center-right': 'fixed right-12 top-1/2 -translate-y-1/2',
  }[position];

  return (
    <div
      onClick={onDismiss}
      className={`z-30 pointer-events-auto cursor-pointer select-none animate-slide-down ${positionClasses}`}
      title="Dogesh is blocking with his shield! (Click to push away)"
    >
      <div className="bg-[var(--purple)] text-white border-4 border-black p-3 rounded-2xl shadow-[6px_6px_0px_#000] flex items-center gap-3 max-w-sm">
        <DogeshAvatar state="guard" size={85} allowPunch={true} />
        <div className="space-y-1 pr-1">
          <div className="flex items-center gap-1 text-[var(--yellow)] font-heading text-xs tracking-wide uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>SHIELD FORWARD!</span>
          </div>
          <p className="text-xs font-bold leading-tight text-purple-100">
            "HALT! Royal barrier engaged. Contemplate your choices."
          </p>
          <div className="text-[10px] text-yellow-300 font-bold uppercase underline">
            [ Click to push Dogesh away ]
          </div>
        </div>
      </div>
    </div>
  );
};
