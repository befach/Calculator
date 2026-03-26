// Landing Cost Orchestrator — Wires DHL Import rates + duties + inland shipping
// Does NOT modify any existing files — calls into existing modules

import {
  calculateInsurance,
  calculateCIF,
  calculateSocialWelfareSurcharge,
  getDutyRates,
  getAvailableCurrencies,
  exchangeRates,
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

  // 4. FOB conversion to INR (use override if provided)
  const exchangeRate = input.exchangeRateOverride && input.exchangeRateOverride > 0
    ? input.exchangeRateOverride
    : (exchangeRates[input.currency] || exchangeRates['USD']);
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

// Re-export utilities
export { getAvailableCurrencies, getDutyRates };
export { getVolumetricWeight, getChargeableWeight };
export { importCountryZones };
export { exchangeRates };
export type { ClearancePort };
