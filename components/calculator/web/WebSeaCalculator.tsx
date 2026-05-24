'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import StepIndicator from '@/components/ui/StepIndicator';
import EnquiryFormModal from '../shared/EnquiryFormModal';
import WalkthroughPanel, { type WalkthroughStep } from '../shared/WalkthroughPanel';
import WebStepDelivery from './WebStepDelivery';
import WebSeaResultsPanel from './WebSeaResultsPanel';
import WebSeaStepProducts from './WebSeaStepProducts';
import WebSeaStepRoute from './WebSeaStepRoute';
import { type SeaCalculatorFormState } from '@/hooks/useSeaCalculatorForm';

const STEPS = ['Route', 'Products', 'Delivery'];
const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  { targetId: 'sea-incoterm', calculatorStep: 0, title: 'Incoterm', body: 'Choose FOB if freight is not included in the invoice. Choose CIF if freight and insurance are already included.' },
  { targetId: 'sea-shipment-type', calculatorStep: 0, title: 'Shipment type', body: 'Select LCL, 20ft, or 40ft based on how your sea shipment will move.' },
  { targetId: 'sea-route', calculatorStep: 0, title: 'Sea route', body: 'Select the origin country, origin port, and India destination port for the shipment.' },
  { targetId: 'currency', calculatorStep: 0, title: 'Currency', body: 'Choose the currency used in your supplier invoice.' },
  { targetId: 'exchange-rate', calculatorStep: 0, title: 'Exchange rate', body: 'Check the exchange rate used to convert your invoice value into INR.' },
  { targetId: 'product-name', calculatorStep: 1, title: 'Product name', body: 'Enter a simple product name so the estimate is easy to understand later.' },
  { targetId: 'product-price', calculatorStep: 1, title: 'Price per unit', body: 'Add the supplier price for one unit of this product.' },
  { targetId: 'product-quantity', calculatorStep: 1, title: 'Quantity', body: 'Enter how many units you plan to import.' },
  { targetId: 'hsn-code', calculatorStep: 1, title: 'HSN code', body: 'Search or enter the HSN code. This is used to find customs duty and GST.' },
  { targetId: 'duty-rates', calculatorStep: 1, title: 'Duty rates', body: 'Review or edit the customs duty and IGST rates if you already know the correct values.' },
  { targetId: 'dimension-mode', calculatorStep: 1, title: 'Dimension type', body: 'Choose whether you have package dimensions or only product dimensions.' },
  { targetId: 'package-dimensions', calculatorStep: 1, title: 'Dimensions', body: 'Enter length, width, and height so CBM can be estimated.' },
  { targetId: 'package-weight', calculatorStep: 1, title: 'Weight and packages', body: 'Enter weight and package count. This helps build the shipment summary.' },
  { targetId: 'add-product', calculatorStep: 1, title: 'Add another product', body: 'Use this button when your shipment has more than one product.' },
  { targetId: 'inland-delivery', calculatorStep: 2, title: 'Inland delivery', body: 'Turn this on if you want to include delivery from the clearance city to your final destination.' },
];

interface Props {
  state: SeaCalculatorFormState;
  originCountries: string[];
  originPorts: string[];
  destinationPorts: string[];
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

export default function WebSeaCalculator({
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
  goToStep,
}: Props) {
  const router = useRouter();
  const [enquiryCompleted, setEnquiryCompleted] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const showCompletedResult = Boolean(state.result && enquiryCompleted);

  const handleCalculate = () => {
    setEnquiryCompleted(false);
    calculate();
    setShowEnquiryModal(true);
  };

  const handleReset = () => {
    setEnquiryCompleted(false);
    reset();
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#FAFAFA] lg:overflow-hidden">
      <Header />

      <main className="flex-1 px-2.5 sm:px-3 lg:px-4 py-2.5 sm:py-3 max-w-7xl mx-auto w-full min-h-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-orange mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-5 lg:h-[calc(100vh-8rem)]">
          <div className={`${showCompletedResult ? 'hidden lg:flex' : 'flex'} w-full lg:w-[55%] flex-col min-h-0`}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-5 flex flex-col flex-1 min-h-0">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-brand-brown mb-0.5">Sea Freight Calculator</h2>
                <p className="text-xs text-gray-500">FOB and CIF landed cost estimate for India imports</p>
              </div>

              <div className="mb-4 sm:mb-5 overflow-x-auto pb-1">
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

              <div className="flex-1 overflow-y-visible lg:overflow-y-auto min-h-0 lg:pr-1">
                <AnimatePresence mode="wait">
                  {state.currentStep === 0 && (
                    <WebSeaStepRoute
                      key="step-0"
                      incoterm={state.incoterm}
                      shipmentPreference={state.shipmentPreference}
                      originCountry={state.originCountry}
                      originPort={state.originPort}
                      destinationPort={state.destinationPort}
                      originCountries={originCountries}
                      originPorts={originPorts}
                      destinationPorts={destinationPorts}
                      currency={state.currency}
                      exchangeRate={state.exchangeRate}
                      exchangeRateSource={state.exchangeRateSource}
                      onFieldChange={setField}
                    />
                  )}
                  {state.currentStep === 1 && (
                    <WebSeaStepProducts
                      key="step-1"
                      incoterm={state.incoterm}
                      shipmentPreference={state.shipmentPreference}
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

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-2 mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
                <div className="w-full sm:w-auto">
                  {state.currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep} className="w-full sm:w-auto">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  {state.currentStep < STEPS.length - 1 && (
                    <Button onClick={() => nextStep()} className="w-full sm:w-auto">
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                  {state.currentStep === STEPS.length - 1 && (
                    <Button onClick={handleCalculate} disabled={state.isCalculating} className="w-full sm:w-auto">
                      <Calculator className="w-4 h-4 mr-1" />
                      {state.isCalculating ? 'Calculating...' : 'Calculate Landing Cost'}
                    </Button>
                  )}
                </div>
              </div>

              {showCompletedResult && (
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

          <div className={`${showCompletedResult ? 'block' : 'hidden'} w-full lg:block lg:w-[45%]`}>
            <div className={`lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] ${showCompletedResult ? 'overflow-y-auto' : 'overflow-hidden'}`}>
              <WebSeaResultsPanel
                result={showCompletedResult ? state.result : null}
                isCalculating={state.isCalculating}
                currency={state.currency}
                exchangeRate={state.exchangeRate}
                incoterm={state.incoterm}
                originCountry={state.originCountry}
                originPort={state.originPort}
                destinationPort={state.destinationPort}
                products={state.products}
              />
              {showCompletedResult && (
                <div className="lg:hidden mt-3 text-center">
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
        </div>
      </main>

      <EnquiryFormModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        onComplete={() => {
          setEnquiryCompleted(true);
          setShowEnquiryModal(false);
        }}
      />
    </div>
  );
}
