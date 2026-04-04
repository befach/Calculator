// Landing Cost Orchestrator — Wires DHL Import rates + duties + inland shipping
// Does NOT modify any existing files — calls into existing modules

import {
  calculateInsurance,
  calculateCIF,
  calculateSocialWelfareSurcharge,
  getDutyRates,
  getAvailableCurrencies,
  exchangeRates,
  roundExchangeRate,
  CLEARANCE_CHARGE_DEFAULT,
  CLEARANCE_CHARGE_HAZARDOUS,
} from '@/core/calculatorUtils';

import {
  getVolumetricWeight,
  getChargeableWeight,
} from '@/core/dhlRates';

import {
  getInlandShippingCost,
  getCityZone,
  type ClearancePort,
  type InlandCostResult,
} from '@/core/inlandRates';

import {
  importCountryZones,
  importRateTable,
  importMultiplierRates,
  IMPORT_FUEL_SURCHARGE_PERCENT,
  getImportDHLFreight,
} from '@/core/dhlImportRates';

// ─── Types ──────────────────────────────────────────────────────────────

export interface AirFreightInput {
  // Origin
  originCountryCode: string;

  // Package
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;

  // Product
  hsnCode: string;
  fobValue: number;
  currency: string;
  quantity: number;
  unitPrice: number;
  productName: string;

  // User-editable overrides
  exchangeRateOverride?: number;
  bcdRateOverride?: number;
  igstRateOverride?: number;

  // Inland delivery (optional)
  includeInlandDelivery: boolean;
  destinationCity?: string;
  clearancePort?: ClearancePort;
  inlandZone?: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface AirFreightResult {
  // Input echo
  originCountry: string;
  originZone: number;
  destinationCity: string;
  clearancePort: string;

  // Weight
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;

  // Cost breakdown
  fobValueOriginal: number;
  fobCurrency: string;
  exchangeRate: number;
  fobValueINR: number;

  baseFreight: number;
  fuelSurcharge: number;
  totalFreight: number;

  insurance: number;
  cifValue: number;

  basicCustomsDuty: number;
  bcdRate: number;
  socialWelfareSurcharge: number;
  igst: number;
  igstRate: number;
  totalDuties: number;

  clearanceCharges: number;
  inlandTransport: number;
  totalAdditionalCharges: number;

  totalLandedCost: number;
  costPerUnit: number;
  quantity: number;

  // Foreign currency equivalents
  totalLandedCostForeign: number;
  costPerUnitForeign: number;

  // Percentages
  fobPercent: number;
  freightPercent: number;
  dutiesPercent: number;
  additionalPercent: number;

  calculatedAt: string;
}

// ─── Main calculation function ──────────────────────────────────────────

export function calculateAirFreightLandedCost(input: AirFreightInput): AirFreightResult {
  // 1. Resolve DHL zone
  const countryInfo = importCountryZones[input.originCountryCode];
  if (!countryInfo) {
    throw new Error(`Unknown origin country code: ${input.originCountryCode}`);
  }
  const zone = countryInfo.zone;

  // 2. Weight calculations
  const singleVolumetric = getVolumetricWeight(input.lengthCm, input.widthCm, input.heightCm);
  const totalVolumetric = singleVolumetric * input.numPackages;
  const grossWeight = input.actualWeightKg * input.numPackages;
  const chargeableWeight = getChargeableWeight(grossWeight, totalVolumetric);
  const cbm = (input.lengthCm * input.widthCm * input.heightCm / 1_000_000) * input.numPackages;

  // 3. DHL freight (import rates)
  const baseFreight = getImportDHLFreight(chargeableWeight, zone);
  const fuelSurcharge = baseFreight * (IMPORT_FUEL_SURCHARGE_PERCENT / 100);
  const totalFreight = Math.round((baseFreight + fuelSurcharge) * 100) / 100;

  // 4. FOB conversion to INR (use override if provided, +2% bank charges)
  const rawExchangeRate = input.exchangeRateOverride && input.exchangeRateOverride > 0
    ? roundExchangeRate(input.exchangeRateOverride)
    : roundExchangeRate(exchangeRates[input.currency] || exchangeRates['USD']);
  const exchangeRate = input.currency === 'INR' ? rawExchangeRate : Math.round(rawExchangeRate * 1.02 * 100) / 100;
  const fobValueINR = Math.round(input.fobValue * exchangeRate * 100) / 100;

  // 5. Insurance
  const insurance = calculateInsurance(fobValueINR, totalFreight);

  // 6. CIF
  const cifValue = calculateCIF(fobValueINR, totalFreight, insurance);

  // 7. Duties (use overrides if provided)
  const dutyRates = getDutyRates(input.hsnCode);
  const effectiveBcdRate = input.bcdRateOverride !== undefined && input.bcdRateOverride >= 0
    ? input.bcdRateOverride
    : dutyRates.bcd;
  const effectiveIgstRate = input.igstRateOverride !== undefined && input.igstRateOverride >= 0
    ? input.igstRateOverride
    : dutyRates.igst;

  const basicCustomsDuty = Math.round(cifValue * (effectiveBcdRate / 100) * 100) / 100;
  const socialWelfareSurcharge = calculateSocialWelfareSurcharge(basicCustomsDuty);
  const igst = Math.round((cifValue + basicCustomsDuty + socialWelfareSurcharge) * (effectiveIgstRate / 100) * 100) / 100;
  const totalDuties = basicCustomsDuty + socialWelfareSurcharge + igst;

  // 8. Clearance charges (hazardous products = ₹5,000, non-hazardous = ₹2,700)
  const clearanceCharges = dutyRates.isHazardous ? CLEARANCE_CHARGE_HAZARDOUS : CLEARANCE_CHARGE_DEFAULT;

  // 9. Inland transport (only if user opted in)
  let inlandTransport = 0;
  if (input.includeInlandDelivery && input.clearancePort && input.inlandZone) {
    try {
      const inlandResult = getInlandShippingCost(
        chargeableWeight,
        input.inlandZone,
        input.clearancePort
      );
      inlandTransport = inlandResult.totalINR;
    } catch {
      // Fallback: 2% of CIF
      inlandTransport = Math.round(cifValue * 0.02 * 100) / 100;
    }
  }

  // 10. Total additional charges
  const totalAdditionalCharges = clearanceCharges + inlandTransport;

  // 14. Total landed cost
  const totalLandedCost = Math.round((cifValue + totalDuties + totalAdditionalCharges) * 100) / 100;
  const costPerUnit = input.quantity > 0
    ? Math.round((totalLandedCost / input.quantity) * 100) / 100
    : totalLandedCost;

  // 15. Percentages
  const fobPercent = totalLandedCost > 0 ? Math.round((fobValueINR / totalLandedCost) * 10000) / 100 : 0;
  const freightPercent = totalLandedCost > 0 ? Math.round(((totalFreight + insurance) / totalLandedCost) * 10000) / 100 : 0;
  const dutiesPercent = totalLandedCost > 0 ? Math.round((totalDuties / totalLandedCost) * 10000) / 100 : 0;
  const additionalPercent = totalLandedCost > 0 ? Math.round((totalAdditionalCharges / totalLandedCost) * 10000) / 100 : 0;

  return {
    originCountry: countryInfo.name,
    originZone: zone,
    destinationCity: input.destinationCity || '',
    clearancePort: input.clearancePort || '',

    volumetricWeight: Math.round(totalVolumetric * 100) / 100,
    grossWeight: Math.round(grossWeight * 100) / 100,
    chargeableWeight,
    cbm: Math.round(cbm * 1000000) / 1000000,

    fobValueOriginal: input.fobValue,
    fobCurrency: input.currency,
    exchangeRate,
    fobValueINR,

    baseFreight,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    totalFreight,

    insurance,
    cifValue,

    basicCustomsDuty,
    bcdRate: effectiveBcdRate,
    socialWelfareSurcharge,
    igst,
    igstRate: effectiveIgstRate,
    totalDuties,

    clearanceCharges,
    inlandTransport: Math.round(inlandTransport * 100) / 100,
    totalAdditionalCharges: Math.round(totalAdditionalCharges * 100) / 100,

    totalLandedCost,
    costPerUnit,
    quantity: input.quantity,

    totalLandedCostForeign: exchangeRate > 0 ? Math.round((totalLandedCost / exchangeRate) * 100) / 100 : 0,
    costPerUnitForeign: exchangeRate > 0 ? Math.round((costPerUnit / exchangeRate) * 100) / 100 : 0,

    fobPercent,
    freightPercent,
    dutiesPercent,
    additionalPercent,

    calculatedAt: new Date().toISOString(),
  };
}

// ─── Multi-Product Types ─────────────────────────────────────────────────

export interface MultiProductInput {
  originCountryCode: string;
  currency: string;
  exchangeRateOverride?: number;

  products: Array<{
    productName: string;
    hsnCode: string;
    bcdRateOverride?: number;
    igstRateOverride?: number;
    unitPrice: number;
    quantity: number;
    fobValue: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    actualWeightKg: number;
    numPackages: number;
  }>;

  includeInlandDelivery: boolean;
  destinationCity?: string;
  clearancePort?: ClearancePort;
  inlandZone?: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface ProductResult {
  productName: string;
  hsnCode: string;
  quantity: number;

  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;

  fobValueOriginal: number;
  fobValueINR: number;
  freightShare: number;
  insurance: number;
  cifValue: number;

  bcdRate: number;
  basicCustomsDuty: number;
  socialWelfareSurcharge: number;
  igstRate: number;
  igst: number;
  totalDuties: number;

  clearanceShare: number;
  inlandShare: number;

  totalLandedCost: number;
  costPerUnit: number;
  totalLandedCostForeign: number;
  costPerUnitForeign: number;
}

export interface MultiProductResult {
  originCountry: string;
  originZone: number;
  destinationCity: string;
  clearancePort: string;
  currency: string;
  exchangeRate: number;

  totalVolumetricWeight: number;
  totalGrossWeight: number;
  totalChargeableWeight: number;
  totalCbm: number;

  baseFreight: number;
  fuelSurcharge: number;
  totalFreight: number;

  totalFobINR: number;
  totalInsurance: number;
  totalCifValue: number;
  totalDuties: number;
  clearanceCharges: number;
  inlandTransport: number;
  totalAdditionalCharges: number;
  totalLandedCost: number;
  totalQuantity: number;

  totalLandedCostForeign: number;

  fobPercent: number;
  freightPercent: number;
  dutiesPercent: number;
  additionalPercent: number;

  products: ProductResult[];
  calculatedAt: string;
}

// ─── Multi-Product Calculation ───────────────────────────────────────────

export function calculateMultiProductLandedCost(input: MultiProductInput): MultiProductResult {
  const countryInfo = importCountryZones[input.originCountryCode];
  if (!countryInfo) throw new Error(`Unknown origin country code: ${input.originCountryCode}`);
  const zone = countryInfo.zone;

  // Per-product weight calculations
  const productWeights = input.products.map(p => {
    const singleVolumetric = getVolumetricWeight(p.lengthCm, p.widthCm, p.heightCm);
    const totalVolumetric = singleVolumetric * p.numPackages;
    const gross = p.actualWeightKg * p.numPackages;
    const chargeable = getChargeableWeight(gross, totalVolumetric);
    const cbm = (p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.numPackages;
    return {
      volumetricWeight: Math.round(totalVolumetric * 100) / 100,
      grossWeight: Math.round(gross * 100) / 100,
      chargeableWeight: chargeable,
      cbm: Math.round(cbm * 1000000) / 1000000,
    };
  });

  const totalChargeableWeight = productWeights.reduce((s, w) => s + w.chargeableWeight, 0);
  const totalVolumetricWeight = productWeights.reduce((s, w) => s + w.volumetricWeight, 0);
  const totalGrossWeight = productWeights.reduce((s, w) => s + w.grossWeight, 0);
  const totalCbm = productWeights.reduce((s, w) => s + w.cbm, 0);

  // One freight lookup for entire shipment
  const baseFreight = getImportDHLFreight(totalChargeableWeight, zone);
  const fuelSurcharge = baseFreight * (IMPORT_FUEL_SURCHARGE_PERCENT / 100);
  const totalFreight = Math.round((baseFreight + fuelSurcharge) * 100) / 100;

  // Exchange rate (+2% bank charges for non-INR)
  const rawExchangeRate = input.exchangeRateOverride && input.exchangeRateOverride > 0
    ? roundExchangeRate(input.exchangeRateOverride)
    : roundExchangeRate(exchangeRates[input.currency] || exchangeRates['USD']);
  const effectiveExchangeRate = input.currency === 'INR' ? rawExchangeRate : Math.round(rawExchangeRate * 1.02 * 100) / 100;

  // Clearance charge (hazardous if ANY product is hazardous)
  const anyHazardous = input.products.some(p => getDutyRates(p.hsnCode).isHazardous);
  const clearanceCharges = anyHazardous ? CLEARANCE_CHARGE_HAZARDOUS : CLEARANCE_CHARGE_DEFAULT;

  // Inland transport (one lookup based on total weight)
  let inlandTransport = 0;
  if (input.includeInlandDelivery && input.clearancePort && input.inlandZone) {
    try {
      const inlandResult = getInlandShippingCost(totalChargeableWeight, input.inlandZone, input.clearancePort);
      inlandTransport = inlandResult.totalINR;
    } catch {
      inlandTransport = 0;
    }
  }

  const numProducts = input.products.length;

  // Per-product calculations
  let totalFobINR = 0;
  let totalInsurance = 0;
  let totalCifValue = 0;
  let totalDuties = 0;
  let totalLandedCost = 0;
  let totalQuantity = 0;

  const productResults: ProductResult[] = input.products.map((p, i) => {
    const weights = productWeights[i];

    const fobValueINR = Math.round(p.fobValue * effectiveExchangeRate * 100) / 100;

    // Freight share proportional to chargeable weight
    const freightShare = totalChargeableWeight > 0
      ? Math.round((totalFreight * (weights.chargeableWeight / totalChargeableWeight)) * 100) / 100
      : Math.round((totalFreight / numProducts) * 100) / 100;

    const insurance = calculateInsurance(fobValueINR, freightShare);
    const cifValue = calculateCIF(fobValueINR, freightShare, insurance);

    // Duties
    const dutyRates = getDutyRates(p.hsnCode);
    const effectiveBcdRate = p.bcdRateOverride !== undefined && p.bcdRateOverride >= 0 ? p.bcdRateOverride : dutyRates.bcd;
    const effectiveIgstRate = p.igstRateOverride !== undefined && p.igstRateOverride >= 0 ? p.igstRateOverride : dutyRates.igst;

    const basicCustomsDuty = Math.round(cifValue * (effectiveBcdRate / 100) * 100) / 100;
    const sws = calculateSocialWelfareSurcharge(basicCustomsDuty);
    const igst = Math.round((cifValue + basicCustomsDuty + sws) * (effectiveIgstRate / 100) * 100) / 100;
    const productTotalDuties = basicCustomsDuty + sws + igst;

    // Shared cost splits
    const clearanceShare = Math.round((clearanceCharges / numProducts) * 100) / 100;
    const inlandShare = totalChargeableWeight > 0
      ? Math.round((inlandTransport * (weights.chargeableWeight / totalChargeableWeight)) * 100) / 100
      : Math.round((inlandTransport / numProducts) * 100) / 100;

    const productLandedCost = Math.round((cifValue + productTotalDuties + clearanceShare + inlandShare) * 100) / 100;
    const costPerUnit = p.quantity > 0 ? Math.round((productLandedCost / p.quantity) * 100) / 100 : productLandedCost;

    totalFobINR += fobValueINR;
    totalInsurance += insurance;
    totalCifValue += cifValue;
    totalDuties += productTotalDuties;
    totalLandedCost += productLandedCost;
    totalQuantity += p.quantity;

    return {
      productName: p.productName,
      hsnCode: p.hsnCode,
      quantity: p.quantity,
      ...weights,
      fobValueOriginal: p.fobValue,
      fobValueINR,
      freightShare,
      insurance,
      cifValue,
      bcdRate: effectiveBcdRate,
      basicCustomsDuty,
      socialWelfareSurcharge: sws,
      igstRate: effectiveIgstRate,
      igst,
      totalDuties: productTotalDuties,
      clearanceShare,
      inlandShare,
      totalLandedCost: productLandedCost,
      costPerUnit,
      totalLandedCostForeign: effectiveExchangeRate > 0 ? Math.round((productLandedCost / effectiveExchangeRate) * 100) / 100 : 0,
      costPerUnitForeign: effectiveExchangeRate > 0 ? Math.round((costPerUnit / effectiveExchangeRate) * 100) / 100 : 0,
    };
  });

  totalLandedCost = Math.round(totalLandedCost * 100) / 100;
  const totalAdditionalCharges = Math.round((clearanceCharges + inlandTransport) * 100) / 100;

  const fobPercent = totalLandedCost > 0 ? Math.round((totalFobINR / totalLandedCost) * 10000) / 100 : 0;
  const freightPercent = totalLandedCost > 0 ? Math.round(((totalFreight + totalInsurance) / totalLandedCost) * 10000) / 100 : 0;
  const dutiesPercent = totalLandedCost > 0 ? Math.round((totalDuties / totalLandedCost) * 10000) / 100 : 0;
  const additionalPercent = totalLandedCost > 0 ? Math.round((totalAdditionalCharges / totalLandedCost) * 10000) / 100 : 0;

  return {
    originCountry: countryInfo.name,
    originZone: zone,
    destinationCity: input.destinationCity || '',
    clearancePort: input.clearancePort || '',
    currency: input.currency,
    exchangeRate: effectiveExchangeRate,

    totalVolumetricWeight: Math.round(totalVolumetricWeight * 100) / 100,
    totalGrossWeight: Math.round(totalGrossWeight * 100) / 100,
    totalChargeableWeight,
    totalCbm: Math.round(totalCbm * 1000000) / 1000000,

    baseFreight: Math.round(baseFreight * 100) / 100,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    totalFreight,

    totalFobINR: Math.round(totalFobINR * 100) / 100,
    totalInsurance: Math.round(totalInsurance * 100) / 100,
    totalCifValue: Math.round(totalCifValue * 100) / 100,
    totalDuties: Math.round(totalDuties * 100) / 100,
    clearanceCharges,
    inlandTransport: Math.round(inlandTransport * 100) / 100,
    totalAdditionalCharges,
    totalLandedCost,
    totalQuantity,

    totalLandedCostForeign: effectiveExchangeRate > 0 ? Math.round((totalLandedCost / effectiveExchangeRate) * 100) / 100 : 0,

    fobPercent,
    freightPercent,
    dutiesPercent,
    additionalPercent,

    products: productResults,
    calculatedAt: new Date().toISOString(),
  };
}

// Re-export utilities
export { getAvailableCurrencies, getDutyRates };
export { getVolumetricWeight, getChargeableWeight };
export { importCountryZones };
export { exchangeRates };
export type { ClearancePort };
