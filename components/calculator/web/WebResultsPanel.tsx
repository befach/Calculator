'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Weight, Box, Ruler, Download, ChevronDown, Package, Truck } from 'lucide-react';
import { type MultiProductResult } from '@/lib/calculate';
import CostBreakdownList from '../shared/CostBreakdownList';
import PDFFormModal from '../shared/PDFFormModal';

interface Props {
  result: MultiProductResult | null;
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
const exampleResult: MultiProductResult = {
  originCountry: 'China',
  originZone: 3,
  destinationCity: 'Mumbai',
  clearancePort: 'Mumbai',
  currency: 'USD',
  exchangeRate: 83.12,

  totalVolumetricWeight: 12,
  totalGrossWeight: 8,
  totalChargeableWeight: 12,
  totalCbm: 0.06,

  baseFreight: 13301,
  fuelSurcharge: 3990,
  totalFreight: 17291,

  totalFobINR: 83120,
  totalInsurance: 502,
  totalCifValue: 100913,
  totalDuties: 31263,
  clearanceCharges: 3700,
  inlandTransport: 1200,
  totalAdditionalCharges: 4900,
  totalLandedCost: 137076,
  totalQuantity: 100,

  totalLandedCostForeign: 1649,

  fobPercent: 60.6,
  freightPercent: 13.0,
  dutiesPercent: 22.8,
  additionalPercent: 3.6,

  isUserFreight: false,
  deliveryEstimate: '3\u20135 business days',

  products: [{
    productName: 'Sample Product',
    hsnCode: '8471.30',
    quantity: 100,
    volumetricWeight: 12,
    grossWeight: 8,
    chargeableWeight: 12,
    cbm: 0.06,
    fobValueOriginal: 1000,
    fobValueINR: 83120,
    freightShare: 17291,
    insurance: 502,
    cifValue: 100913,
    bcdRate: 10,
    basicCustomsDuty: 10091,
    socialWelfareSurcharge: 1009,
    igstRate: 18,
    igst: 20163,
    totalDuties: 31263,
    clearanceShare: 3700,
    inlandShare: 1200,
    totalLandedCost: 137076,
    costPerUnit: 1371,
    totalLandedCostForeign: 1649,
    costPerUnitForeign: 16.49,
  }],
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

function CostDistributionBar({ data }: { data: MultiProductResult }) {
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

function ProductBreakdownCard({ product, currency, exchangeRate }: {
  product: MultiProductResult['products'][0];
  currency: string;
  exchangeRate: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-brown truncate">
              {product.productName || 'Unnamed Product'}
            </p>
            <p className="text-[10px] text-gray-500">
              HSN: {product.hsnCode} | Qty: {product.quantity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-brand-brown">{formatINR(product.totalLandedCost)}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100 space-y-1.5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {[
              ['FOB Value', formatINR(product.fobValueINR)],
              ['Freight Share', formatINR(product.freightShare)],
              ['Insurance', formatINR(product.insurance)],
              ['CIF Value', formatINR(product.cifValue)],
              [`BCD (${product.bcdRate}%)`, formatINR(product.basicCustomsDuty)],
              ['SWS', formatINR(product.socialWelfareSurcharge)],
              [`IGST (${product.igstRate}%)`, formatINR(product.igst)],
              ['Total Duties', formatINR(product.totalDuties)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-700 tabular-nums">{value}</span>
              </div>
            ))}
          </div>
          {product.quantity > 1 && (
            <div className="pt-1.5 border-t border-gray-100 flex justify-between text-[11px]">
              <span className="text-gray-500">Per Unit ({product.quantity} units)</span>
              <span className="font-bold text-brand-brown">
                {formatINR(product.costPerUnit)}
                {currency !== 'INR' && (
                  <span className="text-gray-400 ml-1">({formatForeign(product.costPerUnitForeign, currency)})</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebResultsPanel({ result, isCalculating, currency, exchangeRate }: Props) {
  const [showFormModal, setShowFormModal] = useState(false);
  const data = result || exampleResult;
  const isExample = !result;
  const effectiveRate = result ? exchangeRate : exampleResult.exchangeRate;
  const effectiveCurrency = result ? currency : 'USD';

  const totalForeign = data.totalLandedCostForeign;

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

      {/* Watermark overlay for sample data */}
      {isExample && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-bold text-gray-300/80 rotate-[-15deg] select-none tracking-widest">
            SAMPLE PREVIEW
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
        className={`space-y-4 ${isExample ? 'opacity-20 blur-[1px] pointer-events-none' : ''}`}
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
          {data.products.length > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60">{data.products.length} Products | {data.totalQuantity} Total Units</p>
            </div>
          )}
          {data.products.length === 1 && data.totalQuantity > 1 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60">Per Unit ({data.totalQuantity} units)</p>
              <p className="text-lg font-bold">
                {formatINR(data.products[0].costPerUnit)}
              </p>
              {effectiveCurrency !== 'INR' && (
                <p className="text-xs text-white/60">{formatForeign(data.products[0].costPerUnitForeign, effectiveCurrency)}</p>
              )}
            </div>
          )}
          {/* Delivery Estimate */}
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
            <Truck className="w-4 h-4 text-white/70" />
            <div>
              <p className="text-[10px] text-white/60">Estimated Delivery</p>
              <p className="text-sm font-semibold">{data.deliveryEstimate}</p>
            </div>
          </div>
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
            value={`${data.totalChargeableWeight} kg`}
          />
          <InfoCard
            icon={Box}
            label={data.products.length > 1 ? 'Products' : 'Gross Weight'}
            value={data.products.length > 1 ? `${data.products.length} items` : `${data.totalGrossWeight} kg`}
          />
          <InfoCard
            icon={Ruler}
            label="CBM"
            value={`${data.totalCbm.toFixed(4)} m³`}
          />
        </div>

        {/* ─── Cost Distribution Bar ─── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Cost Distribution</p>
          <CostDistributionBar data={data} />
        </div>

        {/* ─── Per-Product Breakdown (only if multiple products) ─── */}
        {data.products.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Per-Product Breakdown</p>
            <div className="space-y-2">
              {data.products.map((product, i) => (
                <ProductBreakdownCard
                  key={i}
                  product={product}
                  currency={effectiveCurrency}
                  exchangeRate={effectiveRate}
                />
              ))}
            </div>
          </div>
        )}

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
            onClick={() => setShowFormModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-brown text-white rounded-xl text-sm font-medium hover:bg-brand-brown/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Quote (PDF)
          </button>
        )}

      </motion.div>

      <PDFFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onDownload={async () => {
          const { generateQuotePDF } = await import('@/lib/generatePDF');
          await generateQuotePDF({
            result: data,
            currency: effectiveCurrency,
            exchangeRate: effectiveRate,
          });
        }}
      />
    </div>
  );
}
