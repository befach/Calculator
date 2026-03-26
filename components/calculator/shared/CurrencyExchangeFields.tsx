'use client';

import { useMemo } from 'react';
import { DollarSign, ArrowLeftRight } from 'lucide-react';
import { getAvailableCurrencies } from '@/core/calculatorUtils';

interface Props {
  currency: string;
  exchangeRate: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function CurrencyExchangeFields({
  currency,
  exchangeRate,
  onFieldChange,
}: Props) {
  const currencies = useMemo(() => getAvailableCurrencies(), []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            Currency <span className="text-red-400">*</span>
          </span>
        </label>
        <select
          value={currency}
          onChange={(e) => onFieldChange('currency', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white transition-all"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            <span className="truncate">Exchange Rate (1 {currency} = ₹)</span>
          </span>
        </label>
        <input
          type="number"
          value={exchangeRate || ''}
          onChange={(e) => onFieldChange('exchangeRate', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="any"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
        />
      </div>
    </div>
  );
}
