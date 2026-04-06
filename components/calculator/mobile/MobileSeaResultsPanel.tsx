'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Weight, Box, Ruler, Download, ChevronDown, Package, Ship, Container } from 'lucide-react';
import { type SeaFreightResult } from '@/lib/calculateSea';
import { CONTAINER_SPECS, type ContainerType } from '@/core/seaFreightRates';
import SeaCostBreakdownList from '../shared/SeaCostBreakdownList';
import PDFFormModal from '../shared/PDFFormModal';

interface Props {
  result: SeaFreightResult | null;
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

function InfoCard({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-2 text-center min-w-0 overflow-hidden">
      <div className="w-6 h-6 rounded-md bg-brand-orange/10 flex items-center justify-center mx-auto mb-1">
        <Icon className="w-3 h-3 text-brand-orange" />
      </div>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
      <p className="text-xs font-bold text-brand-brown truncate leading-tight mt-0.5">{value}</p>
    </div>
  );
}

const DISTRIBUTION_COLORS = [
  { key: 'fob', label: 'FOB', color: '#F29222' },
  { key: 'freight', label: 'Freight', color: '#E8A54C' },
  { key: 'duties', label: 'Duties', color: '#C47518' },
  { key: 'fees', label: 'Fees', color: '#8B5E3C' },
];

function CostDistributionBar({ data }: { data: SeaFreightResult }) {
  const segments = [
    { ...DISTRIBUTION_COLORS[0], percent: data.fobPercent },
    { ...DISTRIBUTION_COLORS[1], percent: data.freightPercent },
    { ...DISTRIBUTION_COLORS[2], percent: data.dutiesPercent },
    { ...DISTRIBUTION_COLORS[3], percent: data.additionalPercent },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
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
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[9px] text-gray-600 font-medium">
              {seg.label} {seg.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductBreakdownCard({ product, currency }: {
  product: SeaFreightResult['products'][0];
  currency: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-3 h-3 text-brand-orange flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-brand-brown truncate">
              {product.productName || 'Unnamed Product'}
            </p>
            <p className="text-[9px] text-gray-500">
              HSN: {product.hsnCode} | Qty: {product.quantity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold text-brand-brown">{formatINR(product.totalLandedCost)}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 pt-0 border-t border-gray-100 space-y-1">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
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
            <div className="pt-1 border-t border-gray-100 flex justify-between text-[10px]">
              <span className="text-gray-500">Per Unit ({product.quantity})</span>
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

export default function MobileSeaResultsPanel({ result, isCalculating, currency, exchangeRate }: Props) {
  const [showFormModal, setShowFormModal] = useState(false);

  if (!result && !isCalculating) return null;

  const data = result;

  const containerLabel = data?.containerType
    ? CONTAINER_SPECS[data.containerType]?.shortLabel || data.containerType
    : '';

  return (
    <div className="relative mt-6">
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
          <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-2xl font-bold mt-1">
              {formatINR(data.totalLandedCost)}
            </p>
            {currency !== 'INR' && (
              <p className="text-xs text-white/70">{formatForeign(data.totalLandedCostForeign, currency)}</p>
            )}
            {data.products.length > 1 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/60">{data.products.length} Products | {data.totalQuantity} Total Units</p>
              </div>
            )}
            {data.products.length === 1 && data.totalQuantity > 1 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/60">Per Unit ({data.totalQuantity} units)</p>
                <p className="text-base font-bold">
                  {formatINR(data.products[0].costPerUnit)}
                </p>
                {currency !== 'INR' && (
                  <p className="text-[10px] text-white/60">{formatForeign(data.products[0].costPerUnitForeign, currency)}</p>
                )}
              </div>
            )}
            {/* Delivery */}
            <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
              <Ship className="w-3.5 h-3.5 text-white/70" />
              <div>
                <p className="text-[9px] text-white/60">
                  {data.shippingMode}{containerLabel ? ` (${containerLabel})` : ''}
                </p>
                <p className="text-xs font-semibold">{data.deliveryEstimate}</p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-1.5">
            <InfoCard icon={MapPin} label="Route" value={`${data.originCountry || '\u2014'} \u2192 India`} />
            <InfoCard icon={Weight} label="Gross Weight" value={`${data.totalGrossWeight} kg`} />
            <InfoCard
              icon={data.shippingMode === 'FCL' ? Container : Box}
              label={data.shippingMode === 'FCL' ? 'Container' : 'Products'}
              value={data.shippingMode === 'FCL'
                ? `${containerLabel}${data.numberOfContainers && data.numberOfContainers > 1 ? ` x${data.numberOfContainers}` : ''}`
                : `${data.products.length} items`
              }
            />
            <InfoCard icon={Ruler} label="CBM" value={`${data.totalCbm.toFixed(4)} m\u00B3`} />
          </div>

          {/* Cost Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <p className="text-[10px] font-bold text-brand-brown uppercase tracking-wider mb-2">Cost Distribution</p>
            <CostDistributionBar data={data} />
          </div>

          {/* Per-Product Breakdown */}
          {data.products.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-[10px] font-bold text-brand-brown uppercase tracking-wider mb-2">Per-Product Breakdown</p>
              <div className="space-y-1.5">
                {data.products.map((product, i) => (
                  <ProductBreakdownCard key={i} product={product} currency={currency} />
                ))}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <SeaCostBreakdownList
              result={data}
              exchangeRate={exchangeRate}
              currency={currency}
            />
          </div>

          {/* Download */}
          <button
            onClick={() => setShowFormModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-brown text-white rounded-xl text-sm font-medium hover:bg-brand-brown/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Quote (PDF)
          </button>
        </motion.div>
      )}

      <PDFFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onDownload={async () => {
          const { generateSeaQuotePDF } = await import('@/lib/generateSeaPDF');
          await generateSeaQuotePDF({
            result: data!,
            currency,
            exchangeRate,
          });
        }}
      />
    </div>
  );
}
