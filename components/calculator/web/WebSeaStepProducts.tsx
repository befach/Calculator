'use client';

import { motion } from 'framer-motion';
import { Box, Package as PackageIcon, Plus, Ruler } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import {
  SEA_CONTAINER_CAPACITY,
  type SeaIncoterm,
  type SeaShipmentPreference,
} from '@/core/seaFreightRates';
import { type SeaProductItem } from '@/hooks/useSeaCalculatorForm';

interface Props {
  incoterm: SeaIncoterm;
  shipmentPreference: SeaShipmentPreference;
  products: SeaProductItem[];
  currency: string;
  exchangeRate: number;
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
}

export default function WebSeaStepProducts({
  incoterm,
  shipmentPreference,
  products,
  currency,
  exchangeRate,
  onProductFieldChange,
  onToggleExpanded,
  onAddProduct,
  onRemoveProduct,
  onDuplicateProduct,
}: Props) {
  const totalCbm = products.reduce((sum, product) => sum + (product.cbm || 0), 0);
  const totalPackages = products.reduce((sum, product) => sum + (product.numPackages || 0), 0);
  const usesProductDimensionEstimate = products.some((product) => product.dimensionMode === 'product');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-3 sm:space-y-4"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Box className="w-5 h-5 text-brand-orange" />
        Products & Packing
      </h3>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <PackageIcon className="w-3.5 h-3.5 text-gray-400" />
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
        {totalCbm > 0 && (
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-gray-400" />
            {usesProductDimensionEstimate ? 'Est. ' : ''}{totalCbm.toFixed(3)} CBM
          </span>
        )}
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            totalProducts={products.length}
            currency={currency || 'USD'}
            exchangeRate={exchangeRate}
            valueLabel={incoterm === 'CIF' ? 'CIF Invoice Value' : 'FOB Value'}
            freightMode="sea"
            showDimensionVisuals={false}
            onFieldChange={onProductFieldChange}
            onToggleExpanded={onToggleExpanded}
            onRemove={onRemoveProduct}
            onDuplicate={onDuplicateProduct}
          />
        ))}
      </div>

      {totalCbm > 0 && (
        <ContainerUtilization
          shipmentPreference={shipmentPreference}
          totalCbm={totalCbm}
          totalPackages={totalPackages}
        />
      )}

      <button
        type="button"
        onClick={onAddProduct}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Another Product
      </button>
    </motion.div>
  );
}

function ContainerUtilization({
  shipmentPreference,
  totalCbm,
  totalPackages: _totalPackages,
}: {
  shipmentPreference: SeaShipmentPreference;
  totalCbm: number;
  totalPackages: number;
}) {
  if (shipmentPreference === 'LCL') {
    const considerFcl = totalCbm >= 13;
    const planningCapacityCbm = SEA_CONTAINER_CAPACITY.FCL_20.recommendedCbm;
    const consumedPercent = planningCapacityCbm > 0
      ? Math.min((totalCbm / planningCapacityCbm) * 100, 999)
      : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
        <ContainerWireframe usedPercent={Math.min(consumedPercent, 100)} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-sm">
          <div>
            <p className="font-bold text-brand-brown">LCL Shared Container</p>
            <p className="text-xs text-gray-500">Capacity: {planningCapacityCbm} CBM planning space</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold text-brand-orange">{totalCbm.toFixed(3)} CBM</p>
            <p className="text-xs text-gray-500">{consumedPercent.toFixed(0)}% consumed</p>
          </div>
        </div>

        {considerFcl && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Your volume is near the LCL/FCL crossover. Compare with FCL 20ft pricing.
          </p>
        )}
      </div>
    );
  }

  const capacity = SEA_CONTAINER_CAPACITY[shipmentPreference];
  const recommendedPercent = capacity.recommendedCbm > 0
    ? Math.min((totalCbm / capacity.recommendedCbm) * 100, 999)
    : 0;
  const maxPercent = capacity.maxCbm > 0
    ? Math.min((totalCbm / capacity.maxCbm) * 100, 999)
    : 0;
  const usedPercent = Math.min(recommendedPercent, 100);
  const isOverRecommended = totalCbm > capacity.recommendedCbm;
  const isOverMax = totalCbm > capacity.maxCbm;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
      <ContainerWireframe usedPercent={usedPercent} />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
        <div>
          <p className="text-sm font-bold text-brand-brown">{capacity.label} Container</p>
          <p className="text-xs text-gray-500">
            Capacity: {capacity.recommendedCbm} CBM recommended / {capacity.maxCbm} CBM max
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-lg font-bold text-brand-orange">{totalCbm.toFixed(3)} CBM</p>
          <p className="text-xs text-gray-500">{recommendedPercent.toFixed(0)}% consumed</p>
        </div>
      </div>

      {isOverMax ? (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          This shipment exceeds the container max capacity. Choose a larger or multiple-container shipment.
        </p>
      ) : isOverRecommended ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          This shipment exceeds the recommended planning capacity but is below the max container volume.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Max-capacity utilization: {maxPercent.toFixed(0)}%.
        </p>
      )}
    </div>
  );
}

function ContainerWireframe({ usedPercent }: { usedPercent: number }) {
  const segments = 10;
  const filledSegments = Math.ceil((Math.max(usedPercent, 0) / 100) * segments);
  const topOffset = 38;
  const frontY = 58;
  const bottomY = 142;
  const leftX = 24;
  const rightX = 346;
  const depthX = 42;
  const depthY = 30;
  const segmentWidth = (rightX - leftX) / segments;

  return (
    <div className="rounded-xl bg-[#111111] px-2.5 sm:px-3 py-3 sm:py-4 overflow-hidden">
      <svg viewBox="0 0 410 180" className="w-full h-auto max-h-36 sm:max-h-none" role="img" aria-label="Container space utilization">
        {Array.from({ length: segments }).map((_, index) => {
          if (index >= filledSegments) return null;
          const x = leftX + index * segmentWidth;
          const topX = x + depthX;
          return (
            <g key={index}>
              <polygon
                points={`${x},${frontY} ${x + segmentWidth},${frontY} ${x + segmentWidth},${bottomY} ${x},${bottomY}`}
                fill="rgba(242,146,34,0.42)"
              />
              <polygon
                points={`${x},${frontY} ${x + segmentWidth},${frontY} ${topX + segmentWidth},${topOffset} ${topX},${topOffset}`}
                fill="rgba(242,146,34,0.28)"
              />
            </g>
          );
        })}

        <polyline points={`${leftX},${frontY} ${leftX + depthX},${topOffset} ${rightX + depthX},${topOffset} ${rightX},${frontY} ${leftX},${frontY}`} fill="none" stroke="#d8d8d8" strokeWidth="2.5" />
        <polyline points={`${leftX},${frontY} ${leftX},${bottomY} ${rightX},${bottomY} ${rightX},${frontY}`} fill="none" stroke="#d8d8d8" strokeWidth="2.5" />
        <polyline points={`${rightX},${frontY} ${rightX + depthX},${topOffset} ${rightX + depthX},${bottomY - depthY} ${rightX},${bottomY}`} fill="none" stroke="#d8d8d8" strokeWidth="2.5" />
        <polyline points={`${leftX},${bottomY} ${leftX + depthX},${bottomY - depthY} ${rightX + depthX},${bottomY - depthY}`} fill="none" stroke="#d8d8d8" strokeWidth="2.5" />

        {Array.from({ length: segments + 1 }).map((_, index) => {
          const x = leftX + index * segmentWidth;
          const topX = leftX + depthX + index * segmentWidth;
          return (
            <g key={index}>
              <line x1={x} y1={frontY} x2={x} y2={bottomY} stroke="#d8d8d8" strokeWidth="1.5" opacity="0.9" />
              <line x1={x} y1={frontY} x2={topX} y2={topOffset} stroke="#d8d8d8" strokeWidth="1.5" opacity="0.9" />
            </g>
          );
        })}

        <line x1={leftX} y1={bottomY} x2={leftX + depthX} y2={bottomY - depthY} stroke="#d8d8d8" strokeWidth="2" />
        <line x1={rightX} y1={bottomY} x2={rightX + depthX} y2={bottomY - depthY} stroke="#d8d8d8" strokeWidth="2" />
      </svg>
    </div>
  );
}
