'use client';

import { motion } from 'framer-motion';
import { Box, Plus, Package as PackageIcon } from 'lucide-react';
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

      {products.length > 1 && (
        <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <PackageIcon className="w-3.5 h-3.5 text-gray-400" />
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Product Cards — HSN + Product Info only (no dimensions) */}
      <div className="space-y-3">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            totalProducts={products.length}
            currency={currency || 'USD'}
            exchangeRate={exchangeRate}
            showDimensions={false}
            showProductInfo={true}
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
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-brand-orange hover:text-brand-orange hover:bg-brand-orange/5 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Another Product
      </button>
    </motion.div>
  );
}
