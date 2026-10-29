import React from 'react';

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'pink' | 'purple' | 'green' | 'white' | 'red';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm md:text-base font-bold',
    lg: 'px-7 py-3 text-base md:text-lg font-extrabold'
  }[size];

  const variantClass = `neo-btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`neo-btn ${variantClass} ${sizeClasses} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
