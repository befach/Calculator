'use client';

import { useState } from 'react';
import { ExternalLink, Percent, HelpCircle } from 'lucide-react';

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
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
              <span className="truncate">Custom Duty (BCD) %</span>
              <span
                className="relative inline-flex"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-brand-orange cursor-help transition-colors" />
                {showTooltip && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 px-3 py-2 text-[11px] leading-relaxed font-normal text-white bg-brand-brown rounded-lg shadow-lg z-50 normal-case tracking-normal">
                    To find your product&apos;s customs duty rate, visit the ICEGATE portal below. Search using your HSN code to get the applicable BCD and IGST rates.
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-brown" />
                  </span>
                )}
              </span>
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
