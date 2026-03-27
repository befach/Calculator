'use client';

import { ExternalLink, Percent } from 'lucide-react';

interface Props {
  bcdRate: number;
  igstRate: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function DutyRateFields({
  bcdRate,
  igstRate,
  onFieldChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
              <span className="truncate">Custom Duty (BCD) %</span>
            </span>
          </label>
          <input
            type="number"
            value={bcdRate}
            onChange={(e) => onFieldChange('bcdRate', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="any"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
              GST/IGST %
            </span>
          </label>
          <input
            type="number"
            value={igstRate}
            onChange={(e) => onFieldChange('igstRate', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="any"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>
      </div>

      <a
        href="https://www.old.icegate.gov.in/Webappl/index.jsp"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-brand-orange-dark transition-colors font-medium"
      >
        <ExternalLink className="w-3 h-3" />
        Verify on ICEGATE
      </a>
    </div>
  );
}
