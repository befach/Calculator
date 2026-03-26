'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StepIndicator from '@/components/ui/StepIndicator';
import Button from '@/components/ui/Button';
import WebStepRoute from './WebStepRoute';
import WebStepHSN from './WebStepHSN';
import WebStepPackage from './WebStepPackage';
import WebResultsPanel from './WebResultsPanel';
import { type CalculatorFormState } from '@/hooks/useCalculatorForm';

const STEPS = ['Route & Currency', 'HSN & Duties', 'Package Details'];

interface Props {
  state: CalculatorFormState;
  setField: (field: string, value: unknown) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  calculate: () => void;
  reset: () => void;
}

export default function WebAirCalculator({
  state,
  setField,
  nextStep,
  prevStep,
  calculate,
  reset,
}: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header />

      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {/* Back button */}
        <button
          onClick={() => router.push('/import')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-orange mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shipping method
        </button>

        <div className="flex flex-row gap-6">
          {/* ─── Left Side: Input Wizard (55%) ─── */}
          <div className="w-[55%]">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-brand-brown mb-1">
                  Air Freight Calculator
                </h2>
                <p className="text-sm text-gray-500">
                  Calculate your import landing cost
                </p>
              </div>

              {/* Step Indicator */}
              <div className="mb-8">
                <StepIndicator currentStep={state.currentStep} steps={STEPS} />
              </div>

              {/* Error message */}
              {state.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {state.error}
                </motion.div>
              )}

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {state.currentStep === 0 && (
                  <WebStepRoute
                    key="step-0"
                    originCountryCode={state.originCountryCode}
                    currency={state.currency}
                    exchangeRate={state.exchangeRate}
                    dhlZone={state.dhlZone}
                    onFieldChange={setField}
                  />
                )}
                {state.currentStep === 1 && (
                  <WebStepHSN
                    key="step-1"
                    hsnCode={state.hsnCode}
                    bcdRate={state.bcdRate}
                    igstRate={state.igstRate}
                    onFieldChange={setField}
                  />
                )}
                {state.currentStep === 2 && (
                  <WebStepPackage
                    key="step-2"
                    productName={state.productName}
                    unitPrice={state.unitPrice}
                    quantity={state.quantity}
                    fobValue={state.fobValue}
                    currency={state.currency}
                    exchangeRate={state.exchangeRate}
                    lengthCm={state.lengthCm}
                    widthCm={state.widthCm}
                    heightCm={state.heightCm}
                    actualWeightKg={state.actualWeightKg}
                    numPackages={state.numPackages}
                    volumetricWeight={state.volumetricWeight}
                    grossWeight={state.grossWeight}
                    chargeableWeight={state.chargeableWeight}
                    cbm={state.cbm}
                    includeInlandDelivery={state.includeInlandDelivery}
                    clearancePort={state.clearancePort}
                    destinationCity={state.destinationCity}
                    inlandZone={state.inlandZone}
                    onFieldChange={setField}
                  />
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                <div>
                  {state.currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {state.currentStep < 2 && (
                    <Button onClick={() => nextStep()}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {state.currentStep === 2 && (
                    <Button
                      onClick={calculate}
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
                <div className="mt-4 text-center">
                  <button
                    onClick={reset}
                    className="text-sm text-gray-500 hover:text-brand-orange flex items-center gap-1 mx-auto transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start New Calculation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Side: Results Panel (45%) ─── */}
          <div className="w-[45%]">
            <div className="sticky top-6">
              <WebResultsPanel
                result={state.result}
                isCalculating={state.isCalculating}
                currency={state.currency}
                exchangeRate={state.exchangeRate}
                hsnCode={state.hsnCode}
                productName={state.productName}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
