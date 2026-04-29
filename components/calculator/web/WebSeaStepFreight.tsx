'use client';

import { motion } from 'framer-motion';
import { Anchor, Info, Ship } from 'lucide-react';
import { findSeaLane, quoteSeaFreight, type SeaIncoterm, type SeaShipmentPreference } from '@/core/seaFreightRates';
import { type SeaProductItem } from '@/hooks/useSeaCalculatorForm';

interface Props {
  incoterm: SeaIncoterm;
  shipmentPreference: SeaShipmentPreference;
  originPort: string;
  destinationPort: string;
  products: SeaProductItem[];
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WebSeaStepFreight({ incoterm, shipmentPreference, originPort, destinationPort, products }: Props) {
  const totalCbm = products.reduce((sum, product) => sum + product.cbm, 0);
  const totalGrossWeight = products.reduce((sum, product) => sum + product.grossWeight, 0);
  const lane = incoterm === 'FOB' ? findSeaLane(originPort, destinationPort) : undefined;
  const quote = lane ? quoteSeaFreight(lane, totalCbm, totalGrossWeight, shipmentPreference) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Ship className="w-5 h-5 text-brand-orange" />
        Freight Review
      </h3>

      {incoterm === 'CIF' ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">CIF selected</p>
              <p className="text-xs text-green-700 mt-1">
                Sea freight and insurance are already included in the supplier invoice. The calculator will use your CIF invoice value directly for duties and destination charges.
              </p>
            </div>
          </div>
        </div>
      ) : quote ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[11px] text-gray-500">Mode</p>
              <p className="text-sm font-bold text-brand-brown mt-1">{quote.shipmentMode.replace('_', ' ')}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[11px] text-gray-500">Freight CBM</p>
              <p className="text-sm font-bold text-brand-brown mt-1">{quote.chargeableCbm.toFixed(3)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[11px] text-gray-500">Transit</p>
              <p className="text-sm font-bold text-brand-brown mt-1">{quote.deliveryEstimate}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-brand-orange" />
              <p className="text-sm font-semibold text-brand-brown">
                {originPort} to {destinationPort}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-gray-500">Low</p>
                <p className="font-semibold text-gray-700">{formatUSD(quote.lowOceanFreightUSD)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">Estimate</p>
                <p className="font-bold text-brand-orange">{formatUSD(quote.oceanFreightUSD)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500">High</p>
                <p className="font-semibold text-gray-700">{formatUSD(quote.highOceanFreightUSD)}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          Select a valid origin and destination port to preview sea freight.
        </div>
      )}
    </motion.div>
  );
}
