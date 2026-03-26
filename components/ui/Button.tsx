'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<string, string> = {
    primary:
      'bg-[#F29222] text-white hover:bg-[#C47518] focus:ring-[#F29222]/50',
    secondary:
      'bg-[#36271E] text-white hover:bg-[#36271E]/80 focus:ring-[#36271E]/50',
    outline:
      'border-2 border-[#E0E0E0] bg-transparent text-[#36271E] hover:border-[#F29222] hover:text-[#F29222] focus:ring-[#F29222]/50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
