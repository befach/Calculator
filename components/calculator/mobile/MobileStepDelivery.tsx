'use client';

import { motion } from 'framer-motion';
import InlandDeliverySection from '../shared/InlandDeliverySection';

interface Props {
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
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
      <InlandDeliverySection
        includeInlandDelivery={props.includeInlandDelivery}
        clearancePort={props.clearancePort}
        destinationCity={props.destinationCity}
        inlandZone={props.inlandZone}
        onFieldChange={props.onFieldChange}
      />

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
        <p className="text-[11px] text-gray-500">
          Inland delivery is optional. You can calculate without it.
        </p>
      </div>
    </motion.div>
  );
}
