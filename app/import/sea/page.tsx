'use client';

import WebSeaCalculator from '@/components/calculator/web/WebSeaCalculator';
import MobileSeaCalculator from '@/components/calculator/mobile/MobileSeaCalculator';
import { useSeaCalculatorForm } from '@/hooks/useSeaCalculatorForm';

export default function SeaCalculatorPage() {
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
  } = useSeaCalculatorForm();

  const props = {
    state, setField, addProduct, removeProduct, duplicateProduct,
    setProductField, toggleProductExpanded, nextStep, prevStep, calculate, reset,
  };

  return (
    <>
      {/* Desktop: visible at lg+ */}
      <div className="hidden lg:block">
        <WebSeaCalculator {...props} />
      </div>
      {/* Mobile: visible below lg */}
      <div className="block lg:hidden">
        <MobileSeaCalculator {...props} />
      </div>
    </>
  );
}
