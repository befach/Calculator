'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="flex w-full items-center justify-center">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;

        return (
          <React.Fragment key={label}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 ${
                  isCompleted
                    ? 'bg-[#F29222] text-white'
                    : isCurrent
                      ? 'bg-[#F29222] text-white ring-2 sm:ring-4 ring-[#F29222]/20'
                      : 'bg-[#E0E0E0] text-[#36271E]/40'
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-3.5 w-3.5 sm:h-5 sm:w-5"
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
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`max-w-[4.5rem] sm:max-w-[5rem] text-center text-[10px] sm:text-[11px] font-medium leading-tight ${
                  isCurrent
                    ? 'text-[#F29222]'
                    : isFuture
                      ? 'text-[#36271E]/30'
                      : 'text-[#36271E]/60'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`mx-1.5 sm:mx-2 mb-4 sm:mb-5 h-0.5 w-8 sm:w-20 flex-shrink-0 rounded-full transition-colors duration-200 ${
                  index < currentStep ? 'bg-[#F29222]' : 'bg-[#E0E0E0]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
