'use client';

import { Ship, Package } from 'lucide-react';

interface Props {
  value: string;
  onChange: (mode: 'FCL' | 'LCL') => void;
}

export default function ShippingModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('FCL')}
        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
          value === 'FCL'
            ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          value === 'FCL' ? 'bg-brand-orange/10' : 'bg-gray-100'
        }`}>
          <Ship className={`w-5 h-5 ${value === 'FCL' ? 'text-brand-orange' : 'text-gray-400'}`} />
        </div>
        <div className="text-center">
          <p className={`text-sm font-bold ${value === 'FCL' ? 'text-brand-brown' : 'text-gray-700'}`}>
            FCL
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Full Container Load</p>
        </div>
        {value === 'FCL' && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange('LCL')}
        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
          value === 'LCL'
            ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          value === 'LCL' ? 'bg-brand-orange/10' : 'bg-gray-100'
        }`}>
          <Package className={`w-5 h-5 ${value === 'LCL' ? 'text-brand-orange' : 'text-gray-400'}`} />
        </div>
        <div className="text-center">
          <p className={`text-sm font-bold ${value === 'LCL' ? 'text-brand-brown' : 'text-gray-700'}`}>
            LCL
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Less than Container</p>
        </div>
        {value === 'LCL' && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
