'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RadioCard from '@/components/ui/RadioCard';
import StepIndicator from '@/components/ui/StepIndicator';
import { Package, Upload, Plane, Ship, Calculator, ArrowRight } from 'lucide-react';

const steps = ['Shipment Type', 'Shipping Method'];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const CalculatorWizard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [shipmentType, setShipmentType] = useState<'import' | 'export' | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea' | null>(null);
  const handleCTAClick = () => {
    if (step === 0 && shipmentType === 'import') {
      setDirection(1);
      setStep(1);
    } else if (step === 1 && shippingMethod === 'air') {
      router.push('/import/air');
    }
  };

  const isCTADisabled =
    (step === 0 && shipmentType !== 'import') ||
    (step === 1 && shippingMethod !== 'air');

  return (
    <div className="bg-white rounded-2xl border border-brand-border/60 shadow-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-brand-border/40">
        <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-brand-brown leading-tight">
            Landed Cost Calculator
          </h2>
          <p className="text-[12px] text-brand-brown/45 font-medium">
            India Import Duty Estimator
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-7 py-5 sm:py-6">
        {/* Step indicator */}
        <div className="mb-6">
          <StepIndicator currentStep={step} steps={steps} />
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden min-h-[220px] sm:min-h-[240px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 ? (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-[13px] font-extrabold uppercase tracking-wide text-brand-brown/55 mb-4">
                  What do you want to calculate?
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <RadioCard
                    title="Import"
                    description="Bring goods into India"
                    icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" />}
                    selected={shipmentType === 'import'}
                    onClick={() => setShipmentType('import')}
                  />
                  <RadioCard
                    title="Export"
                    description="Ship goods from India"
                    icon={<Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
                    selected={shipmentType === 'export'}
                    onClick={() => setShipmentType('export')}
                    comingSoon
                  />
                </div>

                {shipmentType === 'export' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-800 text-[13px] leading-relaxed"
                  >
                    Export calculator coming soon. We currently support import cost calculations.
                  </motion.div>
                )}

                <div className="mt-5">
                  <button
                    onClick={handleCTAClick}
                    disabled={shipmentType !== 'import'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white text-[14px] font-extrabold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    Calculate Landing Cost
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-[13px] font-extrabold uppercase tracking-wide text-brand-brown/55 mb-4">
                  Select shipping method
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <RadioCard
                    title="Air Freight"
                    description="Air cargo shipments"
                    icon={<Plane className="w-5 h-5 sm:w-6 sm:h-6" />}
                    selected={shippingMethod === 'air'}
                    onClick={() => setShippingMethod('air')}
                  />
                  <RadioCard
                    title="Sea Freight"
                    description="Ocean cargo shipments"
                    icon={<Ship className="w-5 h-5 sm:w-6 sm:h-6" />}
                    selected={shippingMethod === 'sea'}
                    onClick={() => setShippingMethod('sea')}
                    comingSoon
                  />
                </div>

                {shippingMethod === 'sea' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-800 text-[13px] leading-relaxed"
                  >
                    Sea Freight calculator coming soon. We currently support Air Freight.
                  </motion.div>
                )}

                <div className="mt-5">
                  <button
                    onClick={handleCTAClick}
                    disabled={shippingMethod !== 'air'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white text-[14px] font-extrabold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    Calculate Landing Cost
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalculatorWizard;
