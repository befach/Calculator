'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import MobileStepRoute from './MobileStepRoute';
import MobileStepProducts from './MobileStepProducts';
import MobileStepDelivery from './MobileStepDelivery';
import MobileResultsPanel from './MobileResultsPanel';
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

export default function MobileAirCalculator({
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
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header />

      <main className="flex-1 px-3 pt-4 pb-8 w-full max-w-lg mx-auto">

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-brand-brown">Air Freight Calculator</h2>
            <p className="text-xs text-gray-500">Calculate your import landing cost</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-5">
            <StepIndicator currentStep={state.currentStep} steps={STEPS} />
          </div>

          {/* Error */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs"
            >
              {state.error}
            </motion.div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {state.currentStep === 0 && (
              <MobileStepRoute
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
              <MobileStepProducts
                key="step-1"
                products={state.products}
                currency={state.currency}
                exchangeRate={state.exchangeRate}
                onProductFieldChange={setProductField}
                onToggleExpanded={toggleProductExpanded}
                onAddProduct={addProduct}
                onRemoveProduct={removeProduct}
                onDuplicateProduct={duplicateProduct}
              />
            )}
            {state.currentStep === 2 && (
              <MobileStepDelivery
                key="step-2"
                includeInlandDelivery={state.includeInlandDelivery}
                clearancePort={state.clearancePort}
                destinationCity={state.destinationCity}
                inlandZone={state.inlandZone}
                onFieldChange={setField}
              />
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100">
            <div>
              {state.currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {state.currentStep < 2 && (
                <Button onClick={() => nextStep()}>
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              {state.currentStep === 2 && (
                <Button onClick={calculate} disabled={state.isCalculating}>
                  <Calculator className="w-3.5 h-3.5 mr-1" />
                  {state.isCalculating ? 'Calculating...' : 'Calculate'}
                </Button>
              )}
            </div>
          </div>

          {/* New Calculation */}
          {state.result && (
            <div className="mt-3 text-center">
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-brand-orange flex items-center gap-1 mx-auto transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                New Calculation
              </button>
            </div>
          )}
        </div>

        {/* Results (below form on mobile) */}
        <MobileResultsPanel
          result={state.result}
          isCalculating={state.isCalculating}
          currency={state.currency}
          exchangeRate={state.exchangeRate}
        />
      </main>

      <Footer />
    </div>
  );
}
