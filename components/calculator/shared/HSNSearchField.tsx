'use client';

import { useState, useMemo } from 'react';
import { Search, Tag } from 'lucide-react';
import { searchHSNCodes, getDutyRates } from '@/core/calculatorUtils';

interface Props {
  hsnCode: string;
  bcdRate: number;
  igstRate: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function HSNSearchField({
  hsnCode,
  bcdRate,
  igstRate,
  onFieldChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const results = useMemo(() => {
    if (!search || search.length < 2) return [];
    return searchHSNCodes(search);
  }, [search]);

  const dutyInfo = useMemo(() => {
    if (!hsnCode) return null;
    return getDutyRates(hsnCode);
  }, [hsnCode]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        <span className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-brand-orange" />
          HSN Code <span className="text-red-400">*</span>
        </span>
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={showDropdown ? search : hsnCode}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
            onFieldChange('hsnCode', e.target.value);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setSearch(hsnCode);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search HSN code or description..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((hsn) => (
            <button
              key={hsn.code}
              onMouseDown={(e) => {
                e.preventDefault();
                onFieldChange('hsnCode', hsn.code);
                setSearch('');
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-orange/5"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{hsn.code}</span>
                <span className="text-xs text-gray-400">
                  BCD {hsn.dutyRate}% | IGST {hsn.igstRate}%
                </span>
              </div>
              <p className="text-xs text-gray-500">{hsn.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Duty badge */}
      {dutyInfo && hsnCode && (
        <div className="mt-2 flex gap-2 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            BCD: {bcdRate}%
          </span>
          <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
            IGST: {igstRate}%
          </span>
          {dutyInfo.description && (
            <span className="text-xs text-gray-400">{dutyInfo.description}</span>
          )}
        </div>
      )}
    </div>
  );
}
