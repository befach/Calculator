'use client';

import { ChevronDown, Copy, Trash2, Package } from 'lucide-react';
import { type ProductItem } from '@/hooks/useCalculatorForm';
import HSNSearchField from './HSNSearchField';
import DutyRateFields from './DutyRateFields';
import ProductInfoFields from './ProductInfoFields';
import PackageDimensionFields from './PackageDimensionFields';

interface Props {
  product: ProductItem;
  index: number;
  totalProducts: number;
  currency: string;
  exchangeRate: number;
  onFieldChange: (productId: string, field: string, value: unknown) => void;
  onToggleExpanded: (productId: string) => void;
  onRemove: (productId: string) => void;
  onDuplicate: (productId: string) => void;
}

export default function ProductCard({
  product,
  index,
  totalProducts,
  currency,
  exchangeRate,
  onFieldChange,
  onToggleExpanded,
  onRemove,
  onDuplicate,
}: Props) {
  const handleFieldChange = (field: string, value: unknown) => {
    onFieldChange(product.id, field, value);
  };

  const displayName = product.productName || `Product ${index + 1}`;
  const hasData = product.hsnCode || product.chargeableWeight > 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all">
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={() => onToggleExpanded(product.id)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-brand-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-brown truncate">{displayName}</p>
          {hasData && !product.isExpanded && (
            <div className="flex items-center gap-2 mt-0.5">
              {product.hsnCode && (
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                  HSN: {product.hsnCode}
                </span>
              )}
              {product.chargeableWeight > 0 && (
                <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded font-medium">
                  {product.chargeableWeight} kg
                </span>
              )}
              {product.quantity > 0 && product.unitPrice > 0 && (
                <span className="text-[10px] text-gray-400">
                  {product.quantity} × {currency} {product.unitPrice}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {totalProducts > 1 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </span>
          )}
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(product.id); }}
            className="p-1.5 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${product.isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Body */}
      {product.isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-5 bg-white">
          {/* HSN & Duties */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">HSN & Duty Rates</p>
            <HSNSearchField
              hsnCode={product.hsnCode}
              bcdRate={product.bcdRate}
              igstRate={product.igstRate}
              onFieldChange={handleFieldChange}
            />
            <div className="mt-3">
              <DutyRateFields
                bcdRate={product.bcdRate}
                igstRate={product.igstRate}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Product Info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Product Info</p>
            <ProductInfoFields
              productName={product.productName}
              unitPrice={product.unitPrice}
              quantity={product.quantity}
              fobValue={product.fobValue}
              currency={currency}
              exchangeRate={exchangeRate}
              onFieldChange={handleFieldChange}
            />
          </div>

          <div className="border-t border-gray-100" />

          {/* Package Dimensions */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Package Dimensions</p>
            <PackageDimensionFields
              lengthCm={product.lengthCm}
              widthCm={product.widthCm}
              heightCm={product.heightCm}
              actualWeightKg={product.actualWeightKg}
              numPackages={product.numPackages}
              volumetricWeight={product.volumetricWeight}
              grossWeight={product.grossWeight}
              chargeableWeight={product.chargeableWeight}
              cbm={product.cbm}
              onFieldChange={handleFieldChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
