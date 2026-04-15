'use client';

import { motion } from 'framer-motion';
import { Ruler, Package, Info } from 'lucide-react';
import PackageDimensionFields from '../shared/PackageDimensionFields';
import { type ProductItem } from '@/hooks/useCalculatorForm';

interface Props {
  products: ProductItem[];
  dimensionMode: 'box' | 'product';
  onProductFieldChange: (productId: string, field: string, value: unknown) => void;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepDimensions({ products, dimensionMode, onProductFieldChange, onFieldChange }: Props) {
  const isProductMode = dimensionMode === 'product';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Ruler className="w-5 h-5 text-brand-orange" />
        Dimensions & Weight
      </h3>

      {/* Global Dimension Mode Toggle */}
      <div>
        <p className="text-xs text-gray-500 mb-2">How would you like to enter dimensions?</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => onFieldChange('dimensionMode', 'box')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all ${
              !isProductMode
                ? 'bg-brand-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            I have package dimensions
          </button>
          <button
            type="button"
            onClick={() => onFieldChange('dimensionMode', 'product')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all ${
              isProductMode
                ? 'bg-brand-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            I only have product dimensions
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {isProductMode
            ? 'We\'ll auto-calculate the best box size for your products.'
            : 'Package dimensions are preferred for accurate pricing.'}
        </p>
      </div>

      {isProductMode && (
        <div className="bg-amber-50/50 border border-amber-200/40 rounded-lg px-3 py-2 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-600 leading-relaxed">
            Values are estimated based on your product dimensions. For accurate pricing, use package dimensions from your supplier.
          </p>
        </div>
      )}

      {/* Per-product dimension fields */}
      {products.map((product, i) => {
        const handleFieldChange = (field: string, value: unknown) => {
          onProductFieldChange(product.id, field, value);
        };
        const productLabel = product.productName || `Product ${i + 1}`;

        return (
          <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-sm font-semibold text-brand-brown">{productLabel}</span>
              {product.hsnCode && (
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                  HSN: {product.hsnCode}
                </span>
              )}
              {product.quantity > 0 && (
                <span className="text-[10px] text-gray-400">Qty: {product.quantity}</span>
              )}
            </div>

            <div className="px-4 py-4 bg-white space-y-4">
              {/* Dimension header */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isProductMode ? 'Product Dimensions' : 'Package Dimensions'}
              </p>

              {/* Dimension inputs — reuse PackageDimensionFields but without the mode toggle (it's global now) */}
              <PackageDimensionFields
                dimensionMode={dimensionMode}
                lengthCm={product.lengthCm}
                widthCm={product.widthCm}
                heightCm={product.heightCm}
                actualWeightKg={product.actualWeightKg}
                numPackages={product.numPackages}
                quantity={product.quantity}
                volumetricWeight={product.volumetricWeight}
                grossWeight={product.grossWeight}
                chargeableWeight={product.chargeableWeight}
                cbm={product.cbm}
                packingResult={product.packingResult}
                packingError={product.packingError}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
