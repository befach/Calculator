'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Weight, Box, Ruler, Download } from 'lucide-react';
import { type AirFreightResult } from '@/lib/calculate';
import CostBreakdownList from '../shared/CostBreakdownList';

interface Props {
  result: AirFreightResult | null;
  isCalculating: boolean;
  currency: string;
  exchangeRate: number;
  hsnCode?: string;
  productName?: string;
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
  baseFreight: 13301,
  fuelSurcharge: 3990,
  totalFreight: 17291,
  insurance: 502,
  cifValue: 100913,
  basicCustomsDuty: 10091,
  bcdRate: 10,
  socialWelfareSurcharge: 1009,
  igst: 20163,
  igstRate: 18,
  totalDuties: 31263,
  clearanceCharges: 2700,
  inlandTransport: 1200,
  totalAdditionalCharges: 3900,
  totalLandedCost: 136076,
  costPerUnit: 1361,
  quantity: 100,
  totalLandedCostForeign: 1637,
  costPerUnitForeign: 16.37,
  fobPercent: 61.1,
  freightPercent: 13.1,
  dutiesPercent: 23.0,
  additionalPercent: 2.9,
  calculatedAt: new Date().toISOString(),
};

function InfoCard({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-2.5 text-center">
      <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center mx-auto mb-1.5">
        <Icon className="w-3.5 h-3.5 text-brand-orange" />
      </div>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
      <p className="text-sm font-bold text-brand-brown mt-0.5">{value}</p>
    </div>
  );
}

const DISTRIBUTION_COLORS = [
  { key: 'fob', label: 'FOB', color: '#F29222' },
  { key: 'freight', label: 'Freight', color: '#E8A54C' },
  { key: 'duties', label: 'Duties', color: '#C47518' },
  { key: 'fees', label: 'Fees', color: '#8B5E3C' },
];

function CostDistributionBar({ data }: { data: AirFreightResult }) {
  const segments = [
    { ...DISTRIBUTION_COLORS[0], percent: data.fobPercent },
    { ...DISTRIBUTION_COLORS[1], percent: data.freightPercent },
    { ...DISTRIBUTION_COLORS[2], percent: data.dutiesPercent },
    { ...DISTRIBUTION_COLORS[3], percent: data.additionalPercent },
  ];

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
        {segments.map((seg) => (
          seg.percent > 0 && (
            <div
              key={seg.key}
              className="transition-all duration-500"
              style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
            />
          )
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-gray-600 font-medium">
              {seg.label} {seg.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WebResultsPanel({ result, isCalculating, currency, exchangeRate, hsnCode, productName }: Props) {
  const data = result || exampleResult;
  const isExample = !result;
  const effectiveRate = result ? exchangeRate : exampleResult.exchangeRate;
  const effectiveCurrency = result ? currency : 'USD';

  const totalForeign = result
    ? data.totalLandedCostForeign
    : (effectiveRate > 0 ? data.totalLandedCost / effectiveRate : 0);
  const perUnitForeign = result
    ? data.costPerUnitForeign
    : (effectiveRate > 0 ? data.costPerUnit / effectiveRate : 0);

  return (
    <div className="relative">
      {/* Sample data banner */}
      {isExample && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200/60 border-dashed rounded-xl text-center">
          <p className="text-[13px] font-bold text-amber-700">Sample Data</p>
          <p className="text-[11px] text-amber-600/70 mt-0.5">
            This is sample data. Complete the form to see your actual landed cost.
          </p>
        </div>
      )}

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
        className={`space-y-4 ${isExample ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {/* ─── Orange Gradient Total Card ─── */}
        <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
          <p className="text-3xl font-bold mt-1">
            {formatINR(data.totalLandedCost)}
          </p>
          {effectiveCurrency !== 'INR' && (
            <p className="text-sm text-white/70 mt-0.5">{formatForeign(totalForeign, effectiveCurrency)}</p>
          )}
          {data.quantity > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60">Per Unit ({data.quantity} units)</p>
              <p className="text-lg font-bold">
                {formatINR(data.costPerUnit)}
              </p>
              {effectiveCurrency !== 'INR' && (
                <p className="text-xs text-white/60">{formatForeign(perUnitForeign, effectiveCurrency)}</p>
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

        {/* ─── Cost Distribution Bar ─── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Cost Distribution</p>
          <CostDistributionBar data={data} />
        </div>

        {/* ─── Cost Breakdown ─── */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CostBreakdownList
            result={data}
            exchangeRate={effectiveRate}
            currency={effectiveCurrency}
          />
        </div>

        {/* ─── Download Button ─── */}
        {!isExample && (
          <button
            onClick={async () => {
              const { generateQuotePDF } = await import('@/lib/generatePDF');
              await generateQuotePDF({
                result: data,
                currency: effectiveCurrency,
                exchangeRate: effectiveRate,
                hsnCode: hsnCode || '',
                productName: productName || '',
                bcdRate: data.bcdRate,
                igstRate: data.igstRate,
              });
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-brown text-white rounded-xl text-sm font-medium hover:bg-brand-brown/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Quote (PDF)
          </button>
        )}

      </motion.div>
    </div>
  );
}
