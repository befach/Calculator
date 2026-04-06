'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface ChargeField {
  key: string;
  label: string;
  tooltip: string;
  defaultValue: number;
  showFor?: 'FCL' | 'LCL' | 'both';
  unit?: string;
}

interface Props {
  shippingMode: string;
  values: Record<string, number>;
  onFieldChange: (field: string, value: unknown) => void;
}

const CHARGE_FIELDS: ChargeField[] = [
  { key: 'thcOrigin', label: 'THC Origin', tooltip: 'Terminal Handling Charges at loading port', defaultValue: -1, showFor: 'both', unit: 'INR' },
  { key: 'thcDestination', label: 'THC Destination', tooltip: 'Terminal Handling Charges at Indian port', defaultValue: -1, showFor: 'both', unit: 'INR' },
  { key: 'blFee', label: 'BL Fee', tooltip: 'Bill of Lading issuance fee', defaultValue: -1, showFor: 'both', unit: 'INR' },
  { key: 'doCharges', label: 'DO Charges', tooltip: 'Delivery Order from shipping line', defaultValue: -1, showFor: 'both', unit: 'INR' },
  { key: 'cfsCharges', label: 'CFS Charges', tooltip: 'Container Freight Station charges (LCL only)', defaultValue: -1, showFor: 'LCL', unit: 'INR' },
  { key: 'customExamination', label: 'Customs Examination', tooltip: 'Physical examination charges if required', defaultValue: -1, showFor: 'both', unit: 'INR' },
  { key: 'demurrageDays', label: 'Demurrage Days', tooltip: 'Days container stays at port beyond free period', defaultValue: 0, showFor: 'FCL', unit: 'days' },
  { key: 'detentionDays', label: 'Detention Days', tooltip: 'Days container stays with you beyond free period', defaultValue: 0, showFor: 'FCL', unit: 'days' },
];

export default function PortChargesEditor({ shippingMode, values, onFieldChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleFields = CHARGE_FIELDS.filter(f =>
    f.showFor === 'both' || f.showFor === shippingMode
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-brand-brown">
          Port & Terminal Charges
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500">
            {isExpanded ? 'Hide' : 'Edit defaults'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-500">
            Leave blank to use estimated defaults. Override with your actual charges for precise results.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {visibleFields.map((field) => (
              <div key={field.key}>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-[11px] font-medium text-gray-600">{field.label}</label>
                  <div className="relative group">
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50">
                      <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {field.tooltip}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder={field.unit === 'days' ? '0' : 'Default'}
                    value={
                      field.unit === 'days'
                        ? (values[field.key] || '')
                        : (values[field.key] >= 0 ? values[field.key] : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (field.unit === 'days') {
                        onFieldChange(field.key, val ? parseInt(val) : 0);
                      } else {
                        onFieldChange(field.key, val ? parseFloat(val) : -1);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  />
                  {field.unit && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                      {field.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
