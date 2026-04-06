'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import MobileStepSeaRoute from './MobileStepSeaRoute';
import MobileStepSeaMode from './MobileStepSeaMode';
import MobileStepSeaProducts from './MobileStepSeaProducts';
import MobileStepSeaCharges from './MobileStepSeaCharges';
import MobileSeaResultsPanel from './MobileSeaResultsPanel';
import { type SeaCalculatorFormState } from '@/hooks/useSeaCalculatorForm';

const STEPS = ['Route', 'Mode', 'Products', 'Charges'];

interface Props {
  state: SeaCalculatorFormState;
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

export default function MobileSeaCalculator({
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-brand-brown">Sea Freight Calculator</h2>
            <p className="text-xs text-gray-500">Calculate your sea import landing cost</p>
          </div>

          <div className="mb-5">
            <StepIndicator currentStep={state.currentStep} steps={STEPS} />
          </div>

          {state.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs"
            >
              {state.error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {state.currentStep === 0 && (
              <MobileStepSeaRoute
                key="step-0"
                originCountryCode={state.originCountryCode}
                currency={state.currency}
                exchangeRate={state.exchangeRate}
                exchangeRateSource={state.exchangeRateSource}
                incoterm={state.incoterm}
                onFieldChange={setField}
              />
            )}
            {state.currentStep === 1 && (
              <MobileStepSeaMode
                key="step-1"
                shippingMode={state.shippingMode}
                containerType={state.containerType}
                numberOfContainers={state.numberOfContainers}
                destinationSeaPort={state.destinationSeaPort}
                onFieldChange={setField}
              />
            )}
            {state.currentStep === 2 && (
              <MobileStepSeaProducts
                key="step-2"
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
            {state.currentStep === 3 && (
              <MobileStepSeaCharges
                key="step-3"
                shippingMode={state.shippingMode}
                userFreightCostINR={state.userFreightCostINR}
                thcOrigin={state.thcOrigin}
                thcDestination={state.thcDestination}
                blFee={state.blFee}
                doCharges={state.doCharges}
                cfsCharges={state.cfsCharges}
                customExamination={state.customExamination}
                demurrageDays={state.demurrageDays}
                detentionDays={state.detentionDays}
                includeInlandDelivery={state.includeInlandDelivery}
                clearancePort={state.clearancePort}
                destinationCity={state.destinationCity}
                inlandZone={state.inlandZone}
                onFieldChange={setField}
              />
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100">
            <div>
              {state.currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {state.currentStep < 3 && (
                <Button onClick={() => nextStep()}>
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              {state.currentStep === 3 && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto-updating
                </span>
              )}
            </div>
          </div>

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

        <MobileSeaResultsPanel
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
