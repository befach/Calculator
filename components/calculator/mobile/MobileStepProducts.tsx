'use client';

import { motion } from 'framer-motion';
import { Plus, Weight, Package as PackageIcon, Plane } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import { type ProductItem } from '@/hooks/useCalculatorForm';

interface Props {
  products: ProductItem[];
  currency: string;
  exchangeRate: number;
  userFreightCostINR: number;
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepProducts({
  products,
  currency,
  exchangeRate,
  userFreightCostINR,
  onProductFieldChange,
  onToggleExpanded,
  onAddProduct,
  onRemoveProduct,
  onDuplicateProduct,
  onFieldChange,
}: Props) {
  const totalWeight = products.reduce((s, p) => s + (p.chargeableWeight || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {/* Summary */}
      {products.length > 0 && (
        <div className="flex items-center gap-3 px-2.5 py-1.5 bg-gray-50 rounded-lg text-[11px] text-gray-600">
          <span className="flex items-center gap-1">
            <PackageIcon className="w-3 h-3 text-gray-400" />
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
          {totalWeight > 0 && (
            <span className="flex items-center gap-1">
              <Weight className="w-3 h-3 text-gray-400" />
              {totalWeight.toFixed(1)} kg
            </span>
          )}
        </div>
      )}

      {/* Product Cards */}
      <div className="space-y-2">
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

      <button
        type="button"
        onClick={onAddProduct}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Product
      </button>

      {/* Air Freight Cost (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 text-brand-orange" />
          <span className="text-xs font-semibold text-brand-brown">Your Air Freight Cost (Optional)</span>
        </div>
        <div>
          <input
            type="number"
            min="0"
            placeholder="Leave blank for Befach express rates"
            value={userFreightCostINR || ''}
            onChange={(e) => onFieldChange('userFreightCostINR', e.target.value ? parseFloat(e.target.value) : 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            18% GST will be added if entered. Leave blank for Befach express rates (3–5 days).
          </p>
        </div>
      </div>
    </motion.div>
  );
}
