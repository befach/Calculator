'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Box, CircleDollarSign, Landmark, Package, Ruler, Shield, Ship, Truck } from 'lucide-react';
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
            <InfoCard icon={Ruler} label="CBM" value={`${result.chargeableCbm.toFixed(3)}`} />
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
          </div>

          <div className="text-[11px] text-gray-400 text-center">
            PDF export for sea quotes will be wired after the sea estimate template is finalized.
          </div>
        </motion.div>
      )}
    </div>
  );
}
