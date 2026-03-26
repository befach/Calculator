import jsPDF from 'jspdf';
import { type AirFreightResult } from './calculate';
import { interRegular } from './fonts/inter-regular';
import { interBold } from './fonts/inter-bold';

interface PDFInput {
  result: AirFreightResult;
  currency: string;
  exchangeRate: number;
  hsnCode: string;
  productName: string;
  bcdRate: number;
  igstRate: number;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  return `${formatForeign(foreign, currency)}  (${formatINR(amountINR)})`;
}

export async function generateQuotePDF(input: PDFInput): Promise<void> {
  const { result, currency, exchangeRate, hsnCode, productName, bcdRate, igstRate } = input;
  const doc = new jsPDF('p', 'mm', 'a4');

  // Register Inter font
  doc.addFileToVFS('Inter-Regular.ttf', interRegular);
  doc.addFileToVFS('Inter-Bold.ttf', interBold);
  doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
  doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
  doc.setFont('Inter', 'normal');

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ─── Try to load logo ───
  let logoLoaded = false;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = '/logo.png';
      }),
      new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    doc.addImage(img, 'PNG', margin, y, 35, 12);
    logoLoaded = true;
  } catch {
    // Logo not available — use text fallback
  }

  // ─── Header ───
  if (!logoLoaded) {
    doc.setFontSize(22);
    doc.setTextColor(242, 146, 34); // #F29222
    doc.text('BEFACH', margin, y + 8);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Landing Cost Estimate', margin + (logoLoaded ? 38 : 42), y + 4);

  // Date on right
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(date, pageWidth - margin, y + 4, { align: 'right' });

  y += 18;

  // Divider
  doc.setDrawColor(242, 146, 34);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ─── Shipment Info ───
  doc.setFontSize(10);
  doc.setTextColor(54, 39, 30); // #36271E
  doc.setFont('Inter', 'bold');
  doc.text('SHIPMENT DETAILS', margin, y);
  y += 7;

  doc.setFont('Inter', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  const infoRows = [
    ['Origin', `${result.originCountry} (Zone ${result.originZone})`],
    ['Destination', 'India'],
    ['Product', productName || '—'],
    ['HSN Code', hsnCode || '—'],
    ['Currency', `${currency} (1 ${currency} = ${formatINR(exchangeRate)})`],
    ['Chargeable Weight', `${result.chargeableWeight} kg`],
    ['Quantity', `${result.quantity} units`],
  ];

  for (const [label, value] of infoRows) {
    doc.setFont('Inter', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('Inter', 'normal');
    doc.text(value, margin + 42, y);
    y += 5.5;
  }

  y += 8;

  // ─── Cost Breakdown Table ───
  doc.setFont('Inter', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(54, 39, 30);
  doc.text('COST BREAKDOWN', margin, y);
  y += 7;

  // Table header
  doc.setFillColor(242, 146, 34);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Inter', 'bold');
  doc.text('Item', margin + 3, y + 5);
  doc.text('Amount', pageWidth - margin - 3, y + 5, { align: 'right' });
  y += 10;

  // Cost rows
  const costItems: [string, number][] = [
    ['FOB Value', result.fobValueINR],
    ['Air Freight', result.totalFreight],
    ['Insurance (0.5%)', result.insurance],
  ];

  const cifItems: [string, number][] = [
    [`Basic Customs Duty (${bcdRate}%)`, result.basicCustomsDuty],
    ['Social Welfare Surcharge', result.socialWelfareSurcharge],
    [`IGST (${igstRate}%)`, result.igst],
  ];

  const feeItems: [string, number][] = [
    ['Clearance Charges', result.clearanceCharges],
  ];

  if (result.inlandTransport > 0) {
    feeItems.push(['Inland Transport', result.inlandTransport]);
  }

  function drawRow(label: string, amountINR: number, isBold = false) {
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, margin + 3, y + 4);
    doc.text(formatAmount(amountINR, exchangeRate, currency), pageWidth - margin - 3, y + 4, { align: 'right' });
    // Light bottom border
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    y += 7;
  }

  function drawSubtotal(label: string, amountINR: number) {
    doc.setFillColor(255, 248, 240);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(54, 39, 30);
    doc.setFont('Inter', 'bold');
    doc.text(label, margin + 3, y + 5);
    doc.text(formatAmount(amountINR, exchangeRate, currency), pageWidth - margin - 3, y + 5, { align: 'right' });
    y += 9;
  }

  function drawSectionLabel(title: string) {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('Inter', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 4);
    y += 6;
  }

  // Product & Freight
  drawSectionLabel('Product & Freight');
  for (const [label, amount] of costItems) drawRow(label, amount);
  drawSubtotal('CIF Value', result.cifValue);

  // Duties & Taxes
  drawSectionLabel('Duties & Taxes');
  for (const [label, amount] of cifItems) drawRow(label, amount);
  drawSubtotal('Total Duties', result.totalDuties);

  // Processing Fees
  drawSectionLabel('Processing Fees');
  for (const [label, amount] of feeItems) drawRow(label, amount);

  y += 4;

  // ─── Total ───
  doc.setFillColor(242, 146, 34);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('Inter', 'bold');
  doc.text('Total Landed Cost', margin + 5, y + 6);

  const totalText = currency !== 'INR'
    ? `${formatForeign(result.totalLandedCostForeign, currency)}  (${formatINR(result.totalLandedCost)})`
    : formatINR(result.totalLandedCost);
  doc.text(totalText, pageWidth - margin - 5, y + 6, { align: 'right' });

  if (result.quantity > 1) {
    doc.setFontSize(8);
    const perUnitText = currency !== 'INR'
      ? `Per Unit: ${formatForeign(result.costPerUnitForeign, currency)}  (${formatINR(result.costPerUnit)})`
      : `Per Unit: ${formatINR(result.costPerUnit)}`;
    doc.text(perUnitText, pageWidth - margin - 5, y + 12, { align: 'right' });
  }

  y += 22;

  // ─── Footer ───
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.setFont('Inter', 'normal');
  doc.text(
    'This is an estimate for reference purposes only. Actual costs may vary based on customs assessment and exchange rates at the time of clearance.',
    margin,
    y,
    { maxWidth: contentWidth }
  );
  y += 10;

  doc.setFont('Inter', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by calculator.befach.com', pageWidth / 2, y, { align: 'center' });

  // ─── Save ───
  const fileName = `BEFACH_Quote_${result.originCountry || 'Import'}_${date.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
}
