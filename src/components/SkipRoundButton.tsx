import React from 'react';
import { FastForward } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { RoundId } from '../app/gameFlow';

export interface SkipRoundButtonProps {
  roundId: RoundId;
  disabled?: boolean;
}

export const SkipRoundButton: React.FC<SkipRoundButtonProps> = ({ roundId, disabled = false }) => {
  const skipRound = useGameStore((state) => state.skipRound);

  return (
    <button
      id="skip-round-btn"
      onClick={() => skipRound(roundId)}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-black hover:bg-[var(--pink)] hover:text-white transition-colors border-2 border-black shadow-[3px_3px_0px_#000] rounded text-xs md:text-sm font-heading disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      title="Coward's way out: skip this round"
    >
      <FastForward className="w-3.5 h-3.5" />
      <span>SKIP ROUND</span>
    </button>
  );
};
