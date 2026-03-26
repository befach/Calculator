'use client';

import React from 'react';

interface ComingSoonProps {
  title: string;
  message: string;
  onBack: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, message, onBack }) => {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[#E0E0E0] bg-[#F4F4F4] p-8 text-center">
      {/* Info icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#36271E]/10">
        <svg
          className="h-7 w-7 text-[#36271E]/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-xl font-bold text-[#36271E]">{title}</h2>
      <p className="mb-6 text-sm leading-relaxed text-[#36271E]/60">
        {message}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-[#E0E0E0] bg-white px-5 py-2.5 text-sm font-semibold text-[#36271E] transition-colors hover:border-[#F29222] hover:text-[#F29222]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Go Back
      </button>
    </div>
  );
};

export default ComingSoon;
