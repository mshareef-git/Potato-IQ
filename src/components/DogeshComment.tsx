import React from 'react';

export interface DogeshCommentProps {
  comment: string;
  className?: string;
  position?: 'left' | 'right' | 'top';
}

export const DogeshComment: React.FC<DogeshCommentProps> = ({
  comment,
  className = '',
  position = 'left'
}) => {
  if (!comment) return null;

  return (
    <div
      className={`neo-speech-bubble px-3 py-2 text-xs md:text-sm max-w-[260px] animate-fade-in z-20 ${className}`}
    >
      <div className="font-heading text-[10px] text-yellow-200 uppercase tracking-wider mb-0.5">
        INSTRUCTOR DOGESH:
      </div>
      <div className="leading-tight text-white font-medium">
        "{comment}"
      </div>
    </div>
  );
};
