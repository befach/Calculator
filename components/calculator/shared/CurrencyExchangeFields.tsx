'use client';

import { useState, useMemo } from 'react';
import { DollarSign, ArrowLeftRight, Search } from 'lucide-react';
import { getAvailableCurrencies } from '@/core/calculatorUtils';

interface Props {
  currency: string;
  exchangeRate: number;
  exchangeRateSource?: 'static' | 'live' | 'loading';
  onFieldChange: (field: string, value: unknown) => void;
}

export default function CurrencyExchangeFields({
  currency,
  exchangeRate,
  exchangeRateSource = 'static',
  onFieldChange,
}: Props) {
  const currencies = useMemo(() => getAvailableCurrencies(), []);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = currencies.find((c) => c.code === currency);
    return found ? `${found.code} — ${found.name}` : currency;
  }, [currencies, currency]);

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch) return currencies;
    const q = currencySearch.toLowerCase();
    return currencies.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [currencies, currencySearch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            Currency <span className="text-red-400">*</span>
          </span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={showCurrencyDropdown ? currencySearch : selectedLabel}
            onChange={(e) => {
              setCurrencySearch(e.target.value);
              setShowCurrencyDropdown(true);
            }}
            onFocus={() => {
              setShowCurrencyDropdown(true);
              setCurrencySearch('');
            }}
            onBlur={() => setTimeout(() => setShowCurrencyDropdown(false), 200)}
            placeholder="Search currency..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
        {showCurrencyDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredCurrencies.map((c) => (
              <button
                key={c.code}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFieldChange('currency', c.code);
                  setCurrencySearch('');
                  setShowCurrencyDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5"
              >
                {c.code} — {c.name}
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No currencies found</div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
            <span className="truncate">Exchange Rate {currency ? `(1 ${currency} = ₹)` : ''}</span>
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
        {currency !== 'INR' && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {exchangeRateSource === 'loading' && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-gray-300 border-t-brand-orange rounded-full animate-spin" />
                Fetching live rate...
              </span>
            )}
            {exchangeRateSource === 'live' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Live rate
              </span>
            )}
            {exchangeRateSource === 'static' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Fallback rate
              </span>
            )}
            <span className="text-[11px] text-amber-600 font-medium">+2% Bank charges included</span>
          </div>
        )}
      </div>
    </div>
  );
}
