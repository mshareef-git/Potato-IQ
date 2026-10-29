import React from 'react';

export interface TimerBarProps {
  currentSeconds: number;
  totalSeconds: number;
  label?: string;
  className?: string;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  currentSeconds,
  totalSeconds,
  label,
  className = ''
}) => {
  const percentage = Math.max(0, Math.min(100, (currentSeconds / totalSeconds) * 100));
  const isUrgent = percentage <= 25;

  return (
    <div className={`w-full my-3 ${className}`}>
      <div className="flex justify-between items-center text-xs md:text-sm font-bold uppercase mb-1">
        <span>{label || 'TIME REMAINING'}</span>
        <span className={`font-mono px-2 py-0.5 border-2 border-current rounded ${isUrgent ? 'text-red-500 bg-red-100 dark:bg-red-950/40 animate-pulse' : ''}`}>
          {Math.ceil(currentSeconds)}s
        </span>
      </div>
      <div className="w-full h-5 bg-neutral-200 dark:bg-neutral-800 border-3 border-[var(--border-color)] rounded-md overflow-hidden p-0.5 shadow-[2px_2px_0px_var(--shadow-color)]">
        <div
          className={`h-full transition-all duration-200 rounded-sm ${
            isUrgent ? 'bg-[var(--red)]' : 'bg-[var(--yellow)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
