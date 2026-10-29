import React from 'react';

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'normal' | 'large';
  tilt?: 'none' | 'left' | 'right';
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  size = 'normal',
  tilt = 'none',
  className = '',
  ...props
}) => {
  const cardClass = size === 'large' ? 'neo-card-lg' : 'neo-card';
  const tiltClass = tilt === 'left' ? '-rotate-1' : tilt === 'right' ? 'rotate-1' : '';

  return (
    <div className={`${cardClass} ${tiltClass} p-5 md:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
};
