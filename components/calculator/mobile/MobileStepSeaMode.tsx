'use client';

import { motion } from 'framer-motion';
import { Ship } from 'lucide-react';
import ShippingModeSelector from '../shared/ShippingModeSelector';
import ContainerTypeSelector from '../shared/ContainerTypeSelector';
import SeaPortSelector from '../shared/SeaPortSelector';
import { type ContainerType, type SeaPort } from '@/core/seaFreightRates';

interface Props {
  shippingMode: string;
  containerType: string;
  numberOfContainers: number;
  destinationSeaPort: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepSeaMode({
  shippingMode,
  containerType,
  numberOfContainers,
  destinationSeaPort,
  onFieldChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-brand-brown">Shipping Mode</label>
        <ShippingModeSelector
          value={shippingMode}
          onChange={(mode) => onFieldChange('shippingMode', mode)}
        />
      </div>

      {shippingMode === 'FCL' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <ContainerTypeSelector
            value={containerType}
            onChange={(type: ContainerType) => onFieldChange('containerType', type)}
          />
          <div>
            <label className="block text-xs font-semibold text-brand-brown mb-1">
              Number of Containers
            </label>
            <input
              type="number"
              min="1"
              value={numberOfContainers}
              onChange={(e) => onFieldChange('numberOfContainers', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
          </div>
        </motion.div>
      )}

      {shippingMode === 'LCL' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-2.5 bg-blue-50 border border-blue-200/60 rounded-lg text-blue-700 text-[11px] leading-relaxed"
        >
          Freight per CBM. Your cargo shares container space. Min 1 CBM.
        </motion.div>
      )}

      <SeaPortSelector
        value={destinationSeaPort}
        onChange={(port: SeaPort) => onFieldChange('destinationSeaPort', port)}
      />
    </motion.div>
  );
}
