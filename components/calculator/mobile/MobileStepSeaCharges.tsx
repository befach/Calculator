'use client';

import { motion } from 'framer-motion';
import { Ship } from 'lucide-react';
import PortChargesEditor from '../shared/PortChargesEditor';
import InlandDeliverySection from '../shared/InlandDeliverySection';

interface Props {
  shippingMode: string;
  userFreightCostINR: number;
  thcOrigin: number;
  thcDestination: number;
  blFee: number;
  doCharges: number;
  cfsCharges: number;
  customExamination: number;
  demurrageDays: number;
  detentionDays: number;
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepSeaCharges(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Ocean Freight (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Ship className="w-3.5 h-3.5 text-brand-orange" />
          <span className="text-xs font-semibold text-brand-brown">Your Ocean Freight (Optional)</span>
        </div>
        <div>
          <input
            type="number"
            min="0"
            placeholder="Leave blank for estimated rates"
            value={props.userFreightCostINR || ''}
            onChange={(e) => props.onFieldChange('userFreightCostINR', e.target.value ? parseFloat(e.target.value) : 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Enter actual freight quotation (INR) for precise results.
          </p>
        </div>
      </div>

      {/* Port Charges */}
      <PortChargesEditor
        shippingMode={props.shippingMode}
        values={{
          thcOrigin: props.thcOrigin,
          thcDestination: props.thcDestination,
          blFee: props.blFee,
          doCharges: props.doCharges,
          cfsCharges: props.cfsCharges,
          customExamination: props.customExamination,
          demurrageDays: props.demurrageDays,
          detentionDays: props.detentionDays,
        }}
        onFieldChange={props.onFieldChange}
      />

      {/* Inland Delivery */}
      <InlandDeliverySection
        includeInlandDelivery={props.includeInlandDelivery}
        clearancePort={props.clearancePort}
        destinationCity={props.destinationCity}
        inlandZone={props.inlandZone}
        onFieldChange={props.onFieldChange}
      />

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
        <p className="text-[11px] text-gray-500">
          Results update automatically.
        </p>
      </div>
    </motion.div>
  );
}
