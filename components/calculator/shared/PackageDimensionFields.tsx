'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Weight, Package } from 'lucide-react';

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
  isInteger,
  onFieldChange,
}: {
  label: string;
  value: number;
  field: string;
  unit: string;
  icon?: typeof Box;
  required?: boolean;
  isInteger?: boolean;
  onFieldChange: (field: string, value: unknown) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onFieldChange(field, isInteger ? (parseInt(e.target.value) || 0) : (parseFloat(e.target.value) || 0))}
          placeholder="0"
          min={isInteger ? "1" : "0"}
          step={isInteger ? "1" : "any"}
          className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

const MAX_BOX_SIZE = 100;

function Box3DPreview({ l, w, h }: { l: number; w: number; h: number }) {
  const dims = useMemo(() => {
    const max = Math.max(l, w, h, 1);
    const scale = MAX_BOX_SIZE / max;
    return {
      width: Math.max(w * scale, 8),
      height: Math.max(h * scale, 8),
      depth: Math.max(l * scale, 8),
    };
  }, [l, w, h]);

  const { width, height, depth } = dims;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-2 py-3"
    >
      <div
        className="relative"
        style={{
          width: width + depth * 0.5 + 40,
          height: height + depth * 0.5 + 40,
          perspective: 600,
        }}
      >
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            width,
            height,
            left: depth * 0.5 + 20,
            top: 20,
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-20deg) rotateY(-35deg)',
          }}
        >
          {/* Front face */}
          <div
            className="absolute border border-brand-orange/40 transition-all duration-300"
            style={{
              width,
              height,
              background: 'rgba(249, 115, 22, 0.12)',
              transform: `translateZ(${depth / 2}px)`,
            }}
          />
          {/* Back face */}
          <div
            className="absolute border border-brand-orange/20 transition-all duration-300"
            style={{
              width,
              height,
              background: 'rgba(249, 115, 22, 0.06)',
              transform: `translateZ(${-depth / 2}px)`,
            }}
          />
          {/* Right face */}
          <div
            className="absolute border border-brand-orange/30 transition-all duration-300"
            style={{
              width: depth,
              height,
              left: width / 2 - depth / 2,
              background: 'rgba(249, 115, 22, 0.18)',
              transform: `rotateY(90deg) translateZ(${width / 2}px)`,
            }}
          />
          {/* Left face */}
          <div
            className="absolute border border-brand-orange/20 transition-all duration-300"
            style={{
              width: depth,
              height,
              left: width / 2 - depth / 2,
              background: 'rgba(249, 115, 22, 0.08)',
              transform: `rotateY(-90deg) translateZ(${width / 2}px)`,
            }}
          />
          {/* Top face */}
          <div
            className="absolute border border-brand-orange/35 transition-all duration-300"
            style={{
              width,
              height: depth,
              top: height / 2 - depth / 2,
              background: 'rgba(249, 115, 22, 0.22)',
              transform: `rotateX(90deg) translateZ(${height / 2}px)`,
            }}
          />
          {/* Bottom face */}
          <div
            className="absolute border border-brand-orange/15 transition-all duration-300"
            style={{
              width,
              height: depth,
              top: height / 2 - depth / 2,
              background: 'rgba(249, 115, 22, 0.04)',
              transform: `rotateX(-90deg) translateZ(${height / 2}px)`,
            }}
          />
        </div>
      </div>
      {/* Dimension labels */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-medium">
        <span>{l}<span className="text-gray-400">L</span></span>
        <span className="text-gray-300">×</span>
        <span>{w}<span className="text-gray-400">W</span></span>
        <span className="text-gray-300">×</span>
        <span>{h}<span className="text-gray-400">H</span></span>
        <span className="text-gray-400">cm</span>
      </div>
    </motion.div>
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
          <NumberInput label="Length" value={lengthCm} field="lengthCm" unit="cm" required onFieldChange={onFieldChange} />
          <NumberInput label="Width" value={widthCm} field="widthCm" unit="cm" required onFieldChange={onFieldChange} />
          <NumberInput label="Height" value={heightCm} field="heightCm" unit="cm" required onFieldChange={onFieldChange} />
        </div>
      </div>

      {/* 3D Box Preview */}
      <AnimatePresence>
        {(lengthCm > 0 || widthCm > 0 || heightCm > 0) && (
          <Box3DPreview l={lengthCm} w={widthCm} h={heightCm} />
        )}
      </AnimatePresence>

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
        <NumberInput label="No. of Packages" value={numPackages} field="numPackages" unit="pcs" icon={Package} required isInteger onFieldChange={onFieldChange} />
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
            <span className="font-bold">{grossWeight.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
            <span className="text-gray-500">Volumetric</span>
            <span className="font-bold">{volumetricWeight.toFixed(2)} kg</span>
          </div>
        </div>
      )}
    </div>
  );
}
