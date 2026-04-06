'use client';

import { motion } from 'framer-motion';
import { Box, Plus, Weight, Package as PackageIcon, Ruler } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import { type SeaProductItem } from '@/hooks/useSeaCalculatorForm';
import { CONTAINER_SPECS, type ContainerType } from '@/core/seaFreightRates';

interface Props {
  products: SeaProductItem[];
  currency: string;
  exchangeRate: number;
  shippingMode: string;
  containerType: string;
  numberOfContainers: number;
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
}

function formatCurrency(amount: number, currency: string): string {
  if (amount <= 0) return '\u2014';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function WebStepSeaProducts({
  products,
  currency,
  exchangeRate,
  shippingMode,
  containerType,
  numberOfContainers,
  onProductFieldChange,
  onToggleExpanded,
  onAddProduct,
  onRemoveProduct,
  onDuplicateProduct,
}: Props) {
  const totalFob = products.reduce((s, p) => s + (p.fobValue || 0), 0);
  const totalWeight = products.reduce((s, p) => s + (p.grossWeight || 0), 0);
  const totalCbm = products.reduce((s, p) => s + (p.cbm || 0), 0);

  // Container utilization for FCL
  let cbmUtilization: number | null = null;
  let weightUtilization: number | null = null;
  if (shippingMode === 'FCL' && containerType) {
    const spec = CONTAINER_SPECS[containerType as ContainerType];
    if (spec) {
      const totalContainerCbm = spec.maxCbm * (numberOfContainers || 1);
      const totalContainerWeight = spec.maxPayloadKg * (numberOfContainers || 1);
      cbmUtilization = totalCbm > 0 ? Math.round((totalCbm / totalContainerCbm) * 100) : 0;
      weightUtilization = totalWeight > 0 ? Math.round((totalWeight / totalContainerWeight) * 100) : 0;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Box className="w-5 h-5 text-brand-orange" />
        Products
      </h3>

      {/* Summary bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <PackageIcon className="w-3.5 h-3.5 text-gray-400" />
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
          {totalFob > 0 && (
            <span className="flex items-center gap-1">
              Total FOB: <strong>{formatCurrency(totalFob, currency || 'USD')}</strong>
            </span>
          )}
          {totalWeight > 0 && (
            <span className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-gray-400" />
              {totalWeight.toFixed(1)} kg
            </span>
          )}
          {totalCbm > 0 && (
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-gray-400" />
              {totalCbm.toFixed(4)} CBM
            </span>
          )}
        </div>
      )}

      {/* Container Utilization Bar (FCL only) */}
      {shippingMode === 'FCL' && cbmUtilization !== null && totalCbm > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <p className="text-[11px] font-semibold text-brand-brown">Container Utilization</p>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>Volume: {totalCbm.toFixed(2)} CBM</span>
                <span>{cbmUtilization}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${cbmUtilization > 100 ? 'bg-red-500' : cbmUtilization > 80 ? 'bg-amber-500' : 'bg-brand-orange'}`}
                  style={{ width: `${Math.min(cbmUtilization, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>Weight: {totalWeight.toFixed(1)} kg</span>
                <span>{weightUtilization}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${weightUtilization! > 100 ? 'bg-red-500' : weightUtilization! > 80 ? 'bg-amber-500' : 'bg-brand-orange'}`}
                  style={{ width: `${Math.min(weightUtilization!, 100)}%` }}
                />
              </div>
            </div>
          </div>
          {(cbmUtilization > 100 || weightUtilization! > 100) && (
            <p className="text-[10px] text-red-600 font-medium">
              Warning: Cargo exceeds container capacity. Consider adding more containers.
            </p>
          )}
        </div>
      )}

      {/* Product Cards */}
      <div className="space-y-3">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            totalProducts={products.length}
            currency={currency || 'USD'}
            exchangeRate={exchangeRate}
            onFieldChange={onProductFieldChange}
            onToggleExpanded={onToggleExpanded}
            onRemove={onRemoveProduct}
            onDuplicate={onDuplicateProduct}
          />
        ))}
      </div>

      {/* Add Product Button */}
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
