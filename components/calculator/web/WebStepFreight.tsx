'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

interface Props {
  userFreightCostINR: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepFreight({ userFreightCostINR, onFieldChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Plane className="w-5 h-5 text-brand-orange" />
        Air Freight
      </h3>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="text-sm text-gray-600">
          Do you have your own air freight cost? Enter it below, or leave blank to use <span className="font-semibold text-brand-orange">Befach Express rates</span>.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Air Freight Cost in INR (before GST)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Leave blank to use Befach express rates"
            value={userFreightCostINR || ''}
            onChange={(e) => onFieldChange('userFreightCostINR', e.target.value ? parseFloat(e.target.value) : 0)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-orange/5 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-medium">Befach Express</p>
            <p className="text-sm font-bold text-brand-orange mt-0.5">3–5 business days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-medium">Your Freight</p>
            <p className="text-sm font-bold text-gray-600 mt-0.5">7–15 business days</p>
          </div>
        </div>

        {userFreightCostINR > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            18% GST will be added to your freight cost of ₹{userFreightCostINR.toLocaleString()}.
          </p>
        )}
      </div>
    </motion.div>
  );
}
