'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { safeStorage } from '@/storage/safeStorage';

const STORAGE_KEY = 'befach-calculator-walkthrough-hidden';
const VISIBILITY_EVENT = 'befach-walkthrough-visibility-change';

interface WalkthroughPanelProps {
  currentStep: number;
  title: string;
  descriptions: string[];
  mode?: 'panel' | 'toggle' | 'all';
  className?: string;
}

export default function WalkthroughPanel({
  currentStep,
  title,
  descriptions,
  mode = 'all',
  className = '',
}: WalkthroughPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(safeStorage.getItem(STORAGE_KEY) !== 'true');

    const handleVisibilityChange = () => {
      setIsVisible(safeStorage.getItem(STORAGE_KEY) !== 'true');
    };

    window.addEventListener(VISIBILITY_EVENT, handleVisibilityChange);

    return () => {
      window.removeEventListener(VISIBILITY_EVENT, handleVisibilityChange);
    };
  }, []);

  const notifyVisibilityChange = () => {
    window.dispatchEvent(new Event(VISIBILITY_EVENT));
  };

  const hideWalkthrough = () => {
    safeStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    notifyVisibilityChange();
  };

  const showWalkthrough = () => {
    safeStorage.removeItem(STORAGE_KEY);
    setIsVisible(true);
    notifyVisibilityChange();
  };

  const stepNumber = currentStep + 1;
  const description = descriptions[currentStep] ?? descriptions[0];

  return (
    <div className={className}>
      {(mode === 'panel' || mode === 'all') && isVisible && (
        <div className="mb-4 rounded-lg border border-brand-orange/20 bg-brand-orange/5 p-3">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-orange" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-brand-brown">
                    {title} - Step {stepNumber} of {descriptions.length}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={hideWalkthrough}
                  className="flex h-7 flex-shrink-0 items-center gap-1 rounded-md px-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-white hover:text-brand-orange"
                  aria-label="Skip walkthrough"
                >
                  Skip
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(mode === 'toggle' || mode === 'all') && (
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={isVisible ? hideWalkthrough : showWalkthrough}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-brand-orange"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {isVisible ? 'Hide walkthrough' : 'Show walkthrough'}
        </button>
      </div>
      )}
    </div>
  );
}
