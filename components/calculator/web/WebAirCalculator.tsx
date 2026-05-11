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
import WalkthroughPanel, { type WalkthroughStep } from '../shared/WalkthroughPanel';
import { type CalculatorFormState } from '@/hooks/useCalculatorForm';

const STEPS = ['Route', 'Products', 'Delivery'];
const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { targetId: 'origin-country', calculatorStep: 0, title: 'Origin country', body: 'Select the country where your shipment is coming from. This helps us find the correct freight zone.' },
  { targetId: 'currency', calculatorStep: 0, title: 'Currency', body: 'Choose the currency used in your supplier invoice.' },
  { targetId: 'exchange-rate', calculatorStep: 0, title: 'Exchange rate', body: 'Check the exchange rate used to convert your product value into INR.' },
  { targetId: 'product-name', calculatorStep: 1, title: 'Product name', body: 'Enter a simple product name so the estimate is easy to understand later.' },
  { targetId: 'product-price', calculatorStep: 1, title: 'Price per unit', body: 'Add the supplier price for one unit of this product.' },
  { targetId: 'product-quantity', calculatorStep: 1, title: 'Quantity', body: 'Enter how many units you plan to import.' },
  { targetId: 'hsn-code', calculatorStep: 1, title: 'HSN code', body: 'Search or enter the HSN code. This is used to find customs duty and GST.' },
  { targetId: 'duty-rates', calculatorStep: 1, title: 'Duty rates', body: 'Review or edit the customs duty and IGST rates if you already know the correct values.' },
  { targetId: 'dimension-mode', calculatorStep: 1, title: 'Dimension type', body: 'Choose whether you have package dimensions or only product dimensions.' },
  { targetId: 'package-dimensions', calculatorStep: 1, title: 'Dimensions', body: 'Enter length, width, and height. Accurate dimensions improve the freight estimate.' },
  { targetId: 'package-weight', calculatorStep: 1, title: 'Weight and packages', body: 'Enter weight and package count so chargeable weight can be calculated.' },
  { targetId: 'air-freight-cost', calculatorStep: 1, title: 'Your freight cost', body: 'If you already have an air freight quote, enter it here. Otherwise leave it blank.' },
  { targetId: 'add-product', calculatorStep: 1, title: 'Add another product', body: 'Use this button when your shipment has more than one product.' },
  { targetId: 'inland-delivery', calculatorStep: 2, title: 'Inland delivery', body: 'Turn this on if you want to include delivery from the clearance city to your final destination.' },
];

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
  goToStep: (step: number) => void;
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
  goToStep,
}: Props) {
  const router = useRouter();
  const lastStep = 2;
  const [enquiryCompleted, setEnquiryCompleted] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const handleCalculate = () => {
    setEnquiryCompleted(false);
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

              <WalkthroughPanel
                steps={WALKTHROUGH_STEPS}
                currentCalculatorStep={state.currentStep}
                onCalculatorStepChange={goToStep}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* ─── Right Side: Results Panel (45%) ─── */}
          <div className="w-[45%]">
            <div className={`sticky top-6 max-h-[calc(100vh-3rem)] ${state.result && enquiryCompleted ? 'overflow-y-auto' : 'overflow-hidden'}`}>
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
        onClose={() => setShowEnquiryModal(false)}
        onComplete={handleEnquiryComplete}
      />
    </div>
  );
}
