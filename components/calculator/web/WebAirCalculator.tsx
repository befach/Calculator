'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import WebStepRoute from './WebStepRoute';
import WebStepProducts from './WebStepProducts';
import WebStepDelivery from './WebStepDelivery';
import WebResultsPanel from './WebResultsPanel';
import EnquiryFormModal from '../shared/EnquiryFormModal';
import { type CalculatorFormState } from '@/hooks/useCalculatorForm';

const STEPS = ['Route', 'Products', 'Delivery'];

interface Props {
  state: CalculatorFormState;
  setField: (field: string, value: unknown) => void;
  addProduct: () => void;
  removeProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;
  setProductField: (productId: string, field: string, value: unknown) => void;
  toggleProductExpanded: (productId: string) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  calculate: () => void;
  reset: () => void;
}

export default function WebAirCalculator({
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
}: Props) {
  const router = useRouter();
  const lastStep = 2;
  const [enquiryCompleted, setEnquiryCompleted] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const handleCalculate = () => {
    calculate();
    // Show enquiry modal immediately — results stay hidden until form is filled
    setShowEnquiryModal(true);
  };

  const handleEnquiryComplete = () => {
    setEnquiryCompleted(true);
    setShowEnquiryModal(false);
  };

  const handleReset = () => {
    setEnquiryCompleted(false);
    reset();
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFAFA] overflow-hidden">
      <Header />

      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full min-h-0">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-orange mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex flex-row gap-5 h-[calc(100vh-8rem)]">
          {/* ─── Left Side: Input Wizard (55%) ─── */}
          <div className="w-[55%] flex flex-col min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col flex-1 min-h-0">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-brand-brown mb-0.5">
                  Air Freight Calculator
                </h2>
                <p className="text-xs text-gray-500">
                  Calculate your import landing cost
                </p>
              </div>

              {/* Step Indicator */}
              <div className="mb-5">
                <StepIndicator currentStep={state.currentStep} steps={STEPS} />
              </div>

              {/* Error message */}
              {state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs"
                >
                  {state.error}
                </motion.div>
              )}

              {/* Step Content — scrollable if needed */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <AnimatePresence mode="wait">
                  {state.currentStep === 0 && (
                    <WebStepRoute
                      key="step-0"
                      originCountryCode={state.originCountryCode}
                      currency={state.currency}
                      exchangeRate={state.exchangeRate}
                      exchangeRateSource={state.exchangeRateSource}
                      dhlZone={state.dhlZone}
                      onFieldChange={setField}
                    />
                  )}
                  {state.currentStep === 1 && (
                    <WebStepProducts
                      key="step-1"
                      products={state.products}
                      currency={state.currency}
                      exchangeRate={state.exchangeRate}
                      userFreightCostINR={state.userFreightCostINR}
                      onProductFieldChange={setProductField}
                      onToggleExpanded={toggleProductExpanded}
                      onAddProduct={addProduct}
                      onRemoveProduct={removeProduct}
                      onDuplicateProduct={duplicateProduct}
                      onFieldChange={setField}
                    />
                  )}
                  {state.currentStep === 2 && (
                    <WebStepDelivery
                      key="step-2"
                      includeInlandDelivery={state.includeInlandDelivery}
                      clearancePort={state.clearancePort}
                      destinationCity={state.destinationCity}
                      inlandZone={state.inlandZone}
                      onFieldChange={setField}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
                <div>
                  {state.currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {state.currentStep < lastStep && (
                    <Button onClick={() => nextStep()}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {state.currentStep === lastStep && (
                    <Button
                      onClick={handleCalculate}
                      disabled={state.isCalculating}
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      {state.isCalculating ? 'Calculating...' : 'Calculate Landing Cost'}
                    </Button>
                  )}
                </div>
              </div>

              {/* New Calculation button */}
              {state.result && (
                <div className="mt-2 text-center flex-shrink-0">
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-brand-orange flex items-center gap-1 mx-auto transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Start New Calculation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Side: Results Panel (45%) ─── */}
          <div className="w-[45%] min-h-0">
            <div className="h-full overflow-y-auto">
              <WebResultsPanel
                result={enquiryCompleted ? state.result : null}
                isCalculating={state.isCalculating}
                currency={state.currency}
                exchangeRate={state.exchangeRate}
                originCountryCode={state.originCountryCode}
                products={state.products}
                includeInlandDelivery={state.includeInlandDelivery}
                clearancePort={state.clearancePort}
                destinationCity={state.destinationCity}
                inlandZone={state.inlandZone}
                userFreightCostINR={state.userFreightCostINR}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Enquiry Form Modal — required before showing results */}
      <EnquiryFormModal
        isOpen={showEnquiryModal}
        onComplete={handleEnquiryComplete}
      />
    </div>
  );
}
