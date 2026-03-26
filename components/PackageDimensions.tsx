'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface PackageDimensionsProps {
  length: number;
  width: number;
  height: number;
  actualWeight: number;
  numPackages: number;
  grossWeight: number;
  totalVolumetricWeight: number;
  chargeableWeight: number;
  cbm: number;
  onLengthChange: (v: string) => void;
  onWidthChange: (v: string) => void;
  onHeightChange: (v: string) => void;
  onWeightChange: (v: string) => void;
  onNumPackagesChange: (v: string) => void;
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && iconRef.current && bubbleRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const bubble = bubbleRef.current;
      const bw = bubble.offsetWidth;
      // Position above the icon, centered horizontally but clamped to viewport
      let left = iconRect.left + iconRect.width / 2 - bw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
      bubble.style.left = `${left}px`;
      bubble.style.top = `${iconRect.top - bubble.offsetHeight - 8}px`;
    }
  }, [show]);

  return (
    <span
      className="tooltip-wrap"
      ref={iconRef}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      <Info size={13} className="tooltip-icon" />
      {show && <span className="tooltip-bubble" ref={bubbleRef}>{text}</span>}
      <style jsx>{`
        .tooltip-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: help;
          margin-left: 3px;
        }
        .tooltip-wrap :global(.tooltip-icon) {
          color: #9ca3af;
          transition: color 0.15s;
        }
        .tooltip-wrap:hover :global(.tooltip-icon) {
          color: #6b7280;
        }
        .tooltip-bubble {
          position: fixed;
          background: #1f2937;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1.5;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          white-space: normal;
          max-width: 240px;
          width: max-content;
          text-align: left;
          z-index: 10000;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          pointer-events: none;
        }
      `}</style>
    </span>
  );
}

export default function PackageDimensions({
  length,
  width,
  height,
  actualWeight,
  numPackages,
  grossWeight,
  totalVolumetricWeight,
  chargeableWeight,
  cbm,
  onLengthChange,
  onWidthChange,
  onHeightChange,
  onWeightChange,
  onNumPackagesChange,
}: PackageDimensionsProps) {
  // Normalize dimensions for 3D box (max 90px per axis)
  const maxDim = Math.max(length || 1, width || 1, height || 1, 1);
  const scale = 90 / maxDim;
  const boxW = Math.max((width || 1) * scale, 12);
  const boxH = Math.max((height || 1) * scale, 12);
  const boxD = Math.max((length || 1) * scale, 12);

  const usesVolumetric = totalVolumetricWeight > grossWeight;
  const perBoxVol = length && width && height ? (length * width * height) / 5000 : 0;
  const hasDimensions = length > 0 && width > 0 && height > 0;
  const hasWeight = actualWeight > 0;

  return (
    <div className="pkg-root">
      {/* Left: Inputs with inline results */}
      <div className="pkg-inputs">
        {/* Dimensions row + inline CBM & Volumetric Weight */}
        <div className="pkg-input-group">
          <div className="pkg-dim-row">
            <div className="pkg-field">
              <label>Length (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={length || ''}
                onChange={(e) => onLengthChange(e.target.value)}
                min={0}
                step="0.1"
              />
            </div>
            <span className="pkg-x">&times;</span>
            <div className="pkg-field">
              <label>Width (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={width || ''}
                onChange={(e) => onWidthChange(e.target.value)}
                min={0}
                step="0.1"
              />
            </div>
            <span className="pkg-x">&times;</span>
            <div className="pkg-field">
              <label>Height (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={height || ''}
                onChange={(e) => onHeightChange(e.target.value)}
                min={0}
                step="0.1"
              />
            </div>
          </div>
          {hasDimensions && (
            <div className="pkg-inline-badges">
              <div className="pkg-badge cbm-badge">
                <span className="pkg-badge-label">CBM <Tooltip text="Cubic meters — the total volume of your shipment (L × W × H / 1,000,000 per box × packages)." /></span>
                <span className="pkg-badge-val">{cbm.toFixed(4)} m³</span>
              </div>
              <div className={`pkg-badge vol-badge ${usesVolumetric ? 'highlighted' : ''}`}>
                <span className="pkg-badge-label">Vol. Wt <Tooltip text="Dimensional weight used by couriers to account for light but bulky packages (L × W × H / 5000 per box × packages)." /></span>
                <span className="pkg-badge-val">{totalVolumetricWeight.toFixed(2)} kg</span>
                {numPackages > 1 && perBoxVol > 0 && (
                  <span className="pkg-badge-sub">{perBoxVol.toFixed(2)} &times; {numPackages}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Weight row + inline Gross Weight */}
        <div className="pkg-input-group">
          <div className="pkg-bottom-row">
            <div className="pkg-field">
              <label>Weight per box (kg)</label>
              <input
                type="number"
                placeholder="0"
                value={actualWeight || ''}
                onChange={(e) => onWeightChange(e.target.value)}
                min={0}
                step="0.1"
              />
            </div>
            <div className="pkg-field">
              <label>No. of Packages</label>
              <input
                type="number"
                placeholder="1"
                value={numPackages || ''}
                onChange={(e) => onNumPackagesChange(e.target.value)}
                min={1}
                step="1"
              />
            </div>
          </div>
          {hasWeight && (
            <div className="pkg-inline-badges">
              <div className={`pkg-badge gross-badge ${!usesVolumetric && grossWeight > 0 ? 'highlighted' : ''}`}>
                <span className="pkg-badge-label">Gross Wt <Tooltip text="Total physical weight of all packages (weight per box × number of packages)." /></span>
                <span className="pkg-badge-val">{grossWeight.toFixed(1)} kg</span>
                {numPackages > 1 && (
                  <span className="pkg-badge-sub">{actualWeight} &times; {numPackages}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: 3D Box + Chargeable Weight */}
      <div className="pkg-visual">
        <div className="pkg-scene">
          <motion.div
            className="pkg-box"
            animate={{
              width: boxW,
              height: boxH,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(-20deg) rotateY(-30deg)`,
            }}
          >
            <motion.div className="pkg-face pkg-front" animate={{ width: boxW, height: boxH }} style={{ transform: `translateZ(${boxD / 2}px)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.div className="pkg-face pkg-back" animate={{ width: boxW, height: boxH }} style={{ transform: `translateZ(${-boxD / 2}px) rotateY(180deg)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.div className="pkg-face pkg-left" animate={{ width: boxD, height: boxH }} style={{ transform: `translateX(${-boxW / 2}px) rotateY(-90deg)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.div className="pkg-face pkg-right" animate={{ width: boxD, height: boxH }} style={{ transform: `translateX(${boxW / 2}px) rotateY(90deg)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.div className="pkg-face pkg-top" animate={{ width: boxW, height: boxD }} style={{ transform: `translateY(${-boxH / 2}px) rotateX(90deg)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
            <motion.div className="pkg-face pkg-bottom" animate={{ width: boxW, height: boxD }} style={{ transform: `translateY(${boxH / 2}px) rotateX(-90deg)` }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} />
          </motion.div>
          {numPackages > 1 && (
            <div className="pkg-count-badge">&times;{numPackages}</div>
          )}
        </div>

        {chargeableWeight > 0 && (
          <div className="pkg-chargeable">
            <span className="pkg-chargeable-label">
              Chargeable Weight
              <Tooltip text="The higher of gross weight and volumetric weight — this is what couriers bill you on." />
            </span>
            <span className="pkg-chargeable-val">{chargeableWeight} kg</span>
            <span className="pkg-chargeable-hint">
              {usesVolumetric ? 'Using volumetric weight' : 'Using gross weight'}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .pkg-root {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .pkg-inputs {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pkg-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pkg-dim-row {
          display: flex;
          align-items: flex-end;
          gap: 0.4rem;
        }
        .pkg-x {
          font-size: 1.1rem;
          color: var(--color-text-secondary, #9ca3af);
          padding-bottom: 0.5rem;
          font-weight: 300;
        }
        .pkg-field {
          flex: 1;
          min-width: 0;
        }
        .pkg-field label {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--color-text-secondary, #6b7280);
          margin-bottom: 0.25rem;
        }
        .pkg-field input {
          width: 100%;
          padding: 0.5rem 0.6rem;
          border: 1px solid var(--color-border, #d1d5db);
          border-radius: 8px;
          font-size: 0.85rem;
          background: var(--color-surface, #fff);
          color: var(--color-text, #111827);
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .pkg-field input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
        }
        .pkg-bottom-row {
          display: flex;
          gap: 0.75rem;
        }

        /* Inline result badges */
        .pkg-inline-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .pkg-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
          background: var(--color-surface-secondary, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          transition: all 0.2s;
        }
        .pkg-badge-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--color-text-secondary, #9ca3af);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
        }
        .pkg-badge-val {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text, #111827);
        }
        .pkg-badge-sub {
          font-size: 0.6rem;
          color: var(--color-text-secondary, #9ca3af);
        }

        /* Badge color variants */
        .cbm-badge {
          border-color: #6366f1;
          background: #eef2ff;
        }
        .cbm-badge .pkg-badge-val { color: #6366f1; }

        .vol-badge.highlighted {
          border-color: #f97316;
          background: #fff7ed;
        }
        .vol-badge.highlighted .pkg-badge-val { color: #f97316; }

        .gross-badge.highlighted {
          border-color: #f97316;
          background: #fff7ed;
        }
        .gross-badge.highlighted .pkg-badge-val { color: #f97316; }

        /* 3D Box + Chargeable Weight */
        .pkg-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          min-width: 180px;
        }
        .pkg-scene {
          width: 160px;
          height: 140px;
          perspective: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .pkg-count-badge {
          position: absolute;
          bottom: 4px;
          right: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #f97316;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 6px;
          padding: 0.1rem 0.4rem;
        }

        /* Chargeable weight display */
        .pkg-chargeable {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.55rem 0.85rem;
          border-radius: 10px;
          border: 1.5px solid #059669;
          background: #ecfdf5;
          width: 100%;
        }
        .pkg-chargeable-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: #059669;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
        }
        .pkg-chargeable-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: #059669;
          margin-top: 0.1rem;
        }
        .pkg-chargeable-hint {
          font-size: 0.6rem;
          color: #6b7280;
          margin-top: 0.1rem;
        }

        @media (max-width: 640px) {
          .pkg-root {
            flex-direction: column;
          }
          .pkg-visual {
            width: 100%;
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
          .pkg-scene {
            width: 120px;
            height: 110px;
            min-width: 120px;
          }
          .pkg-chargeable {
            flex: 1;
          }
          .pkg-inline-badges {
            flex-direction: row;
          }
        }
      `}</style>
      <style jsx global>{`
        .pkg-box {
          position: relative;
          transform-style: preserve-3d;
        }
        .pkg-face {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          border: 2px solid #f97316;
          background: rgba(249, 115, 22, 0.06);
          backface-visibility: visible;
          margin-top: -50%;
          margin-left: -50%;
        }
        .pkg-front { background: rgba(249, 115, 22, 0.08); }
        .pkg-back { background: rgba(249, 115, 22, 0.04); }
        .pkg-left { background: rgba(249, 115, 22, 0.12); }
        .pkg-right { background: rgba(249, 115, 22, 0.06); }
        .pkg-top { background: rgba(249, 115, 22, 0.15); }
        .pkg-bottom { background: rgba(249, 115, 22, 0.03); }
      `}</style>
    </div>
  );
}
