'use client';

import WebAirCalculator from '@/components/calculator/web/WebAirCalculator';
import MobileAirCalculator from '@/components/calculator/mobile/MobileAirCalculator';
import { useCalculatorForm } from '@/hooks/useCalculatorForm';

export default function AirCalculatorPage() {
  const {
    state,
    setField,
    nextStep,
    prevStep,
    goToStep,
    calculate,
    reset,
  } = useCalculatorForm();

  const props = { state, setField, nextStep, prevStep, goToStep, calculate, reset };

  return (
    <>
      {/* Desktop: visible at lg+ */}
      <div className="hidden lg:block">
        <WebAirCalculator {...props} />
      </div>
      {/* Mobile: visible below lg */}
      <div className="block lg:hidden">
        <MobileAirCalculator {...props} />
      </div>
    </>
  );
}
