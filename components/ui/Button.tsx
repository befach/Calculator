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
    'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-5 sm:px-7 py-2.5 sm:py-3 text-[13px] sm:text-sm font-extrabold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<string, string> = {
    primary:
      'bg-brand-orange text-white hover:bg-brand-orange-dark focus:ring-brand-orange/40 shadow-sm hover:shadow-md',
    secondary:
      'bg-brand-brown text-white hover:bg-brand-brown-light focus:ring-brand-brown/40 shadow-sm hover:shadow-md',
    outline:
      'border-2 border-brand-border bg-white text-brand-brown hover:border-brand-orange hover:text-brand-orange focus:ring-brand-orange/40',
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
