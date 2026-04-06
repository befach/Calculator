'use client';

import { CONTAINER_SPECS, type ContainerType } from '@/core/seaFreightRates';

interface Props {
  value: string;
  onChange: (type: ContainerType) => void;
}

const CONTAINER_OPTIONS: ContainerType[] = ['20ft', '40ft', '40ftHC', '20ftReefer', '40ftReeferHC'];

export default function ContainerTypeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-brand-brown">Container Type</label>
      <div className="grid grid-cols-1 gap-2">
        {CONTAINER_OPTIONS.map((type) => {
          const spec = CONTAINER_SPECS[type];
          const isSelected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-brand-orange bg-brand-orange/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-brand-orange' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isSelected ? 'text-brand-brown' : 'text-gray-700'}`}>
                    {spec.label}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-500">
                  {spec.maxCbm} CBM / {(spec.maxPayloadKg / 1000).toFixed(1)}T
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
