'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import InlandDeliverySection from '../shared/InlandDeliverySection';

interface Props {
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepDelivery(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Truck className="w-5 h-5 text-brand-orange" />
        Inland Delivery
      </h3>

      <InlandDeliverySection
        includeInlandDelivery={props.includeInlandDelivery}
        clearancePort={props.clearancePort}
        destinationCity={props.destinationCity}
        inlandZone={props.inlandZone}
        onFieldChange={props.onFieldChange}
      />

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
        <p className="text-xs text-gray-500">
          Inland delivery is optional. If disabled, the calculation will include only customs clearance at the port.
          Results update automatically as you fill in details.
        </p>
      </div>
    </motion.div>
  );
}
