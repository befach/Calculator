'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface RadioCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  comingSoon?: boolean;
}

const RadioCard: React.FC<RadioCardProps> = ({
  title,
  description,
  icon,
  selected,
  disabled = false,
  onClick,
  comingSoon = false,
}) => {
  const isDisabled = disabled || comingSoon;

  return (
    <motion.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      whileHover={isDisabled ? {} : { y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 p-7 text-center
        transition-all duration-200
        ${
          selected
            ? 'border-brand-orange bg-brand-orange-light shadow-card-hover'
            : 'border-brand-border bg-white shadow-card hover:shadow-card-hover hover:border-brand-orange/30'
        }
        ${isDisabled ? 'pointer-events-auto cursor-not-allowed opacity-45' : ''}
      `}
      aria-pressed={selected}
      disabled={isDisabled}
    >
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full bg-brand-brown/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-brown/60">
          Coming Soon
        </span>
      )}

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 ${
          selected
            ? 'bg-brand-orange text-white'
            : 'bg-brand-cream-dark text-brand-brown/60'
        }`}
      >
        {icon}
      </div>

      <div>
        <h3
          className={`text-[16px] font-extrabold text-brand-brown transition-colors`}
        >
          {title}
        </h3>
        <p className="mt-1 text-[13px] text-brand-brown/65 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          selected
            ? 'border-brand-orange bg-brand-orange'
            : 'border-brand-brown/25 bg-white'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
    </motion.button>
  );
};

export default RadioCard;
