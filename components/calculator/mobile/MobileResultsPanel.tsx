'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Weight, Box, Ruler } from 'lucide-react';
import { type AirFreightResult } from '@/lib/calculate';
import CostBreakdownList from '../shared/CostBreakdownList';

interface Props {
  result: AirFreightResult | null;
  isCalculating: boolean;
  currency: string;
  exchangeRate: number;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatForeign(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center min-w-0 overflow-hidden">
      <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
      <p className="text-[11px] font-semibold text-brand-brown truncate leading-tight mt-0.5">{value}</p>
    </div>
  );
}

export default function MobileResultsPanel({ result, isCalculating, currency, exchangeRate }: Props) {
  if (!result && !isCalculating) return null;

  const data = result;

  return (
    <div className="relative mt-6">
      {/* Calculating spinner */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Calculating...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data && !isCalculating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Orange Total Card */}
          <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-4 text-white">
            <p className="text-xs text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-2xl font-bold mt-1">
              {currency !== 'INR'
                ? formatForeign(data.totalLandedCostForeign, currency)
                : formatINR(data.totalLandedCost)}
            </p>
            {currency !== 'INR' && (
              <p className="text-xs text-white/70">{formatINR(data.totalLandedCost)}</p>
            )}
            {data.quantity > 1 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/60">Per Unit ({data.quantity} units)</p>
                <p className="text-base font-bold">
                  {currency !== 'INR'
                    ? formatForeign(data.costPerUnitForeign, currency)
                    : formatINR(data.costPerUnit)}
                </p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-1.5">
            <InfoCard label="Route" value={`${data.originCountry || '—'} → India`} />
            <InfoCard label="Chargeable Wt" value={`${data.chargeableWeight} kg`} />
            <InfoCard label="Gross Weight" value={`${data.grossWeight} kg`} />
            <InfoCard label="CBM" value={`${data.cbm.toFixed(4)} m³`} />
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <CostBreakdownList
              result={data}
              exchangeRate={exchangeRate}
              currency={currency}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
