'use client';

import { ShoppingBag, DollarSign, Hash } from 'lucide-react';

interface Props {
  productName: string;
  unitPrice: number;
  quantity: number;
  fobValue: number;
  currency: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function ProductInfoFields({
  productName,
  unitPrice,
  quantity,
  fobValue,
  currency,
  onFieldChange,
}: Props) {
  const totalValue = unitPrice > 0 && quantity > 0
    ? Math.round(unitPrice * quantity * 100) / 100
    : fobValue;

  return (
    <div className="space-y-3">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-orange" />
            Product Name <span className="text-gray-400 text-xs">(optional)</span>
          </span>
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => onFieldChange('productName', e.target.value)}
          placeholder="e.g., Mobile Phone Cases"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
        />
      </div>

      {/* Price & Qty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Price/Unit ({currency})</span>
            </span>
          </label>
          <input
            type="number"
            value={unitPrice || ''}
            onChange={(e) => onFieldChange('unitPrice', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="any"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              Quantity <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="number"
            value={quantity || ''}
            onChange={(e) => onFieldChange('quantity', parseInt(e.target.value) || 0)}
            placeholder="0"
            min="1"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
      </div>

      {/* Total Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Total Value ({currency})
        </label>
        <div className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-sm font-medium text-brand-brown">
          {totalValue > 0
            ? totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—'}
        </div>
      </div>
    </div>
  );
}
