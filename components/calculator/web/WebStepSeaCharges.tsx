'use client';

import { motion } from 'framer-motion';
import { Ship, Truck } from 'lucide-react';
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

export default function WebStepSeaCharges(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Truck className="w-5 h-5 text-brand-orange" />
        Charges & Delivery
      </h3>

      {/* Ocean Freight Cost (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Ship className="w-4 h-4 text-brand-orange" />
          <span className="text-sm font-semibold text-brand-brown">Your Ocean Freight Cost (Optional)</span>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Ocean freight cost in INR
          </label>
          <input
            type="number"
            min="0"
            placeholder="Leave blank to use estimated rates"
            value={props.userFreightCostINR || ''}
            onChange={(e) => props.onFieldChange('userFreightCostINR', e.target.value ? parseFloat(e.target.value) : 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Enter your actual freight quotation for precise results. Leave blank for estimated rates.
          </p>
        </div>
      </div>

      {/* Port & Terminal Charges */}
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

      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
        <p className="text-xs text-gray-500">
          Port charges use estimated defaults. Edit individual charges for precise results.
          Results update automatically as you fill in details.
        </p>
      </div>
    </motion.div>
  );
}
