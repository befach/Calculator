'use client';

import { FileText } from 'lucide-react';

export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'DDP';

interface IncotermOption {
  value: Incoterm;
  label: string;
  description: string;
  priceIncludes: string;
}

const INCOTERM_OPTIONS: IncotermOption[] = [
  {
    value: 'EXW',
    label: 'EXW',
    description: 'Ex Works',
    priceIncludes: 'Product cost only',
  },
  {
    value: 'FOB',
    label: 'FOB',
    description: 'Free on Board',
    priceIncludes: 'Product + origin charges to port',
  },
  {
    value: 'CIF',
    label: 'CIF',
    description: 'Cost, Insurance & Freight',
    priceIncludes: 'Product + freight + insurance',
  },
  {
    value: 'DDP',
    label: 'DDP',
    description: 'Delivered Duty Paid',
    priceIncludes: 'All costs including duties',
  },
];

interface Props {
  value: string;
  onChange: (incoterm: Incoterm) => void;
}

export default function IncotermsSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-orange" />
        <label className="text-xs font-semibold text-brand-brown">Incoterms</label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {INCOTERM_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`relative flex flex-col items-center px-2 py-2.5 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? 'border-brand-orange bg-brand-orange/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-sm font-bold ${isSelected ? 'text-brand-orange' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="text-[11px] text-gray-500 mt-1">
          <span className="font-medium text-brand-brown">Your price includes:</span>{' '}
          {INCOTERM_OPTIONS.find(o => o.value === value)?.priceIncludes}
        </p>
      )}
    </div>
  );
}
