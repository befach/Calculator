'use client';

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Box, ChevronDown, CircleDollarSign, Landmark, Package, Ruler, Shield, Ship, Truck } from 'lucide-react';
import { type SeaMultiProductResult } from '@/lib/calculateSea';
import { type SeaProductItem } from '@/hooks/useSeaCalculatorForm';

interface Props {
  result: SeaMultiProductResult | null;
  isCalculating: boolean;
  currency: string;
  exchangeRate: number;
  incoterm: string;
  originCountry: string;
  originPort: string;
  destinationPort: string;
  products: SeaProductItem[];
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
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Ship; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-2 sm:p-2.5 text-center min-w-0">
      <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center mx-auto mb-1.5">
        <Icon className="w-3.5 h-3.5 text-brand-orange" />
      </div>
      <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
      <p className="text-xs sm:text-sm font-bold text-brand-brown mt-0.5 truncate">{value}</p>
    </div>
  );
}

function CostRow({
  icon: Icon,
  label,
  value,
  currency,
  exchangeRate,
}: {
  icon: typeof Ship;
  label: string;
  value: number;
  currency: string;
  exchangeRate: number;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between py-2.5 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-brand-orange" />
        </div>
        <span className="text-sm text-gray-700 leading-snug">{label}</span>
      </div>
      <div className="text-right flex-shrink-0 max-w-[45%]">
        <p className="text-sm font-semibold text-brand-brown">{formatINR(value)}</p>
        {currency !== 'INR' && (
          <p className="text-xs text-gray-500">{formatForeign(exchangeRate > 0 ? value / exchangeRate : 0, currency)}</p>
        )}
      </div>
    </div>
  );
}

function ProductBreakdownCard({ product, currency }: {
  product: SeaMultiProductResult['products'][0];
  currency: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-brown truncate">
              {product.productName || 'Unnamed Product'}
            </p>
            <p className="text-[10px] text-gray-500">
              Qty: {product.quantity} | {product.cbm.toFixed(3)} {product.usesProductDimensionEstimate ? 'Est. CBM' : 'CBM'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-right">
          <div>
            <p className="text-xs font-bold text-brand-brown">{formatINR(product.costPerUnit)}</p>
            <p className="text-[9px] text-gray-400">per unit</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div id={detailsId} className="px-2.5 pb-2.5 pt-0 border-t border-gray-100 space-y-1">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            {[
              ['Freight Share', formatINR(product.freightShare)],
              ['Duties & Taxes', formatINR(product.totalDuties)],
              ['Clearance Share', formatINR(product.clearanceShare)],
              ['Total Landed', formatINR(product.totalLandedCost)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-700 tabular-nums">{value}</span>
              </div>
            ))}
          </div>
          {currency !== 'INR' && (
            <div className="pt-1 border-t border-gray-100 flex justify-between text-[10px]">
              <span className="text-gray-500">Per Unit ({currency})</span>
              <span className="font-bold text-brand-brown">{formatForeign(product.costPerUnitForeign, currency)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebSeaResultsPanel({
  result,
  isCalculating,
  currency,
  exchangeRate,
  incoterm,
  originCountry,
  originPort,
  destinationPort,
  products,
}: Props) {
  const totalCbm = products.reduce((sum, product) => sum + product.cbm, 0);
  const averageCostPerUnit = result && result.totalQuantity > 0
    ? result.totalLandedCost / result.totalQuantity
    : 0;
  const averageCostPerUnitForeign = result && result.totalQuantity > 0
    ? result.totalLandedCostForeign / result.totalQuantity
    : 0;

  return (
    <div className="relative">
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl"
          >
            <div className="w-8 h-8 border-3 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {!result ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
            <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">Rs X,XX,XXX</p>
            <p className="text-sm text-white/50 mt-0.5">Complete the form to calculate</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <InfoCard icon={Ship} label="Incoterm" value={incoterm || 'FOB'} />
            <InfoCard icon={Anchor} label="Route" value={originPort ? `${originPort} -> ${destinationPort || 'India'}` : originCountry || destinationPort || 'India'} />
            <InfoCard icon={Package} label="Products" value={`${products.length}`} />
            <InfoCard icon={Ruler} label="CBM" value={totalCbm > 0 ? totalCbm.toFixed(3) : '0.000'} />
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="hidden lg:block bg-gradient-to-br from-[#F29222] to-[#C47518] rounded-xl p-5 text-white shadow-lg">
            <p className="text-sm text-white/80 font-medium">Total Landed Cost</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">{formatINR(result.totalLandedCost)}</p>
            {currency !== 'INR' && (
              <p className="text-sm text-white/70 mt-0.5">{formatForeign(result.totalLandedCostForeign, currency)}</p>
            )}
            {result.totalQuantity > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-[10px] text-white/60">Avg Landed Price / Unit</p>
                <p className="text-lg font-bold">{formatINR(averageCostPerUnit)}</p>
                {currency !== 'INR' && (
                  <p className="text-xs text-white/60">{formatForeign(averageCostPerUnitForeign, currency)}</p>
                )}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
              <Truck className="w-4 h-4 text-white/70" />
              <div>
                <p className="text-[10px] text-white/60">Estimated Sea Transit</p>
                <p className="text-sm font-semibold">{result.deliveryEstimate}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <InfoCard icon={Ship} label="Mode" value={result.shipmentMode.replace('_', ' ')} />
            <InfoCard icon={Anchor} label="Port" value={result.destinationPort || 'India'} />
            <InfoCard icon={Box} label="Container" value={result.containerCount40 || result.containerCount20 ? `${result.containerCount40}x40ft ${result.containerCount20}x20ft` : 'LCL'} />
            <InfoCard icon={Ruler} label={result.usesProductDimensionEstimate ? 'Est. CBM' : 'CBM'} value={`${result.chargeableCbm.toFixed(3)}`} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-amber-800">Estimated landed cost</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              These costs are estimates and may change after final supplier, freight, and customs confirmation.
              {result.usesProductDimensionEstimate && ' For a more accurate quote, calculate with final package dimensions from your supplier.'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Cost Breakdown</p>
            <CostRow icon={CircleDollarSign} label={result.incoterm === 'CIF' ? 'CIF Invoice Value' : 'FOB Value'} value={result.totalFobINR} exchangeRate={exchangeRate} currency={currency} />
            {result.incoterm === 'FOB' && (
              <>
                <CostRow icon={Ship} label="Sea Freight" value={result.totalFreight} exchangeRate={exchangeRate} currency={currency} />
                <CostRow icon={Shield} label="Insurance (0.5%)" value={result.totalInsurance} exchangeRate={exchangeRate} currency={currency} />
              </>
            )}
            <CostRow icon={Landmark} label="Import Duties & Taxes" value={result.totalDuties} exchangeRate={exchangeRate} currency={currency} />
            <CostRow icon={Anchor} label="Port, Documentation & Clearance" value={result.clearanceCharges} exchangeRate={exchangeRate} currency={currency} />
            {result.inlandTransport > 0 && (
              <CostRow icon={Truck} label="Inland Transport" value={result.inlandTransport} exchangeRate={exchangeRate} currency={currency} />
            )}
          </div>

          <div className="lg:hidden bg-brand-brown rounded-xl p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Total Landed Cost</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">{formatINR(result.totalLandedCost)}</p>
            {currency !== 'INR' && (
              <p className="text-sm text-white/70 mt-0.5">{formatForeign(result.totalLandedCostForeign, currency)}</p>
            )}
            {result.totalQuantity > 0 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-[10px] text-white/60">Avg Landed Price / Unit</p>
                <p className="text-base font-bold">{formatINR(averageCostPerUnit)}</p>
                {currency !== 'INR' && (
                  <p className="text-[10px] text-white/60">{formatForeign(averageCostPerUnitForeign, currency)}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-brand-brown uppercase tracking-wider mb-3">Landed Price Per Product</p>
            <div className="space-y-2">
              {result.products.map((product, index) => (
                <ProductBreakdownCard
                  key={`${product.hsnCode}-${index}`}
                  product={product}
                  currency={currency}
                />
              ))}
            </div>
          </div>

          <div className="text-[11px] text-gray-400 text-center">
            PDF export for sea quotes will be wired after the sea estimate template is finalized.
          </div>
        </motion.div>
      )}
    </div>
  );
}
