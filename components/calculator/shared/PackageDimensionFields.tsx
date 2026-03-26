'use client';

import { Box, Weight, Ruler, Package } from 'lucide-react';

interface Props {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  onFieldChange: (field: string, value: unknown) => void;
}

function NumberInput({
  label,
  value,
  field,
  unit,
  icon: Icon,
  required,
  onFieldChange,
}: {
  label: string;
  value: number;
  field: string;
  unit: string;
  icon: typeof Box;
  required?: boolean;
  onFieldChange: (field: string, value: unknown) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onFieldChange(field, parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="any"
          className="w-full pl-8 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function PackageDimensionFields({
  lengthCm,
  widthCm,
  heightCm,
  actualWeightKg,
  numPackages,
  volumetricWeight,
  grossWeight,
  chargeableWeight,
  cbm,
  onFieldChange,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Dimensions (per box)
        </p>
        <div className="grid grid-cols-3 gap-3">
          <NumberInput label="Length" value={lengthCm} field="lengthCm" unit="cm" icon={Ruler} required onFieldChange={onFieldChange} />
          <NumberInput label="Width" value={widthCm} field="widthCm" unit="cm" icon={Ruler} required onFieldChange={onFieldChange} />
          <NumberInput label="Height" value={heightCm} field="heightCm" unit="cm" icon={Ruler} required onFieldChange={onFieldChange} />
        </div>
      </div>

      {/* CBM & VOL.WT Badges */}
      {(cbm > 0 || volumetricWeight > 0) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            CBM: {cbm.toFixed(4)} m³
          </span>
          <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            VOL.WT: {volumetricWeight.toFixed(2)} kg
          </span>
        </div>
      )}

      {/* Weight & Packages */}
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Weight per Box" value={actualWeightKg} field="actualWeightKg" unit="kg" icon={Weight} required onFieldChange={onFieldChange} />
        <NumberInput label="No. of Packages" value={numPackages} field="numPackages" unit="pcs" icon={Package} required onFieldChange={onFieldChange} />
      </div>

      {/* Chargeable Weight Display */}
      {chargeableWeight > 0 && (
        <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-2.5 sm:p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Chargeable Weight</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              max(vol, gross) → 0.5 kg
            </p>
          </div>
          <p className="text-base sm:text-lg font-bold text-brand-orange whitespace-nowrap">{chargeableWeight.toFixed(1)} kg</p>
        </div>
      )}

      {/* Weight Summary */}
      {grossWeight > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex justify-between bg-gray-50 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
            <span className="text-gray-500">Gross</span>
            <span className="font-medium">{grossWeight.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
            <span className="text-gray-500">Volumetric</span>
            <span className="font-medium">{volumetricWeight.toFixed(2)} kg</span>
          </div>
        </div>
      )}
    </div>
  );
}
