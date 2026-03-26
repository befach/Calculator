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

// Example data for preview
const exampleResult: AirFreightResult = {
  originCountry: 'China',
  originZone: 3,
  destinationCity: 'Mumbai',
  clearancePort: 'Mumbai',
  volumetricWeight: 12,
  grossWeight: 8,
  chargeableWeight: 12,
  cbm: 0.06,
  fobValueOriginal: 1000,
  fobCurrency: 'USD',
  exchangeRate: 83.12,
  fobValueINR: 83120,
  dhlBaseFreight: 13301,
  dhlFuelSurcharge: 3990,
  dhlTotalFreight: 17291,
  insurance: 502,
  cifValue: 100913,
  basicCustomsDuty: 10091,
  bcdRate: 10,
  socialWelfareSurcharge: 1009,
  igst: 20163,
  igstRate: 18,
  totalDuties: 31263,
  dtpFee: 1100,
  clearanceProcessing: 1000,
  portCharges: 1009,
  customsClearance: 5000,
  inlandTransport: 1200,
  totalAdditionalCharges: 9309,
  totalLandedCost: 141485,
  costPerUnit: 1415,
  quantity: 100,
  totalLandedCostForeign: 1702,
  costPerUnitForeign: 17.02,
  fobPercent: 58.7,
  freightPercent: 12.6,
  dutiesPercent: 22.1,
  additionalPercent: 6.6,
  calculatedAt: new Date().toISOString(),
};

function InfoCard({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
      <Icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-brand-brown">{value}</p>
    </div>
  );
}

export default function WebResultsPanel({ result, isCalculating, currency, exchangeRate }: Props) {
  const data = result || exampleResult;
  const isExample = !result;
  const effectiveRate = result ? exchangeRate : exampleResult.exchangeRate;
  const effectiveCurrency = result ? currency : 'USD';

  const totalForeign = effectiveRate > 0 ? data.totalLandedCost / effectiveRate : 0;
  const perUnitForeign = effectiveRate > 0 ? data.costPerUnit / effectiveRate : 0;

  return (
    <div className="relative">
      {/* Calculating spinner */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Calculating...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={result ? 'real' : 'example'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`space-y-4 ${isExample ? 'opacity-50' : ''}`}
      >
        {/* ─── Orange Gradient Total Card ─── */}
        <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
          <p className="text-3xl font-bold mt-1">
            {effectiveCurrency !== 'INR'
              ? formatForeign(totalForeign, effectiveCurrency)
              : formatINR(data.totalLandedCost)}
          </p>
          {effectiveCurrency !== 'INR' && (
            <p className="text-sm text-white/70 mt-0.5">{formatINR(data.totalLandedCost)}</p>
          )}
          {data.quantity > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60">Per Unit ({data.quantity} units)</p>
              <p className="text-lg font-bold">
                {effectiveCurrency !== 'INR'
                  ? formatForeign(perUnitForeign, effectiveCurrency)
                  : formatINR(data.costPerUnit)}
              </p>
              {effectiveCurrency !== 'INR' && (
                <p className="text-xs text-white/60">{formatINR(data.costPerUnit)}</p>
              )}
            </div>
          )}
        </div>

        {/* ─── Info Cards ─── */}
        <div className="grid grid-cols-4 gap-2">
          <InfoCard
            icon={MapPin}
            label="Route"
            value={`${data.originCountry || '—'} → India`}
          />
          <InfoCard
            icon={Weight}
            label="Chargeable Wt"
            value={`${data.chargeableWeight} kg`}
          />
          <InfoCard
            icon={Box}
            label="Gross Weight"
            value={`${data.grossWeight} kg`}
          />
          <InfoCard
            icon={Ruler}
            label="CBM"
            value={`${data.cbm.toFixed(4)} m³`}
          />
        </div>

        {/* ─── Cost Breakdown ─── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CostBreakdownList
            result={data}
            exchangeRate={effectiveRate}
            currency={effectiveCurrency}
          />
        </div>

        {/* ─── Disclaimer ─── */}
        {isExample && (
          <p className="text-xs text-gray-400 text-center italic">
            This is a sample estimate. Fill in the form and calculate to see your actual landed cost.
          </p>
        )}
      </motion.div>
    </div>
  );
}
