'use client';

import { useState, useMemo } from 'react';
import { Globe, Search } from 'lucide-react';
import { importCountryZones } from '@/core/dhlImportRates';

interface Props {
  originCountryCode: string;
  dhlZone: number | null;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function OriginCountrySelect({
  originCountryCode,
  dhlZone,
  onFieldChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const countries = useMemo(() => {
    return Object.entries(importCountryZones)
      .map(([code, info]) => ({ code, name: info.name, zone: info.zone }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const selectedName = originCountryCode
    ? importCountryZones[originCountryCode]?.name || ''
    : '';

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        <span className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-brand-orange" />
          Origin Country <span className="text-red-400">*</span>
        </span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={showDropdown ? search : selectedName}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setSearch('');
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search country..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 50).map((c) => (
            <button
              key={c.code}
              onMouseDown={(e) => {
                e.preventDefault();
                onFieldChange('originCountryCode', c.code);
                setSearch('');
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5 flex justify-between items-center"
            >
              <span>{c.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">No countries found</div>
          )}
        </div>
      )}
    </div>
  );
}
