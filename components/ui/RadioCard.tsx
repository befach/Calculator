'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-6 text-center
        transition-colors duration-150
        ${
          selected
            ? 'border-[#F29222] bg-[#F29222]/5'
            : 'border-[#E0E0E0] bg-white hover:border-[#F29222]/40'
        }
        ${isDisabled ? 'pointer-events-auto cursor-not-allowed opacity-50' : ''}
      `}
      aria-pressed={selected}
      disabled={isDisabled}
    >
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full bg-[#36271E]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#36271E]/60">
          Coming Soon
        </span>
      )}

      <div
        className={`text-3xl ${
          selected ? 'text-[#F29222]' : 'text-[#36271E]/40'
        } transition-colors`}
      >
        {icon}
      </div>

      <div>
        <h3
          className={`text-base font-semibold ${
            selected ? 'text-[#F29222]' : 'text-[#36271E]'
          } transition-colors`}
        >
          {title}
        </h3>
        <p className="mt-1 text-xs text-[#36271E]/50">{description}</p>
      </div>

      <div
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
          selected
            ? 'border-[#F29222] bg-[#F29222]'
            : 'border-[#E0E0E0] bg-white'
        }`}
      >
        {selected && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </motion.button>
  );
};

export default RadioCard;
