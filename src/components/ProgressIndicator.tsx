import React from 'react';
import { SCORED_ROUND_IDS, RoundId } from '../app/gameFlow';

export interface ProgressIndicatorProps {
  currentRoundId: RoundId;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentRoundId }) => {
  const currentIndex = SCORED_ROUND_IDS.indexOf(currentRoundId) + 1;
  const total = SCORED_ROUND_IDS.length;

  return (
    <div className="flex items-center gap-2">
      <div className="bg-[var(--purple)] text-white px-3 py-1 font-heading text-xs md:text-sm border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] rounded">
        ROUND {currentIndex} OF {total}
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {SCORED_ROUND_IDS.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 border-2 border-[var(--border-color)] rounded-sm ${
              i + 1 < currentIndex
                ? 'bg-[var(--green)]'
                : i + 1 === currentIndex
                ? 'bg-[var(--yellow)] scale-110'
                : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
