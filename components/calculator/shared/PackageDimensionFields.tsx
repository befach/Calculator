'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Weight, Package, Info, HelpCircle } from 'lucide-react';
import type { PackingResult } from '@/core/packingCalculator';

interface Props {
  dimensionMode: 'box' | 'product';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;
  quantity: number;
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  packingResult: PackingResult | null;
  packingError: string | null;
  onFieldChange: (field: string, value: unknown) => void;
  hideToggle?: boolean;
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

/**
 * Top-down isometric packing diagram: shows the box outline with
 * product units arranged inside as a grid, giving a clear visual
 * of how products fit in the box.
 */
function PackingLayoutDiagram({
  productL, productW, boxL, boxW, boxH, productsPerBox,
}: {
  productL: number; productW: number;
  boxL: number; boxW: number; boxH: number;
  productsPerBox: number;
}) {
  const diagram = useMemo(() => {
    const DIAGRAM_SIZE = 120;
    const boxMax = Math.max(boxL, boxW, 1);
    const scale = DIAGRAM_SIZE / boxMax;

    const scaledBoxL = boxL * scale;
    const scaledBoxW = boxW * scale;

    // Try both orientations and pick the one with better fit
    const fitA = { l: Math.floor(boxL / productL), w: Math.floor(boxW / productW) };
    const fitB = { l: Math.floor(boxL / productW), w: Math.floor(boxW / productL) };
    const useB = (fitB.l * fitB.w) > (fitA.l * fitA.w);
    const fit = useB ? fitB : fitA;
    const pL = useB ? productW : productL;
    const pW = useB ? productL : productW;

    const unitW = pL * scale;
    const unitH = pW * scale;
    const cols = fit.l;
    const rows = fit.w;

    // Calculate layers (height stacking)
    const productH = Math.min(productL, productW, Math.max(productL, productW)); // rough
    const layers = productsPerBox > 0 && (cols * rows) > 0
      ? Math.ceil(productsPerBox / (cols * rows))
      : 1;

    return { scaledBoxL, scaledBoxW, unitW, unitH, cols, rows, layers };
  }, [productL, productW, boxL, boxW, boxH, productsPerBox]);

  const { scaledBoxL, scaledBoxW, unitW, unitH, cols, rows, layers } = diagram;
  const DEPTH_OFFSET = 15; // isometric depth offset

  return (
    <div className="py-2">
      <svg
        width={scaledBoxL + DEPTH_OFFSET + 4}
        height={scaledBoxW + DEPTH_OFFSET + 4}
        viewBox={`0 0 ${scaledBoxL + DEPTH_OFFSET + 4} ${scaledBoxW + DEPTH_OFFSET + 4}`}
        className="drop-shadow-sm"
      >
        {/* Box back face (offset for depth) */}
        <rect
          x={DEPTH_OFFSET + 2}
          y={2}
          width={scaledBoxL}
          height={scaledBoxW}
          fill="none"
          stroke="#C47518"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.3"
          rx="2"
        />
        {/* Depth lines connecting front to back */}
        <line x1={2} y1={DEPTH_OFFSET + 2} x2={DEPTH_OFFSET + 2} y2={2} stroke="#C47518" strokeWidth="0.5" opacity="0.2" />
        <line x1={scaledBoxL + 2} y1={scaledBoxW + DEPTH_OFFSET + 2} x2={scaledBoxL + DEPTH_OFFSET + 2} y2={scaledBoxW + 2} stroke="#C47518" strokeWidth="0.5" opacity="0.2" />
        <line x1={scaledBoxL + 2} y1={DEPTH_OFFSET + 2} x2={scaledBoxL + DEPTH_OFFSET + 2} y2={2} stroke="#C47518" strokeWidth="0.5" opacity="0.2" />

        {/* Box front face */}
        <rect
          x={2}
          y={DEPTH_OFFSET + 2}
          width={scaledBoxL}
          height={scaledBoxW}
          fill="rgba(249, 115, 22, 0.04)"
          stroke="#F29222"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Product units grid */}
        {Array.from({ length: Math.min(cols * rows, 24) }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const GAP = 1.5;
          const x = 2 + col * (unitW + GAP) + GAP;
          const y = DEPTH_OFFSET + 2 + row * (unitH + GAP) + GAP;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={Math.max(unitW - GAP, 2)}
              height={Math.max(unitH - GAP, 2)}
              fill="rgba(249, 115, 22, 0.25)"
              stroke="#F29222"
              strokeWidth="0.75"
              rx="1"
            />
          );
        })}

        {/* Layer count badge */}
        {layers > 1 && (
          <g>
            <rect
              x={scaledBoxL - 18}
              y={DEPTH_OFFSET + scaledBoxW - 14}
              width={20}
              height={16}
              fill="white"
              stroke="#F29222"
              strokeWidth="0.75"
              rx="3"
            />
            <text
              x={scaledBoxL - 8}
              y={DEPTH_OFFSET + scaledBoxW - 3}
              textAnchor="middle"
              className="fill-brand-orange"
              style={{ fontSize: '8px', fontWeight: 700 }}
            >
              ×{layers}
            </text>
          </g>
        )}
      </svg>
      {/* Box dimensions label */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-medium mt-0.5">
        <span>{boxL}<span className="text-gray-400">L</span></span>
        <span className="text-gray-300">×</span>
        <span>{boxW}<span className="text-gray-400">W</span></span>
        <span className="text-gray-300">×</span>
        <span>{boxH}<span className="text-gray-400">H</span></span>
        <span className="text-gray-400">cm</span>
      </div>
    </div>
  );
}

export default function PackageDimensionFields({
  dimensionMode,
  lengthCm,
  widthCm,
  heightCm,
  actualWeightKg,
  numPackages,
  quantity,
  volumetricWeight,
  grossWeight,
  chargeableWeight,
  cbm,
  packingResult,
  packingError,
  onFieldChange,
  hideToggle = false,
}: Props) {
  const [showDimTip, setShowDimTip] = useState(false);
  const isProductMode = dimensionMode === 'product';

  const hasProductDims = lengthCm > 0 || widthCm > 0 || heightCm > 0;

  return (
    <div className="space-y-4">
      {/* Dimension Mode Toggle */}
      {!hideToggle && <div>
        <p className="text-[10px] text-gray-400 mb-1.5">Package dimensions are preferred for accurate pricing</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => onFieldChange('dimensionMode', 'box')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
              !isProductMode
                ? 'bg-brand-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            I have package dimensions
          </button>
          <button
            type="button"
            onClick={() => onFieldChange('dimensionMode', 'product')}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
              isProductMode
                ? 'bg-brand-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            I only have product dimensions
          </button>
        </div>
      </div>}

      {/* Dimensions */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {isProductMode ? 'Dimensions (per product)' : 'Dimensions (per box)'}
          </p>
          <span
            className="relative inline-flex"
            onMouseEnter={() => setShowDimTip(true)}
            onMouseLeave={() => setShowDimTip(false)}
            onClick={() => setShowDimTip(!showDimTip)}
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-brand-orange cursor-help transition-colors" />
            {showDimTip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 sm:w-72 px-3 py-2 text-[11px] leading-relaxed font-normal text-white bg-brand-brown rounded-lg shadow-lg z-50 normal-case tracking-normal">
                {isProductMode
                  ? 'Enter individual product dimensions. We\'ll auto-select the best standard box and calculate how many boxes you need.'
                  : 'Don\'t have package dimensions? Request them from your supplier, or check the product listing on Alibaba — dimensions are usually listed on the product page.'}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-brown" />
              </span>
            )}
          </span>
        </div>
        {!isProductMode && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] sm:text-xs text-amber-700 leading-relaxed">
              Don&apos;t have package dimensions? Ask your supplier for the box measurements, or visit the product listing on <span className="font-semibold">Alibaba</span> — dimensions are typically available on the product page.
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <NumberInput label="Length" value={lengthCm} field="lengthCm" unit="cm" required onFieldChange={onFieldChange} />
          <NumberInput label="Width" value={widthCm} field="widthCm" unit="cm" required onFieldChange={onFieldChange} />
          <NumberInput label="Height" value={heightCm} field="heightCm" unit="cm" required onFieldChange={onFieldChange} />
        </div>
      </div>

      {/* 3D Visualization */}
      {isProductMode ? (
        /* Product mode: Product 3D → Arrow → Packing Layout Diagram */
        <AnimatePresence>
          {hasProductDims && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 py-2">
                {/* Product 3D */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <Box3DPreview l={lengthCm} w={widthCm} h={heightCm} />
                  <p className="text-[10px] text-gray-400 font-medium">Product</p>
                </div>

                {packingResult && (
                  <>
                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-1 px-1 flex-shrink-0">
                      <svg width="28" height="14" viewBox="0 0 28 14" fill="none" className="text-brand-orange">
                        <path d="M0 7h20m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-[9px] text-gray-400 whitespace-nowrap">{packingResult.productsPerBox} units</p>
                    </div>

                    {/* Packing Layout: top-down grid showing arrangement */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <PackingLayoutDiagram
                        productL={lengthCm}
                        productW={widthCm}
                        boxL={packingResult.box.lengthCm}
                        boxW={packingResult.box.widthCm}
                        boxH={packingResult.box.heightCm}
                        productsPerBox={packingResult.productsPerBox}
                      />
                      <p className="text-[10px] text-gray-400 font-medium mt-1">Best-Fit Box</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        /* Single 3D: Box preview */
        <AnimatePresence>
          {hasProductDims && (
            <Box3DPreview l={lengthCm} w={widthCm} h={heightCm} />
          )}
        </AnimatePresence>
      )}

      {/* Best-Fit Box Info (product mode only) */}
      {isProductMode && packingResult && (
        <div className="bg-blue-50 border border-blue-200/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">Best-Fit Box: {packingResult.box.label}</span>
          </div>
          <div className="text-[11px] sm:text-xs text-blue-700 space-y-1">
            <p>
              Box dimensions: <span className="font-semibold">{packingResult.box.lengthCm} × {packingResult.box.widthCm} × {packingResult.box.heightCm} cm</span>
            </p>
            <p>
              ~<span className="font-semibold">{packingResult.productsPerBox}</span> unit{packingResult.productsPerBox !== 1 ? 's' : ''} fit per box
            </p>
            <p>
              <span className="font-semibold">{packingResult.totalBoxes}</span> box{packingResult.totalBoxes !== 1 ? 'es' : ''} required for <span className="font-semibold">{quantity}</span> unit{quantity !== 1 ? 's' : ''}
            </p>
            <p className="text-blue-500 text-[10px]">
              Est. weight per box: {packingResult.estimatedWeightPerBoxKg} kg (incl. packaging)
            </p>
          </div>
        </div>
      )}

      {/* Estimate Disclaimer (product mode only) */}
      {isProductMode && (
        <div className="bg-amber-50/50 border border-amber-200/40 rounded-lg px-3 py-2 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-600 leading-relaxed">
            These values are estimated based on your product dimensions. For accurate pricing, use package dimensions from your supplier.
          </p>
        </div>
      )}


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
      {isProductMode ? (
        <div>
          <NumberInput
            label="Weight per Product"
            value={actualWeightKg}
            field="actualWeightKg"
            unit="kg"
            icon={Weight}
            required
            onFieldChange={onFieldChange}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <NumberInput label="Weight per Box" value={actualWeightKg} field="actualWeightKg" unit="kg" icon={Weight} required onFieldChange={onFieldChange} />
          <NumberInput label="No. of Packages" value={numPackages} field="numPackages" unit="pcs" icon={Package} required isInteger onFieldChange={onFieldChange} />
        </div>
      )}

      {/* Chargeable Weight Display */}
      {chargeableWeight > 0 && (
        <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-2.5 sm:p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Chargeable Weight</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              max(vol, gross) → 0.5 kg{isProductMode && ' (estimated)'}
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
