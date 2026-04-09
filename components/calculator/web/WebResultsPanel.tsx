'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Weight, Box, Ruler, Download, ChevronDown, Package, Truck, Check, Circle } from 'lucide-react';
import { type MultiProductResult } from '@/lib/calculate';
import { type ProductItem } from '@/hooks/useCalculatorForm';
import CostBreakdownList from '../shared/CostBreakdownList';
import PDFFormModal from '../shared/PDFFormModal';

interface Props {
  result: MultiProductResult | null;
  isCalculating: boolean;
  currency: string;
  exchangeRate: number;
  // Form state for input review (before calculation)
  originCountryCode: string;
  products: ProductItem[];
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  userFreightCostINR: number;
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

// ─── Input Review Checklist (shown before calculation) ─────────────────

interface ReviewItem {
  label: string;
  value: string;
  filled: boolean;
}

function InputReviewChecklist({
  originCountryCode,
  currency,
  exchangeRate,
  products,
  includeInlandDelivery,
  clearancePort,
  destinationCity,
  inlandZone,
  userFreightCostINR,
}: {
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  products: ProductItem[];
  includeInlandDelivery: boolean;
  clearancePort: string;
  destinationCity: string;
  inlandZone: string;
  userFreightCostINR: number;
}) {
  const routeItems: ReviewItem[] = [
    { label: 'Origin Country', value: originCountryCode || '—', filled: !!originCountryCode },
    { label: 'Currency', value: currency || '—', filled: !!currency },
    { label: 'Exchange Rate', value: exchangeRate > 0 ? `₹${exchangeRate}` : '—', filled: exchangeRate > 0 },
  ];

  const productItems: ReviewItem[][] = products.map((p, i) => {
    const name = p.productName || `Product ${i + 1}`;
    const hasDims = p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0;
    const dimLabel = p.dimensionMode === 'product' ? 'Product Dimensions' : 'Package Dimensions';
    const dimValue = hasDims ? `${p.lengthCm} × ${p.widthCm} × ${p.heightCm} cm` : '—';

    return [
      { label: 'Product Name', value: name, filled: !!p.productName },
      { label: 'HSN Code', value: p.hsnCode || '—', filled: !!p.hsnCode },
      { label: 'Quantity', value: p.quantity > 0 ? `${p.quantity} units` : '—', filled: p.quantity > 0 },
      { label: dimLabel, value: dimValue, filled: hasDims },
      { label: 'Weight', value: p.actualWeightKg > 0 ? `${p.actualWeightKg} kg` : '—', filled: p.actualWeightKg > 0 },
      ...(p.dimensionMode === 'box'
        ? [{ label: 'No. of Packages', value: p.numPackages > 0 ? `${p.numPackages} pcs` : '—', filled: p.numPackages > 0 }]
        : []),
      ...(p.packingResult
        ? [{ label: 'Best-Fit Box', value: `${p.packingResult.box.label} (${p.packingResult.totalBoxes} boxes)`, filled: true }]
        : []),
    ];
  });

  const deliveryItems: ReviewItem[] = [
    { label: 'Air Freight Cost', value: userFreightCostINR > 0 ? `₹${userFreightCostINR.toLocaleString()}` : 'Befach Express Rates', filled: true },
    { label: 'Inland Delivery', value: includeInlandDelivery ? 'Yes' : 'No', filled: true },
    ...(includeInlandDelivery ? [
      { label: 'Clearance Port', value: clearancePort || '—', filled: !!clearancePort },
      { label: 'Destination City', value: destinationCity || '—', filled: !!destinationCity },
      { label: 'Inland Zone', value: inlandZone || '—', filled: !!inlandZone },
    ] : []),
  ];

  const allItems = [
    ...routeItems,
    ...productItems.flat(),
    ...deliveryItems,
  ];
  const filledCount = allItems.filter(i => i.filled).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-gray-600">Form Progress</p>
          <p className="text-sm font-bold text-brand-orange">{progressPercent}%</p>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-orange to-[#E8A54C] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {filledCount} of {totalCount} fields completed
        </p>
      </div>

      {/* Route & Currency */}
      <ReviewSection title="Route & Currency" items={routeItems} />

      {/* Products */}
      {productItems.map((items, i) => (
        <ReviewSection
          key={i}
          title={products.length > 1 ? `Product ${i + 1}` : 'Product Details'}
          items={items}
        />
      ))}

      {/* Delivery */}
      <ReviewSection title="Freight & Delivery" items={deliveryItems} />
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: ReviewItem[] }) {
  const filledCount = items.filter(i => i.filled).length;
  const allFilled = filledCount === items.length;

  return (
    <div className={`rounded-lg border p-3 ${allFilled ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        {allFilled && (
          <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            {item.filled ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
            )}
            <div className="flex-1 flex justify-between items-center min-w-0 gap-3">
              <span className={`text-xs ${item.filled ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
              <span className={`text-xs font-semibold truncate ${item.filled ? 'text-brand-brown' : 'text-gray-300'}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Real Results Components ─────────────────────────────────────────

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

// ─── Main Component ──────────────────────────────────────────────────

export default function WebResultsPanel({
  result,
  isCalculating,
  currency,
  exchangeRate,
  originCountryCode,
  products,
  includeInlandDelivery,
  clearancePort,
  destinationCity,
  inlandZone,
  userFreightCostINR,
}: Props) {
  const [showFormModal, setShowFormModal] = useState(false);
  const isExample = !result;

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

      {isExample ? (
        /* ─── Pre-Calculation View: Masked Preview + Input Review ─── */
        <div className="space-y-4">
          {/* Masked Total Landed Cost Card */}
          <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
            <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-3xl font-bold mt-1">₹X,XX,XXX</p>
            <p className="text-sm text-white/50 mt-0.5">Complete the form to calculate</p>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
              <Truck className="w-4 h-4 text-white/50" />
              <div>
                <p className="text-[10px] text-white/40">Estimated Delivery</p>
                <p className="text-sm font-semibold text-white/60">X–X business days</p>
              </div>
            </div>
          </div>

          {/* Masked Info Cards */}
          <div className="grid grid-cols-4 gap-2">
            <InfoCard icon={MapPin} label="Route" value="— → India" />
            <InfoCard icon={Weight} label="Chargeable Wt" value="XX kg" />
            <InfoCard icon={Box} label="Gross Weight" value="XX kg" />
            <InfoCard icon={Ruler} label="CBM" value="X.XXXX m³" />
          </div>

          {/* Input Review Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Your Inputs</p>
            <InputReviewChecklist
              originCountryCode={originCountryCode}
              currency={currency}
              exchangeRate={exchangeRate}
              products={products}
              includeInlandDelivery={includeInlandDelivery}
              clearancePort={clearancePort}
              destinationCity={destinationCity}
              inlandZone={inlandZone}
              userFreightCostINR={userFreightCostINR}
            />
          </div>
        </div>
      ) : (
        /* ─── Post-Calculation View: Full Results ─── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Orange Gradient Total Card */}
          <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
            <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-3xl font-bold mt-1">
              {formatINR(result.totalLandedCost)}
            </p>
            {currency !== 'INR' && (
              <p className="text-sm text-white/70 mt-0.5">{formatForeign(result.totalLandedCostForeign, currency)}</p>
            )}
            {result.products.length > 1 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-white/60">{result.products.length} Products | {result.totalQuantity} Total Units</p>
              </div>
            )}
            {result.products.length === 1 && result.totalQuantity > 1 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-white/60">Per Unit ({result.totalQuantity} units)</p>
                <p className="text-lg font-bold">
                  {formatINR(result.products[0].costPerUnit)}
                </p>
                {currency !== 'INR' && (
                  <p className="text-xs text-white/60">{formatForeign(result.products[0].costPerUnitForeign, currency)}</p>
                )}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
              <Truck className="w-4 h-4 text-white/70" />
              <div>
                <p className="text-[10px] text-white/60">Estimated Delivery</p>
                <p className="text-sm font-semibold">{result.deliveryEstimate}</p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-4 gap-2">
            <InfoCard icon={MapPin} label="Route" value={`${result.originCountry || '—'} → India`} />
            <InfoCard icon={Weight} label="Chargeable Wt" value={`${result.totalChargeableWeight} kg`} />
            <InfoCard icon={Box} label={result.products.length > 1 ? 'Products' : 'Gross Weight'} value={result.products.length > 1 ? `${result.products.length} items` : `${result.totalGrossWeight} kg`} />
            <InfoCard icon={Ruler} label="CBM" value={`${result.totalCbm.toFixed(4)} m³`} />
          </div>

          {/* Cost Distribution Bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Cost Distribution</p>
            <CostDistributionBar data={result} />
          </div>

          {/* Per-Product Breakdown */}
          {result.products.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Per-Product Breakdown</p>
              <div className="space-y-2">
                {result.products.map((product, i) => (
                  <ProductBreakdownCard key={i} product={product} currency={currency} exchangeRate={exchangeRate} />
                ))}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <CostBreakdownList result={result} exchangeRate={exchangeRate} currency={currency} />
          </div>

          {/* Download Button */}
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
          if (!result) return;
          const { generateQuotePDF } = await import('@/lib/generatePDF');
          await generateQuotePDF({
            result,
            currency,
            exchangeRate,
          });
        }}
      />
    </div>
  );
}
