'use client';

import WebSeaCalculator from '@/components/calculator/web/WebSeaCalculator';
import { useSeaCalculatorForm } from '@/hooks/useSeaCalculatorForm';

export default function SeaCalculatorPage() {
  const {
    state,
    originCountries,
    originPorts,
    destinationPorts,
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

  return (
    <WebSeaCalculator
      state={state}
      originCountries={originCountries}
      originPorts={originPorts}
      destinationPorts={destinationPorts}
      setField={setField}
      addProduct={addProduct}
      removeProduct={removeProduct}
      duplicateProduct={duplicateProduct}
      setProductField={setProductField}
      toggleProductExpanded={toggleProductExpanded}
      nextStep={nextStep}
      prevStep={prevStep}
      calculate={calculate}
      reset={reset}
    />
  );
}
