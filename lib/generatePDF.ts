import { pdf, Document, Page, View, Text, Image, Svg, Rect, Path } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { type AirFreightResult } from './calculate';
import React from 'react';

interface PDFInput {
  result: AirFreightResult;
  currency: string;
  exchangeRate: number;
  hsnCode: string;
  productName: string;
  bcdRate: number;
  igstRate: number;
}

const tw = createTw({
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F29222',
          'orange-dark': '#C47518',
          brown: '#36271E',
          cream: '#FFF8F0',
        },
      },
    },
  },
});

function formatINR(amount: number): string {
  // Use manual formatting — @react-pdf/renderer default font doesn't support ₹
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `INR ${formatted}`;
}

function formatForeign(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatAmount(amountINR: number, exchangeRate: number, currency: string): string {
  if (currency === 'INR') return formatINR(amountINR);
  const foreign = exchangeRate > 0 ? amountINR / exchangeRate : 0;
  return `${formatINR(amountINR)}  (${formatForeign(foreign, currency)})`;
}

// 3D Box SVG for the PDF — isometric-style package illustration
function Box3D({ width: w, height: h, depth: d }: { width: number; height: number; depth: number }) {
  // Normalize dimensions for SVG viewport
  const max = Math.max(w, h, d, 1);
  const scale = 60 / max;
  const bw = Math.max(w * scale, 10);
  const bh = Math.max(h * scale, 10);
  const bd = Math.max(d * scale, 10);

  // Isometric offsets
  const ox = bd * 0.5;
  const oy = bd * 0.35;

  const svgW = bw + ox + 4;
  const svgH = bh + oy + 4;

  // Front face: bottom-left origin
  const frontX = 2;
  const frontY = oy + 2;

  // Top face points (parallelogram)
  const topPoints = `${frontX},${frontY} ${frontX + ox},${frontY - oy} ${frontX + ox + bw},${frontY - oy} ${frontX + bw},${frontY}`;

  // Right face points (parallelogram)
  const rightX = frontX + bw;
  const rightPoints = `${rightX},${frontY} ${rightX + ox},${frontY - oy} ${rightX + ox},${frontY - oy + bh} ${rightX},${frontY + bh}`;

  return React.createElement(Svg, { width: svgW, height: svgH, viewBox: `0 0 ${svgW} ${svgH}` },
    // Front face
    React.createElement(Rect, {
      x: frontX, y: frontY, width: bw, height: bh,
      fill: '#FDECD0', stroke: '#F29222', strokeWidth: 0.8,
    }),
    // Top face
    React.createElement(Path, {
      d: `M ${topPoints} Z`,
      fill: '#FBD89C', stroke: '#F29222', strokeWidth: 0.8,
    }),
    // Right face
    React.createElement(Path, {
      d: `M ${rightPoints} Z`,
      fill: '#F5C56E', stroke: '#F29222', strokeWidth: 0.8,
    }),
    // Tape line on front
    React.createElement(Rect, {
      x: frontX + bw * 0.42, y: frontY, width: bw * 0.16, height: bh,
      fill: '#F29222', opacity: 0.2,
    }),
    // Tape line on top
    React.createElement(Path, {
      d: `M ${frontX + bw * 0.42},${frontY} L ${frontX + bw * 0.42 + ox},${frontY - oy} L ${frontX + bw * 0.58 + ox},${frontY - oy} L ${frontX + bw * 0.58},${frontY} Z`,
      fill: '#F29222', opacity: 0.15,
    }),
  );
}

function CostRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return React.createElement(View, { style: tw('flex-row justify-between py-1.5 px-3 border-b border-gray-100') },
    React.createElement(Text, { style: tw(`text-xs ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`) }, label),
    React.createElement(Text, { style: tw(`text-xs ${bold ? 'font-bold text-gray-800' : 'text-gray-600'} text-right`) }, value),
  );
}

function SectionLabel({ title }: { title: string }) {
  return React.createElement(View, { style: tw('bg-gray-50 px-3 py-1.5 mt-2') },
    React.createElement(Text, { style: tw('text-xs font-bold text-gray-400 uppercase tracking-wider') }, title),
  );
}

function SubtotalRow({ label, value }: { label: string; value: string }) {
  return React.createElement(View, { style: tw('flex-row justify-between py-2 px-3 bg-orange-50') },
    React.createElement(Text, { style: tw('text-xs font-bold text-gray-800') }, label),
    React.createElement(Text, { style: tw('text-xs font-bold text-gray-800 text-right') }, value),
  );
}

function PercentBar({ segments }: { segments: { label: string; percent: number; color: string }[] }) {
  return React.createElement(View, { style: tw('mt-3 mb-1') },
    // Bar
    React.createElement(View, { style: tw('flex-row h-2 rounded-full overflow-hidden bg-gray-100') },
      ...segments.filter(s => s.percent > 0).map((seg, i) =>
        React.createElement(View, { key: i, style: { width: `${seg.percent}%`, backgroundColor: seg.color, height: 8 } })
      ),
    ),
    // Legend
    React.createElement(View, { style: tw('flex-row flex-wrap mt-1.5 gap-3') },
      ...segments.map((seg, i) =>
        React.createElement(View, { key: i, style: tw('flex-row items-center gap-1') },
          React.createElement(View, { style: { width: 6, height: 6, borderRadius: 3, backgroundColor: seg.color } }),
          React.createElement(Text, { style: tw('text-xs text-gray-500') }, `${seg.label} ${seg.percent}%`),
        ),
      ),
    ),
  );
}

function QuoteDocument({ input }: { input: PDFInput }) {
  const { result, currency, exchangeRate, hsnCode, productName, bcdRate, igstRate } = input;

  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const segments = [
    { label: 'FOB', percent: result.fobPercent, color: '#F29222' },
    { label: 'Freight', percent: result.freightPercent, color: '#E8A54C' },
    { label: 'Duties', percent: result.dutiesPercent, color: '#C47518' },
    { label: 'Fees', percent: result.additionalPercent, color: '#8B5E3C' },
  ];

  const totalText = currency !== 'INR'
    ? `${formatINR(result.totalLandedCost)}  (${formatForeign(result.totalLandedCostForeign, currency)})`
    : formatINR(result.totalLandedCost);

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: tw('p-0 bg-white') },

      // ─── Header bar ───
      React.createElement(View, { style: tw('bg-white px-10 pt-8 pb-4 flex-row justify-between items-center') },
        React.createElement(View, { style: tw('flex-row items-center gap-3') },
          React.createElement(Image, { src: '/logo.png', style: { width: 90, height: 30, objectFit: 'contain' } }),
          React.createElement(View, { style: tw('border-l border-gray-200 pl-3 ml-1') },
            React.createElement(Text, { style: tw('text-xs text-gray-400') }, 'Landing Cost Estimate'),
          ),
        ),
        React.createElement(Text, { style: tw('text-xs text-gray-400') }, date),
      ),

      // Orange divider
      React.createElement(View, { style: { height: 2, backgroundColor: '#F29222', marginHorizontal: 40 } }),

      // ─── Content ───
      React.createElement(View, { style: tw('px-10 pt-6') },

        // ─── Shipment Details + 3D Box ───
        React.createElement(View, { style: tw('flex-row justify-between mb-5') },
          // Left: details
          React.createElement(View, { style: tw('flex-1') },
            React.createElement(View, { style: tw('flex-row items-center gap-2 mb-3') },
              React.createElement(Image, { src: '/plane.png', style: { width: 14, height: 14, objectFit: 'contain' } }),
              React.createElement(Text, { style: tw('text-sm font-bold text-gray-800 uppercase tracking-wider') }, 'Shipment Details'),
            ),
            ...[
              ['Origin', `${result.originCountry} (Zone ${result.originZone})`],
              ['Destination', 'India'],
              ['Product', productName || '—'],
              ['HSN Code', hsnCode || '—'],
              ['Currency', `${currency} (1 ${currency} = ${formatINR(exchangeRate)})`],
              ['Chargeable Weight', `${result.chargeableWeight} kg`],
              ['Quantity', `${result.quantity} units`],
            ].map(([label, value], i) =>
              React.createElement(View, { key: i, style: tw('flex-row mb-1') },
                React.createElement(Text, { style: tw('text-xs font-bold text-gray-500 w-28') }, `${label}:`),
                React.createElement(Text, { style: tw('text-xs text-gray-700') }, value),
              ),
            ),
          ),
          // Right: 3D box centered with labels below
          React.createElement(View, { style: tw('items-center justify-center pl-6') },
            React.createElement(Box3D, {
              width: result.volumetricWeight > 0 ? Math.cbrt(result.cbm * 1e6) : 30,
              height: result.volumetricWeight > 0 ? Math.cbrt(result.cbm * 1e6) : 30,
              depth: result.volumetricWeight > 0 ? Math.cbrt(result.cbm * 1e6) : 30,
            }),
            React.createElement(Text, { style: tw('text-xs text-gray-400 mt-2') },
              `${result.cbm.toFixed(4)} m³`,
            ),
            React.createElement(Text, { style: tw('text-xs text-gray-400') },
              `${result.chargeableWeight} kg chargeable`,
            ),
          ),
        ),

        // ─── Cost Distribution Bar ───
        React.createElement(Text, { style: tw('text-sm font-bold text-gray-800 uppercase tracking-wider mb-1') }, 'Cost Distribution'),
        React.createElement(PercentBar, { segments }),

        // ─── Cost Breakdown Table ───
        React.createElement(View, { style: tw('border border-gray-200 rounded-lg overflow-hidden mt-4') },
          // Table header
          React.createElement(View, { style: tw('flex-row justify-between py-2 px-3 bg-orange-500') },
            React.createElement(Text, { style: tw('text-xs font-bold text-white') }, 'Item'),
            React.createElement(Text, { style: tw('text-xs font-bold text-white text-right') }, 'Amount'),
          ),

          // Product & Freight
          React.createElement(SectionLabel, { title: 'Product & Freight' }),
          React.createElement(CostRow, { label: 'FOB Value', value: formatAmount(result.fobValueINR, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'Air Freight', value: formatAmount(result.totalFreight, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'Insurance (0.5%)', value: formatAmount(result.insurance, exchangeRate, currency) }),
          React.createElement(SubtotalRow, { label: 'CIF Value', value: formatAmount(result.cifValue, exchangeRate, currency) }),

          // Duties & Taxes
          React.createElement(SectionLabel, { title: 'Duties & Taxes' }),
          React.createElement(CostRow, { label: `Basic Customs Duty (${bcdRate}%)`, value: formatAmount(result.basicCustomsDuty, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'Social Welfare Surcharge', value: formatAmount(result.socialWelfareSurcharge, exchangeRate, currency) }),
          React.createElement(CostRow, { label: `IGST (${igstRate}%)`, value: formatAmount(result.igst, exchangeRate, currency) }),
          React.createElement(SubtotalRow, { label: 'Total Duties', value: formatAmount(result.totalDuties, exchangeRate, currency) }),

          // Processing Fees
          React.createElement(SectionLabel, { title: 'Processing Fees' }),
          React.createElement(CostRow, { label: 'Clearance Charges', value: formatAmount(result.clearanceCharges, exchangeRate, currency) }),
          ...(result.inlandTransport > 0 ? [
            React.createElement(CostRow, { key: 'inland', label: 'Inland Transport', value: formatAmount(result.inlandTransport, exchangeRate, currency) }),
          ] : []),
        ),

        // ─── Total Card ───
        React.createElement(View, { style: tw('mt-4 bg-orange-500 rounded-lg p-4 flex-row justify-between items-center') },
          React.createElement(View, null,
            React.createElement(Text, { style: tw('text-sm font-bold text-white') }, 'Total Landed Cost'),
            result.quantity > 1
              ? React.createElement(Text, { style: tw('text-xs text-white opacity-70 mt-0.5') },
                  `Per Unit (${result.quantity} units): ${currency !== 'INR'
                    ? `${formatINR(result.costPerUnit)} (${formatForeign(result.costPerUnitForeign, currency)})`
                    : formatINR(result.costPerUnit)
                  }`,
                )
              : null,
          ),
          React.createElement(Text, { style: tw('text-lg font-bold text-white') }, totalText),
        ),

        // ─── Footer ───
        React.createElement(View, { style: tw('mt-8 pt-4 border-t border-gray-100') },
          React.createElement(Text, { style: tw('text-xs text-gray-300 text-center leading-relaxed') },
            'This is an estimate for reference purposes only. Actual costs may vary based on customs assessment and exchange rates at the time of clearance.',
          ),
          React.createElement(Text, { style: tw('text-xs text-gray-400 text-center mt-2') },
            'Generated by calculator.befach.com',
          ),
        ),
      ),
    ),
  );
}

export async function generateQuotePDF(input: PDFInput): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(QuoteDocument, { input }) as any;
  const blob = await pdf(doc).toBlob();

  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const fileName = `BEFACH_Quote_${input.result.originCountry || 'Import'}_${date.replace(/\s/g, '_')}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
