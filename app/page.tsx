'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RadioCard from '@/components/ui/RadioCard';
import Button from '@/components/ui/Button';
import { Package, Upload } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'import' | 'export' | null>(null);

  const handleContinue = () => {
    if (selected === 'import') {
      router.push('/import');
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
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-3">
            Calculate Your Landing Cost
          </h1>
          <p className="text-gray-500 mb-10 text-lg">
            Get an instant estimate for your import or export shipment costs
          </p>

          <p className="text-sm font-medium text-gray-600 mb-4 text-left">
            What do you want to calculate?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <RadioCard
              title="Import"
              description="Calculate costs to bring goods into India"
              icon={<Package className="w-6 h-6" />}
              selected={selected === 'import'}
              onClick={() => setSelected('import')}
            />
            <RadioCard
              title="Export"
              description="Calculate costs to ship goods from India"
              icon={<Upload className="w-6 h-6" />}
              selected={selected === 'export'}
              onClick={() => setSelected('export')}
              comingSoon
            />
          </div>

          {selected === 'export' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
            >
              The export calculator is coming soon. We are currently focused on import cost calculations.
            </motion.div>
          )}

          <Button
            onClick={handleContinue}
            disabled={selected !== 'import'}
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
