'use client';

import { ShoppingBag, DollarSign, Hash } from 'lucide-react';

interface Props {
  productName: string;
  unitPrice: number;
  quantity: number;
  fobValue: number;
  currency: string;
  exchangeRate: number;
  valueLabel?: string;
  onFieldChange: (field: string, value: unknown) => void;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductInfoFields({
  productName,
  unitPrice,
  quantity,
  fobValue,
  currency,
  exchangeRate,
  valueLabel = 'Total Value',
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
            Product Name <span className="text-gray-400 text-xs"></span>
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
              <DollarSign className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
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
          {currency !== 'INR' && unitPrice > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">≈ {formatINR(unitPrice * exchangeRate)}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
              Quantity <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            type="number"
            value={quantity || ''}
            onChange={(e) => onFieldChange('quantity', parseInt(e.target.value) || 0)}
            placeholder="0"
            min="1"
            step="1"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
      </div>

      {/* Total Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {valueLabel} ({currency})
        </label>
        <div className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-sm font-medium text-brand-brown">
          {totalValue > 0
            ? totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—'}
        </div>
        {currency !== 'INR' && totalValue > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">≈ {formatINR(totalValue * exchangeRate)}</p>
        )}
      </div>

      {/* Sourcing links */}
      <div className="flex items-start gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
        <span className="text-xs text-gray-500">
          Don&apos;t know the price? Search on{' '}
          <a href="https://www.alibaba.com" target="_blank" rel="noopener noreferrer"
             className="text-brand-orange font-medium hover:underline">
            Alibaba
          </a>
          {' · '}
          <a href="https://www.made-in-china.com" target="_blank" rel="noopener noreferrer"
             className="text-brand-orange font-medium hover:underline">
            Made-in-China
          </a>
        </span>
      </div>
    </div>
  );
}
