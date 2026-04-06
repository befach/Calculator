import { pdf, Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { type SeaFreightResult } from './calculateSea';
import { CONTAINER_SPECS, type ContainerType } from '@/core/seaFreightRates';
import React from 'react';

interface SeaPDFInput {
  result: SeaFreightResult;
  currency: string;
  exchangeRate: number;
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
    React.createElement(View, { style: tw('flex-row h-2 rounded-full overflow-hidden bg-gray-100') },
      ...segments.filter(s => s.percent > 0).map((seg, i) =>
        React.createElement(View, { key: i, style: { width: `${seg.percent}%`, backgroundColor: seg.color, height: 8 } })
      ),
    ),
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

function SeaQuoteDocument({ input }: { input: SeaPDFInput }) {
  const { result, currency, exchangeRate } = input;

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

  const hasMultipleProducts = result.products.length > 1;

  const containerLabel = result.containerType
    ? CONTAINER_SPECS[result.containerType]?.label || result.containerType
    : '';

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: tw('p-0 bg-white') },

      // Header bar
      React.createElement(View, { style: tw('bg-white px-10 pt-8 pb-4 flex-row justify-between items-center') },
        React.createElement(View, { style: tw('flex-row items-center gap-3') },
          React.createElement(Image, { src: '/logo.png', style: { width: 90, height: 30, objectFit: 'contain' } }),
          React.createElement(View, { style: tw('border-l border-gray-200 pl-3 ml-1') },
            React.createElement(Text, { style: tw('text-xs text-gray-400') }, 'Sea Freight Landed Cost Estimate'),
          ),
        ),
        React.createElement(Text, { style: tw('text-xs text-gray-400') }, date),
      ),

      // Orange divider
      React.createElement(View, { style: { height: 2, backgroundColor: '#F29222', marginHorizontal: 40 } }),

      // Content
      React.createElement(View, { style: tw('px-10 pt-6') },

        // Shipment Details
        React.createElement(View, { style: tw('mb-5') },
          React.createElement(View, { style: tw('flex-row items-center gap-2 mb-3') },
            React.createElement(Text, { style: tw('text-sm font-bold text-gray-800 uppercase tracking-wider') }, 'Shipment Details'),
          ),
          ...[
            ['Origin', result.originCountry],
            ['Destination', `India (${result.destinationSeaPort})`],
            ['Shipping Mode', result.shippingMode === 'FCL'
              ? `FCL - ${containerLabel}${result.numberOfContainers && result.numberOfContainers > 1 ? ` x${result.numberOfContainers}` : ''}`
              : 'LCL (Less than Container Load)'],
            ['Products', hasMultipleProducts ? `${result.products.length} products` : (result.products[0]?.productName || '\u2014')],
            ...(hasMultipleProducts ? [] : [['HSN Code', result.products[0]?.hsnCode || '\u2014']]),
            ['Currency', `${currency} (1 ${currency} = ${formatINR(exchangeRate)})`],
            ['Gross Weight', `${result.totalGrossWeight} kg`],
            ['Total CBM', `${result.totalCbm.toFixed(4)} m\u00B3`],
            ['Total Quantity', `${result.totalQuantity} units`],
            ['Est. Transit', result.deliveryEstimate],
          ].map(([label, value], i) =>
            React.createElement(View, { key: i, style: tw('flex-row mb-1') },
              React.createElement(Text, { style: tw('text-xs font-bold text-gray-500 w-28') }, `${label}:`),
              React.createElement(Text, { style: tw('text-xs text-gray-700') }, value),
            ),
          ),
        ),

        // Cost Distribution Bar
        React.createElement(Text, { style: tw('text-sm font-bold text-gray-800 uppercase tracking-wider mb-1') }, 'Cost Distribution'),
        React.createElement(PercentBar, { segments }),

        // Per-Product Table (for multi-product)
        ...(hasMultipleProducts ? [
          React.createElement(View, { key: 'product-breakdown', style: tw('border border-gray-200 rounded-lg overflow-hidden mt-4') },
            React.createElement(View, { style: tw('flex-row py-2 px-3 bg-orange-500') },
              React.createElement(Text, { style: tw('text-xs font-bold text-white w-1/4') }, 'Product'),
              React.createElement(Text, { style: tw('text-xs font-bold text-white w-1/6 text-right') }, 'FOB'),
              React.createElement(Text, { style: tw('text-xs font-bold text-white w-1/6 text-right') }, 'Freight'),
              React.createElement(Text, { style: tw('text-xs font-bold text-white w-1/6 text-right') }, 'Duties'),
              React.createElement(Text, { style: tw('text-xs font-bold text-white w-1/4 text-right') }, 'Landed Cost'),
            ),
            ...result.products.map((p, i) =>
              React.createElement(View, { key: i, style: tw(`flex-row py-1.5 px-3 border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50' : ''}`) },
                React.createElement(View, { style: tw('w-1/4') },
                  React.createElement(Text, { style: tw('text-xs text-gray-700') }, p.productName || `Product ${i + 1}`),
                  React.createElement(Text, { style: tw('text-xs text-gray-400') }, `HSN: ${p.hsnCode}`),
                ),
                React.createElement(Text, { style: tw('text-xs text-gray-600 w-1/6 text-right') }, formatINR(p.fobValueINR)),
                React.createElement(Text, { style: tw('text-xs text-gray-600 w-1/6 text-right') }, formatINR(p.freightShare)),
                React.createElement(Text, { style: tw('text-xs text-gray-600 w-1/6 text-right') }, formatINR(p.totalDuties)),
                React.createElement(View, { style: tw('w-1/4') },
                  React.createElement(Text, { style: tw('text-xs font-bold text-gray-800 text-right') }, formatINR(p.totalLandedCost)),
                  p.quantity > 1
                    ? React.createElement(Text, { style: tw('text-xs text-gray-400 text-right') }, `${formatINR(p.costPerUnit)}/unit`)
                    : null,
                ),
              ),
            ),
          ),
        ] : []),

        // Aggregate Cost Breakdown Table
        React.createElement(View, { style: tw('border border-gray-200 rounded-lg overflow-hidden mt-4') },
          React.createElement(View, { style: tw('flex-row justify-between py-2 px-3 bg-orange-500') },
            React.createElement(Text, { style: tw('text-xs font-bold text-white') }, hasMultipleProducts ? 'Aggregate Breakdown' : 'Item'),
            React.createElement(Text, { style: tw('text-xs font-bold text-white text-right') }, 'Amount'),
          ),

          // Product Value
          React.createElement(SectionLabel, { title: 'Product Value' }),
          React.createElement(CostRow, { label: 'FOB Value', value: formatAmount(result.totalFobINR, exchangeRate, currency) }),

          // Freight & Port Charges
          React.createElement(SectionLabel, { title: 'Freight & Port Charges' }),
          React.createElement(CostRow, { label: result.isUserFreight ? 'Ocean Freight (Custom)' : 'Ocean Freight', value: formatAmount(result.oceanFreight, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'THC Origin', value: formatAmount(result.thcOrigin, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'THC Destination', value: formatAmount(result.thcDestination, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'BL Fee', value: formatAmount(result.blFee, exchangeRate, currency) }),
          React.createElement(CostRow, { label: 'DO Charges', value: formatAmount(result.doCharges, exchangeRate, currency) }),
          ...(result.cfsCharges > 0 ? [
            React.createElement(CostRow, { key: 'cfs', label: 'CFS Charges', value: formatAmount(result.cfsCharges, exchangeRate, currency) }),
          ] : []),
          React.createElement(CostRow, { label: 'Customs Examination', value: formatAmount(result.customExamination, exchangeRate, currency) }),
          ...(result.demurrage > 0 ? [
            React.createElement(CostRow, { key: 'demurrage', label: 'Demurrage', value: formatAmount(result.demurrage, exchangeRate, currency) }),
          ] : []),
          ...(result.detention > 0 ? [
            React.createElement(CostRow, { key: 'detention', label: 'Detention', value: formatAmount(result.detention, exchangeRate, currency) }),
          ] : []),
          React.createElement(CostRow, { label: 'Insurance (0.5%)', value: formatAmount(result.totalInsurance, exchangeRate, currency) }),
          React.createElement(SubtotalRow, { label: 'CIF Value', value: formatAmount(result.totalCifValue, exchangeRate, currency) }),

          // Duties & Taxes
          React.createElement(SectionLabel, { title: 'Duties & Taxes' }),
          ...(hasMultipleProducts
            ? [
                React.createElement(CostRow, { key: 'duties-agg', label: 'Total Import Duties', value: formatAmount(result.totalDuties, exchangeRate, currency) }),
              ]
            : [
                React.createElement(CostRow, { key: 'bcd', label: `Basic Customs Duty (${result.products[0].bcdRate}%)`, value: formatAmount(result.products[0].basicCustomsDuty, exchangeRate, currency) }),
                React.createElement(CostRow, { key: 'sws', label: 'Social Welfare Surcharge', value: formatAmount(result.products[0].socialWelfareSurcharge, exchangeRate, currency) }),
                React.createElement(CostRow, { key: 'igst', label: `IGST (${result.products[0].igstRate}%)`, value: formatAmount(result.products[0].igst, exchangeRate, currency) }),
              ]
          ),
          React.createElement(SubtotalRow, { label: 'Total Duties', value: formatAmount(result.totalDuties, exchangeRate, currency) }),

          // Processing Fees
          React.createElement(SectionLabel, { title: 'Processing Fees' }),
          React.createElement(CostRow, { label: 'Clearance Charges', value: formatAmount(result.clearanceCharges, exchangeRate, currency) }),
          ...(result.inlandTransport > 0 ? [
            React.createElement(CostRow, { key: 'inland', label: 'Inland Transport', value: formatAmount(result.inlandTransport, exchangeRate, currency) }),
          ] : []),
        ),

        // Total Card
        React.createElement(View, { style: tw('mt-4 bg-orange-500 rounded-lg p-4 flex-row justify-between items-center') },
          React.createElement(View, null,
            React.createElement(Text, { style: tw('text-sm font-bold text-white') }, 'Total Landed Cost'),
            hasMultipleProducts
              ? React.createElement(Text, { style: tw('text-xs text-white opacity-70 mt-0.5') },
                  `${result.products.length} products | ${result.totalQuantity} units`,
                )
              : result.totalQuantity > 1
                ? React.createElement(Text, { style: tw('text-xs text-white opacity-70 mt-0.5') },
                    `Per Unit (${result.totalQuantity} units): ${currency !== 'INR'
                      ? `${formatINR(result.products[0].costPerUnit)} (${formatForeign(result.products[0].costPerUnitForeign, currency)})`
                      : formatINR(result.products[0].costPerUnit)
                    }`,
                  )
                : null,
          ),
          React.createElement(Text, { style: tw('text-lg font-bold text-white') }, totalText),
        ),

        // Transit Estimate
        React.createElement(View, { style: tw('mt-3 flex-row items-center gap-2') },
          React.createElement(Text, { style: tw('text-xs font-bold text-gray-500') }, 'Estimated Transit:'),
          React.createElement(Text, { style: tw('text-xs text-gray-700') }, result.deliveryEstimate),
        ),

        // Footer / Disclaimer
        React.createElement(View, { style: tw('mt-6 pt-4 border-t border-gray-200') },
          React.createElement(Text, { style: tw('text-xs text-gray-400 leading-relaxed') },
            'This is an indicative estimate only. Actual costs may vary based on final customs assessment, exchange rate fluctuations, and actual freight charges. Ocean freight rates are volatile and change frequently. Contact Befach for a firm quotation.',
          ),
          React.createElement(View, { style: tw('mt-3 flex-row items-center gap-2') },
            React.createElement(Text, { style: tw('text-xs text-gray-400') }, 'Generated by'),
            React.createElement(Image, { src: '/logo.png', style: { width: 50, height: 15, objectFit: 'contain' } }),
          ),
        ),
      ),
    ),
  );
}

export async function generateSeaQuotePDF(input: SeaPDFInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(SeaQuoteDocument, { input }) as any;
  const blob = await pdf(doc).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Befach-Sea-Freight-Estimate-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
