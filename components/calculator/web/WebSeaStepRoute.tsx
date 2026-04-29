'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, FileText, Globe, Search, Ship } from 'lucide-react';
import CurrencyExchangeFields from '../shared/CurrencyExchangeFields';
import { type SeaIncoterm, type SeaShipmentPreference } from '@/core/seaFreightRates';

interface Props {
  incoterm: SeaIncoterm;
  shipmentPreference: SeaShipmentPreference;
  originCountry: string;
  originPort: string;
  destinationPort: string;
  originCountries: string[];
  originPorts: string[];
  destinationPorts: string[];
  currency: string;
  exchangeRate: number;
  exchangeRateSource?: 'static' | 'live' | 'loading';
  onFieldChange: (field: string, value: unknown) => void;
}

function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  icon: Icon,
  disabled = false,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  icon: typeof Globe;
  disabled?: boolean;
  onSelect: (value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-brand-orange" />
          {label} <span className="text-red-400">*</span>
        </span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={showDropdown ? search : value}
          disabled={disabled}
          onChange={(event) => {
            setSearch(event.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setSearch('');
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>
      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(option);
                setSearch('');
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5"
            >
              {option}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebSeaStepRoute({
  incoterm,
  shipmentPreference,
  originCountry,
  originPort,
  destinationPort,
  originCountries,
  originPorts,
  destinationPorts,
  currency,
  exchangeRate,
  exchangeRateSource,
  onFieldChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Ship className="w-5 h-5 text-brand-orange" />
        Incoterm, Route & Currency
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand-orange" />
            Incoterm <span className="text-red-400">*</span>
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['FOB', 'CIF'] as const).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onFieldChange('incoterm', term)}
              className={`text-left border rounded-lg px-4 py-3 transition-all ${
                incoterm === term
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-brand-orange/50'
              }`}
            >
              <p className="text-sm font-bold text-brand-brown">{term}</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {term === 'FOB'
                  ? 'We estimate sea freight and insurance.'
                  : 'Freight and insurance are already in invoice.'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipment Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['LCL', 'LCL'],
            ['FCL_20', 'FCL 20ft'],
            ['FCL_40HQ', 'FCL 40ft'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onFieldChange('shipmentPreference', value)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                shipmentPreference === value
                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand-orange/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${incoterm === 'FOB' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        <SearchableSelect
          label="Origin Country"
          value={originCountry}
          options={originCountries}
          placeholder="Search country..."
          icon={Globe}
          onSelect={(value) => onFieldChange('originCountry', value)}
        />

        {incoterm === 'FOB' && (
          <SearchableSelect
            label="Origin Port"
            value={originPort}
            options={originPorts}
            placeholder="Search origin port..."
            icon={Anchor}
            disabled={!originCountry}
            onSelect={(value) => onFieldChange('originPort', value)}
          />
        )}

        <SearchableSelect
          label="India Port"
          value={destinationPort}
          options={destinationPorts}
          placeholder="Search India port..."
          icon={Anchor}
          disabled={incoterm === 'FOB' && !originPort}
          onSelect={(value) => onFieldChange('destinationPort', value)}
        />
      </div>

      <CurrencyExchangeFields
        currency={currency}
        exchangeRate={exchangeRate}
        exchangeRateSource={exchangeRateSource}
        onFieldChange={onFieldChange}
      />
    </motion.div>
  );
}
