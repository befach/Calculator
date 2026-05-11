'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, X } from 'lucide-react';
import { safeStorage } from '@/storage/safeStorage';

const STORAGE_KEY = 'befach-calculator-walkthrough-hidden';

export interface WalkthroughStep {
  targetId: string;
  calculatorStep: number;
  title: string;
  body: string;
}

interface WalkthroughPanelProps {
  steps: WalkthroughStep[];
  currentCalculatorStep: number;
  onCalculatorStepChange: (step: number) => void;
  className?: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function WalkthroughPanel({
  steps,
  currentCalculatorStep,
  onCalculatorStepChange,
  className = '',
}: WalkthroughPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const activeStep = steps[activeIndex];

  useEffect(() => {
    setIsOpen(safeStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  useEffect(() => {
    if (!isOpen || !activeStep) return;
    if (activeStep.calculatorStep !== currentCalculatorStep) {
      onCalculatorStepChange(activeStep.calculatorStep);
    }
  }, [activeStep, currentCalculatorStep, isOpen, onCalculatorStepChange]);

  useEffect(() => {
    if (!isOpen || !activeStep) return;

    let frame = 0;

    const updateTarget = () => {
      const target = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-tour-id="${activeStep.targetId}"]`)
      ).find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      document.querySelectorAll<HTMLElement>('[data-tour-active="true"]').forEach((element) => {
        element.removeAttribute('data-tour-active');
      });

      if (!target) {
        setTargetRect(null);
        return;
      }

      target.setAttribute('data-tour-active', 'true');
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      frame = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      });
    };

    const timeout = window.setTimeout(updateTarget, 120);

    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
      document.querySelectorAll<HTMLElement>('[data-tour-active="true"]').forEach((element) => {
        element.removeAttribute('data-tour-active');
      });
    };
  }, [activeStep, isOpen]);

  const spotlight = useMemo(() => {
    if (!targetRect) return null;
    const padding = 8;
    const top = Math.max(targetRect.top - padding, 8);
    const left = Math.max(targetRect.left - padding, 8);
    const width = Math.min(targetRect.width + padding * 2, window.innerWidth - left - 8);
    const height = Math.min(targetRect.height + padding * 2, window.innerHeight - top - 8);

    return { top, left, width, height };
  }, [targetRect]);

  const closeTour = () => {
    safeStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const startTour = () => {
    safeStorage.removeItem(STORAGE_KEY);
    setActiveIndex(0);
    setIsOpen(true);
  };

  const goNext = () => {
    if (activeIndex >= steps.length - 1) {
      closeTour();
      return;
    }
    setActiveIndex((index) => index + 1);
  };

  const goBack = () => {
    setActiveIndex((index) => Math.max(index - 1, 0));
  };

  const popoverStyle = useMemo(() => {
    if (!spotlight) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const popoverWidth = Math.min(340, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - (spotlight.top + spotlight.height);
    const top = spaceBelow > 190
      ? spotlight.top + spotlight.height + 12
      : Math.max(12, spotlight.top - 196);
    const left = Math.min(
      Math.max(12, spotlight.left + spotlight.width / 2 - popoverWidth / 2),
      window.innerWidth - popoverWidth - 12
    );

    return {
      width: popoverWidth,
      left,
      top,
    };
  }, [spotlight]);

  return (
    <>
      {isOpen && activeStep && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Calculator walkthrough">
          {spotlight ? (
            <>
              <div className="fixed left-0 top-0 bg-black/45 backdrop-blur-[2px]" style={{ right: 0, height: spotlight.top }} />
              <div className="fixed left-0 bg-black/45 backdrop-blur-[2px]" style={{ top: spotlight.top, width: spotlight.left, height: spotlight.height }} />
              <div className="fixed bg-black/45 backdrop-blur-[2px]" style={{ top: spotlight.top, left: spotlight.left + spotlight.width, right: 0, height: spotlight.height }} />
              <div className="fixed left-0 bg-black/45 backdrop-blur-[2px]" style={{ top: spotlight.top + spotlight.height, right: 0, bottom: 0 }} />
              <div
                className="fixed rounded-xl border-2 border-brand-orange shadow-[0_0_0_4px_rgba(242,146,34,0.18),0_14px_36px_rgba(0,0,0,0.25)] pointer-events-none"
                style={spotlight}
              />
            </>
          ) : (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" />
          )}

          <div
            className="fixed rounded-lg border border-gray-200 bg-white p-4 shadow-2xl"
            style={popoverStyle}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-brand-orange">
                  Step {activeIndex + 1} of {steps.length}
                </p>
                <h3 className="mt-1 text-sm font-bold text-brand-brown">{activeStep.title}</h3>
              </div>
              <button
                type="button"
                onClick={closeTour}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-orange"
                aria-label="Skip walkthrough"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-gray-600">{activeStep.body}</p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-orange transition-all"
                style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={closeTour}
                className="text-xs font-semibold text-gray-500 transition-colors hover:text-brand-orange"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={activeIndex === 0}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-bold text-gray-600 transition-colors hover:border-brand-orange hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-9 items-center gap-1 rounded-lg bg-brand-orange px-3 text-xs font-bold text-white transition-colors hover:bg-brand-orange-dark"
                >
                  {activeIndex === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-3 flex justify-center ${className}`}>
        <button
          type="button"
          onClick={startTour}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-brand-orange"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Start walkthrough
        </button>
      </div>
    </>
  );
}
