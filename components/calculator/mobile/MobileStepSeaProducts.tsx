'use client';

import { motion } from 'framer-motion';
import { Box, Plus, Ruler } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import { type SeaProductItem } from '@/hooks/useSeaCalculatorForm';

interface Props {
  products: SeaProductItem[];
  currency: string;
  exchangeRate: number;
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
}

export default function MobileStepSeaProducts({
  products,
  currency,
  exchangeRate,
  onProductFieldChange,
  onToggleExpanded,
  onAddProduct,
  onRemoveProduct,
  onDuplicateProduct,
}: Props) {
  const totalCbm = products.reduce((s, p) => s + (p.cbm || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {/* CBM Summary */}
      {totalCbm > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600">
          <Ruler className="w-3.5 h-3.5 text-gray-400" />
          Total CBM: <strong>{totalCbm.toFixed(4)} m³</strong>
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
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>
    </motion.div>
  );
}
