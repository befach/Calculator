import { safeStorage } from '../storage/safeStorage';
// Landed Cost Calculator Utility Functions

export interface CalculationInput {
  productName: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  fobValue: number;
  currency: string;
  weight: number;
  weightUnit: string;
  shippingMethod: 'sea' | 'air' | 'express' | 'rail';
  originCountry: string;
  destinationCountry: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  containerType?: string;
  customFreight?: number;
  customInsurance?: number;
  portCharges?: number;
  customsClearance?: number;
  inlandTransport?: number;
  otherCharges?: number;
}

export interface CalculationResult {
  // Input Values
  fobValue: number;

  // Calculated Values
  freight: number;
  insurance: number;
  cifValue: number;
  basicCustomsDuty: number;
  socialWelfareSurcharge: number;
  igst: number;
  totalDuties: number;
  portCharges: number;
  customsClearance: number;
  inlandTransport: number;
  otherCharges: number;
  totalAdditionalCharges: number;
  totalLandedCost: number;
  landedCostPerUnit: number;

  // Percentages
  dutyPercentage: number;
  freightPercentage: number;
  insurancePercentage: number;
  additionalChargesPercentage: number;

  // Metadata
  exchangeRate: number;
  currency: string;
  calculatedAt: string;
}

// Hardcoded HSN duty rates (first 2-4 digits)
const hsnDutyRates: { [key: string]: { bcd: number; igst: number; description: string } } = {
  // Electronics & Electrical
  '84': { bcd: 7.5, igst: 18, description: 'Machinery and mechanical appliances' },
  '8471': { bcd: 0, igst: 18, description: 'Computers and processing units' },
  '85': { bcd: 10, igst: 18, description: 'Electrical machinery and equipment' },
  '8517': { bcd: 20, igst: 18, description: 'Mobile phones and telecom equipment' },
  '8504': { bcd: 10, igst: 18, description: 'Electrical transformers and converters' },

  // Textiles & Apparel
  '61': { bcd: 20, igst: 12, description: 'Knitted apparel and clothing' },
  '62': { bcd: 20, igst: 12, description: 'Woven apparel and clothing' },
  '52': { bcd: 10, igst: 12, description: 'Cotton and cotton products' },
  '5208': { bcd: 10, igst: 12, description: 'Woven cotton fabrics' },

  // Plastics & Rubber
  '39': { bcd: 10, igst: 18, description: 'Plastics and plastic products' },
  '40': { bcd: 10, igst: 18, description: 'Rubber and rubber products' },

  // Chemicals
  '28': { bcd: 7.5, igst: 18, description: 'Inorganic chemicals' },
  '29': { bcd: 7.5, igst: 18, description: 'Organic chemicals' },
  '38': { bcd: 10, igst: 18, description: 'Miscellaneous chemical products' },

  // Metals
  '72': { bcd: 7.5, igst: 18, description: 'Iron and steel' },
  '73': { bcd: 10, igst: 18, description: 'Articles of iron and steel' },
  '74': { bcd: 10, igst: 18, description: 'Copper and articles' },
  '76': { bcd: 10, igst: 18, description: 'Aluminum and articles' },

  // Vehicles & Parts
  '87': { bcd: 15, igst: 28, description: 'Vehicles and parts' },
  '8703': { bcd: 60, igst: 28, description: 'Cars and motor vehicles' },

  // Food & Agriculture
  '08': { bcd: 30, igst: 12, description: 'Edible fruits and nuts' },
  '09': { bcd: 30, igst: 5, description: 'Coffee, tea, and spices' },
  '10': { bcd: 0, igst: 0, description: 'Cereals' },
  '15': { bcd: 15, igst: 12, description: 'Fats and oils' },

  // Default rate
  'default': { bcd: 10, igst: 18, description: 'General goods' }
};

// Hardcoded exchange rates (to INR)
const exchangeRates: { [key: string]: number } = {
  'INR': 1,
  'USD': 83.12,
  'EUR': 90.45,
  'GBP': 105.23,
  'CNY': 11.42,
  'JPY': 0.56,
  'AED': 22.64,
  'SGD': 62.15,
};

// Get duty rates for HSN code
export function getDutyRates(hsnCode: string): { bcd: number; igst: number; description: string } {
  // Try exact match first (4 digits)
  if (hsnDutyRates[hsnCode.substring(0, 4)]) {
    return hsnDutyRates[hsnCode.substring(0, 4)];
  }
  // Try 2 digit match
  if (hsnDutyRates[hsnCode.substring(0, 2)]) {
    return hsnDutyRates[hsnCode.substring(0, 2)];
  }
  // Return default rates
  return hsnDutyRates['default'];
}

// Calculate freight charges based on shipping method and FOB value
export function calculateFreight(fobValue: number, shippingMethod: string, weight: number = 0): number {
  // If custom freight is provided, use it
  const freightRates = {
    'sea': 0.05,    // 5% of FOB for sea freight
    'air': 0.15,    // 15% of FOB for air freight
    'express': 0.20, // 20% of FOB for express
    'rail': 0.08,   // 8% of FOB for rail
  };

  const rate = freightRates[shippingMethod as keyof typeof freightRates] || 0.08;
  let freight = fobValue * rate;

  // Add weight-based calculation for air/express
  if ((shippingMethod === 'air' || shippingMethod === 'express') && weight > 0) {
    // $5 per kg for air, $8 per kg for express (minimum charges)
    const perKgRate = shippingMethod === 'air' ? 5 : 8;
    const weightBasedFreight = weight * perKgRate * exchangeRates['USD'];
    freight = Math.max(freight, weightBasedFreight);
  }

  return Math.round(freight * 100) / 100;
}

// Calculate insurance (typically 0.5% of FOB + Freight)
export function calculateInsurance(fobValue: number, freight: number): number {
  const insuranceRate = 0.005; // 0.5%
  const insurance = (fobValue + freight) * insuranceRate;
  return Math.round(insurance * 100) / 100;
}

// Calculate CIF value
export function calculateCIF(fobValue: number, freight: number, insurance: number): number {
  return Math.round((fobValue + freight + insurance) * 100) / 100;
}

// Calculate Basic Customs Duty
export function calculateBasicCustomsDuty(cifValue: number, hsnCode: string): number {
  const rates = getDutyRates(hsnCode);
  const duty = cifValue * (rates.bcd / 100);
  return Math.round(duty * 100) / 100;
}

// Calculate Social Welfare Surcharge (10% of BCD)
export function calculateSocialWelfareSurcharge(basicDuty: number): number {
  const sws = basicDuty * 0.10; // 10% of Basic Customs Duty
  return Math.round(sws * 100) / 100;
}

// Calculate IGST
export function calculateIGST(cifValue: number, basicDuty: number, sws: number, hsnCode: string): number {
  const rates = getDutyRates(hsnCode);
  const assessableValue = cifValue + basicDuty + sws;
  const igst = assessableValue * (rates.igst / 100);
  return Math.round(igst * 100) / 100;
}

// Calculate Total Landed Cost
export function calculateLandedCost(input: CalculationInput): CalculationResult {
  // Convert currency if needed
  const exchangeRate = exchangeRates[input.currency] || exchangeRates['USD'];
  const fobValueINR = input.fobValue * exchangeRate;

  // Core calculations
  const freight = input.customFreight || calculateFreight(fobValueINR, input.shippingMethod, input.weight);
  const insurance = input.customInsurance || calculateInsurance(fobValueINR, freight);
  const cifValue = calculateCIF(fobValueINR, freight, insurance);

  // Duties and taxes
  const basicCustomsDuty = calculateBasicCustomsDuty(cifValue, input.hsnCode);
  const socialWelfareSurcharge = calculateSocialWelfareSurcharge(basicCustomsDuty);
  const igst = calculateIGST(cifValue, basicCustomsDuty, socialWelfareSurcharge, input.hsnCode);
  const totalDuties = basicCustomsDuty + socialWelfareSurcharge + igst;

  // Additional charges (use provided values or defaults)
  const portCharges = input.portCharges || (cifValue * 0.01); // 1% of CIF as default
  const customsClearance = input.customsClearance || 5000; // Fixed ₹5000 default
  const inlandTransport = input.inlandTransport || (cifValue * 0.02); // 2% of CIF as default
  const otherCharges = input.otherCharges || 0;
  const totalAdditionalCharges = portCharges + customsClearance + inlandTransport + otherCharges;

  // Total landed cost
  const totalLandedCost = cifValue + totalDuties + totalAdditionalCharges;
  const landedCostPerUnit = input.quantity > 0 ? totalLandedCost / input.quantity : totalLandedCost;

  // Calculate percentages
  const dutyPercentage = (totalDuties / totalLandedCost) * 100;
  const freightPercentage = (freight / totalLandedCost) * 100;
  const insurancePercentage = (insurance / totalLandedCost) * 100;
  const additionalChargesPercentage = (totalAdditionalCharges / totalLandedCost) * 100;

  return {
    fobValue: fobValueINR,
    freight,
    insurance,
    cifValue,
    basicCustomsDuty,
    socialWelfareSurcharge,
    igst,
    totalDuties,
    portCharges,
    customsClearance,
    inlandTransport,
    otherCharges,
    totalAdditionalCharges,
    totalLandedCost,
    landedCostPerUnit,
    dutyPercentage,
    freightPercentage,
    insurancePercentage,
    additionalChargesPercentage,
    exchangeRate,
    currency: input.currency,
    calculatedAt: new Date().toISOString(),
  };
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === 'INR') {
    return formatter.format(amount);
  } else {
    // For other currencies, show both original and INR
    const inrAmount = amount * (exchangeRates[currency] || 1);
    return `${currency} ${amount.toFixed(2)} (₹${inrAmount.toFixed(2)})`;
  }
}

// Get all available currencies
export function getAvailableCurrencies(): { code: string; name: string; rate: number }[] {
  return [
    { code: 'INR', name: 'Indian Rupee', rate: 1 },
    { code: 'USD', name: 'US Dollar', rate: exchangeRates['USD'] },
    { code: 'EUR', name: 'Euro', rate: exchangeRates['EUR'] },
    { code: 'GBP', name: 'British Pound', rate: exchangeRates['GBP'] },
    { code: 'CNY', name: 'Chinese Yuan', rate: exchangeRates['CNY'] },
    { code: 'JPY', name: 'Japanese Yen', rate: exchangeRates['JPY'] },
    { code: 'AED', name: 'UAE Dirham', rate: exchangeRates['AED'] },
    { code: 'SGD', name: 'Singapore Dollar', rate: exchangeRates['SGD'] },
  ];
}

// Get shipping methods
export function getShippingMethods(): { value: string; label: string; description: string }[] {
  return [
    { value: 'sea', label: 'Sea Freight', description: 'Economy option (20-45 days)' },
    { value: 'air', label: 'Air Freight', description: 'Faster delivery (5-10 days)' },
    { value: 'express', label: 'Express Courier', description: 'Fastest option (2-5 days)' },
    { value: 'rail', label: 'Rail Freight', description: 'Land route (15-25 days)' },
  ];
}

// Save calculation to localStorage
export function saveCalculation(calculation: CalculationResult & { input: CalculationInput }): void {
  const saved = safeStorage.getItem('landedCostCalculations');
  const calculations = saved ? JSON.parse(saved) : [];

  const newCalculation = {
    id: Date.now().toString(),
    ...calculation,
    savedAt: new Date().toISOString(),
  };

  calculations.unshift(newCalculation);

  // Keep only last 50 calculations
  if (calculations.length > 50) {
    calculations.pop();
  }

  safeStorage.setItem('landedCostCalculations', JSON.stringify(calculations));
}

// Get saved calculations from localStorage
export function getSavedCalculations(): any[] {
  const saved = safeStorage.getItem('landedCostCalculations');
  return saved ? JSON.parse(saved) : [];
}

// Clear calculation history
export function clearCalculationHistory(): void {
  safeStorage.removeItem('landedCostCalculations');
}

// Search HSN codes (simplified version)
export function searchHSNCodes(query: string): { code: string; description: string; dutyRate: number; igstRate: number }[] {
  const results: { code: string; description: string; dutyRate: number; igstRate: number }[] = [];

  Object.entries(hsnDutyRates).forEach(([code, rates]) => {
    if (code !== 'default' && (code.includes(query) || rates.description.toLowerCase().includes(query.toLowerCase()))) {
      results.push({
        code: code.padEnd(8, '0'),
        description: rates.description,
        dutyRate: rates.bcd,
        igstRate: rates.igst,
      });
    }
  });

  return results.slice(0, 10); // Return top 10 results
}

// ═══════════════════════════════════════════════════════════════════
// Multi-Product Landing Cost Calculator (mirrors Excel formulas)
// ═══════════════════════════════════════════════════════════════════

export interface QuoteProductInput {
  name: string;
  exworksPrice: number;    // per-unit price in INR (already converted)
  weight: number;
  quantity: number;
  unit: string;
  hsnCode: string;
  customDutyPercent: number;  // as decimal, e.g. 0.075 for 7.5%
  gstPercent: number;         // as decimal, e.g. 0.18 for 18%
}

export interface QuoteShippingInput {
  seaAirFreight: number;
  localShipping: number;
  localClearance: number;
  originClearance: number;
  insuranceInspection: number;
}

export interface QuoteServiceInput {
  sourcingChargePercent: number;   // decimal, e.g. 0.02
  handlingChargePercent: number;   // decimal, e.g. 0.02
  serviceChargePercent: number;    // decimal, e.g. 0.012
  transactionalFee: number;        // fixed INR amount
}

export interface QuoteInput {
  quoteId: string;
  airOrSea: 'Air' | 'Sea';
  supplierName: string;
  exchangeRate: number;
  products: QuoteProductInput[];
  shipping: QuoteShippingInput;
  services: QuoteServiceInput;
}

export interface QuoteProductResult {
  name: string;
  weight: number;
  cif: number;
  customs: number;
  sws: number;
  localShipping: number;
  gst: number;
  importCost: number;
  total: number;
  perPiece: number;
  exGstPerPiece: number;
  gstPerPiece: number;
  totalProductCostExGst: number;
  totalGst: number;
}

export interface QuoteServiceResult {
  sourcingCharges: number;
  sourcingGst: number;
  handlingCharges: number;
  handlingGst: number;
  serviceCharges: number;
  serviceGst: number;
}

export interface QuoteFinalBreakup {
  endToEnd: number;
  shipping: number;
  customsAndGst: number;
}

export interface QuoteResult {
  products: QuoteProductResult[];
  services: QuoteServiceResult;
  grandTotal: number;
  finalBreakup: QuoteFinalBreakup;
  numProducts: number;
}

export function calculateQuote(input: QuoteInput): QuoteResult | null {
  const activeProducts = input.products.filter(
    p => p.name && p.name.trim() !== '' && p.exworksPrice > 0
  );
  const N = activeProducts.length;
  if (N === 0) return null;

  const { shipping: sh, services: sv } = input;

  // Shared costs split equally across products
  const sharedCifCost = (sh.seaAirFreight + sh.originClearance + sh.insuranceInspection + sv.transactionalFee) / N;
  const sharedLocalCost = (sh.localShipping + sh.localClearance) / N;

  // Step 1: Calculate CIF for each product (needed for service charges)
  const cifValues = activeProducts.map(p => (p.exworksPrice * p.quantity) + sharedCifCost);
  const totalCif = cifValues.reduce((sum, v) => sum + v, 0);

  // Step 2: Calculate global service charges (sourcing & handling depend on CIF)
  const sourcingCharges = totalCif * sv.sourcingChargePercent;
  const sourcingGst = sourcingCharges * 0.18;
  const handlingCharges = ((totalCif / 5) + sh.seaAirFreight + sh.localShipping + sh.localClearance + sh.originClearance) * sv.handlingChargePercent;
  const handlingGst = handlingCharges * 0.18;

  // Step 3: Calculate per-product results (import cost, before service charges)
  const importCosts: number[] = [];
  const productResults: QuoteProductResult[] = activeProducts.map((p, i) => {
    const cif = cifValues[i];
    const customs = cif * p.customDutyPercent;
    const sws = customs * 0.10;
    const localShippingShare = sharedLocalCost;

    // GST = ((CIF + SWS + Customs) * gst%) + (localShipping * 18%) + (sourcingGST + handlingGST) / N
    const gst =
      ((cif + sws + customs) * p.gstPercent) +
      (localShippingShare * 0.18) +
      (sourcingGst + handlingGst) / N;

    // ImportCost = (CIF + SWS + Customs + GST) + ((localShipping + localClearance + sourcingCharges + handlingCharges) / N) + localShippingShare
    const importCost =
      ((cif + sws + customs + gst) +
       ((sh.localShipping + sh.localClearance + sourcingCharges + handlingCharges) / N) +
       localShippingShare);

    importCosts.push(importCost);

    // Placeholder — total will be filled after service charges
    return {
      name: p.name,
      weight: p.weight,
      cif,
      customs,
      sws,
      localShipping: localShippingShare,
      gst,
      importCost,
      total: 0,
      perPiece: 0,
      exGstPerPiece: 0,
      gstPerPiece: 0,
      totalProductCostExGst: 0,
      totalGst: 0,
    };
  });

  // Step 4: Service charges (based on sum of import costs)
  const totalImportCost = importCosts.reduce((sum, v) => sum + v, 0);
  const serviceCharges = totalImportCost * sv.serviceChargePercent;
  const serviceGst = serviceCharges * 0.18;

  // Step 5: Final per-product totals
  let grandTotal = 0;
  activeProducts.forEach((p, i) => {
    const r = productResults[i];
    // Excel: if N=1, add full service charges; else divide by N
    r.total = N === 1
      ? r.importCost + serviceCharges + serviceGst
      : r.importCost + (serviceCharges + serviceGst) / N;
    r.perPiece = p.quantity > 0 ? r.total / p.quantity : r.total;
    r.exGstPerPiece = r.perPiece / (1 + p.gstPercent);
    r.gstPerPiece = r.perPiece - r.exGstPerPiece;
    r.totalProductCostExGst = r.exGstPerPiece * p.quantity;
    r.totalGst = r.gstPerPiece * p.quantity;
    grandTotal += r.total;
  });

  // Final breakup (matches Excel S28-T32)
  const totalCustomsSws = productResults.reduce((s, r) => s + r.customs + r.sws, 0);
  const totalProductGst = productResults.reduce((s, r) => s + r.gst, 0);
  const finalBreakup: QuoteFinalBreakup = {
    endToEnd: grandTotal,
    shipping: sh.seaAirFreight + sh.localShipping + sh.insuranceInspection + handlingCharges,
    customsAndGst: sh.localClearance + sh.originClearance + totalCustomsSws + totalProductGst,
  };

  return {
    products: productResults,
    services: {
      sourcingCharges,
      sourcingGst,
      handlingCharges,
      handlingGst,
      serviceCharges,
      serviceGst,
    },
    grandTotal,
    finalBreakup,
    numProducts: N,
  };
}