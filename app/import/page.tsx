'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RadioCard from '@/components/ui/RadioCard';
import Button from '@/components/ui/Button';
import { Plane, Ship, ArrowLeft } from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'air' | 'sea' | null>(null);

  const handleContinue = () => {
    if (selected === 'air') {
      router.push('/import/air');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full text-center"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-orange mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-3">
            Choose Shipping Method
          </h1>
          <p className="text-gray-500 mb-10 text-lg">
            How are you shipping your goods to India?
          </p>

          <p className="text-sm font-medium text-gray-600 mb-4 text-left">
            Select shipping method
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <RadioCard
              title="Air Freight"
              description="DHL Express / Air cargo shipments"
              icon={<Plane className="w-6 h-6" />}
              selected={selected === 'air'}
              onClick={() => setSelected('air')}
            />
            <RadioCard
              title="Sea Freight"
              description="Ocean cargo and container shipments"
              icon={<Ship className="w-6 h-6" />}
              selected={selected === 'sea'}
              onClick={() => setSelected('sea')}
              comingSoon
            />
          </div>

          {selected === 'sea' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
            >
              The Sea Freight Calculator is coming soon. We are currently focused on Air Freight calculations.
            </motion.div>
          )}

          <Button
            onClick={handleContinue}
            disabled={selected !== 'air'}
            className="w-full sm:w-auto px-12"
          >
            Continue
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
