'use client';

import WebAirCalculator from '@/components/calculator/web/WebAirCalculator';
import MobileAirCalculator from '@/components/calculator/mobile/MobileAirCalculator';
import { useCalculatorForm } from '@/hooks/useCalculatorForm';

export default function AirCalculatorPage() {
  const {
    state,
    setField,
    addProduct,
    removeProduct,
    duplicateProduct,
    setProductField,
    toggleProductExpanded,
    nextStep,
    prevStep,
    calculate,
    reset,
  } = useCalculatorForm();

  const props = {
    state, setField, addProduct, removeProduct, duplicateProduct,
    setProductField, toggleProductExpanded, nextStep, prevStep, calculate, reset,
  };

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
