'use client';

import { motion } from 'framer-motion';
import { Box, Plus, Weight, Package as PackageIcon } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import { type ProductItem } from '@/hooks/useCalculatorForm';

interface Props {
  products: ProductItem[];
  currency: string;
  exchangeRate: number;
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
}

function formatCurrency(amount: number, currency: string): string {
  if (amount <= 0) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function WebStepProducts({
  products,
  currency,
  exchangeRate,
  onProductFieldChange,
  onToggleExpanded,
  onAddProduct,
  onRemoveProduct,
  onDuplicateProduct,
}: Props) {
  const totalFob = products.reduce((s, p) => s + (p.fobValue || 0), 0);
  const totalWeight = products.reduce((s, p) => s + (p.chargeableWeight || 0), 0);

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
