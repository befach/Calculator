'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import InlandDeliverySection from '../shared/InlandDeliverySection';

interface Props {
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  userFreightCostINR: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepDelivery(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Air Freight Cost (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 text-brand-orange" />
          <span className="text-xs font-semibold text-brand-brown">Your Air Freight Cost (Optional)</span>
        </div>
        <div>
          <input
            type="number"
            min="0"
            placeholder="Leave blank for Befach/DHL rates"
            value={props.userFreightCostINR || ''}
            onChange={(e) => props.onFieldChange('userFreightCostINR', e.target.value ? parseFloat(e.target.value) : 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            18% GST will be added if entered. Leave blank for DHL express (3–5 days).
          </p>
        </div>
      </div>

      <InlandDeliverySection
        includeInlandDelivery={props.includeInlandDelivery}
        clearancePort={props.clearancePort}
        destinationCity={props.destinationCity}
        inlandZone={props.inlandZone}
        onFieldChange={props.onFieldChange}
      />

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
        <p className="text-[11px] text-gray-500">
          Inland delivery is optional. Results update automatically.
        </p>
      </div>
    </motion.div>
  );
}
