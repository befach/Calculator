// Sea Freight Landed Cost Orchestrator — Wires sea freight rates + duties + inland shipping

import {
  calculateInsurance,
  calculateCIF,
  calculateSocialWelfareSurcharge,
  getDutyRates,
  getAvailableCurrencies,
  exchangeRates,
} from '@/core/calculatorUtils';

import {
  getInlandShippingCost,
  type ClearancePort,
} from '@/core/inlandRates';

import {
  type ShippingMode,
  type ContainerType,
  type SeaPort,
  type TradeRoute,
  CONTAINER_SPECS,
  SEA_PORTS,
  SEA_PORT_TO_CLEARANCE_PORT,
  SEA_CLEARANCE_CHARGE_DEFAULT,
  SEA_CLEARANCE_CHARGE_HAZARDOUS,
  TRANSIT_ESTIMATES,
  LCL_MINIMUM_CBM,
  getTradeRoute,
  getOceanFreightUSD,
  getThcOriginUSD,
  getThcDestinationINR,
  getDoChargesINR,
  getCfsChargesINR,
  getDemurrageINR,
  getDetentionINR,
  BL_FEE_INR,
  CUSTOMS_EXAMINATION_INR,
} from '@/core/seaFreightRates';

import { importCountryZones } from '@/core/dhlImportRates';

// ─── Types ──────────────────────────────────────────────────────────────

export interface SeaFreightProductInput {
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
}

export interface SeaFreightInput {
  originCountryCode: string;
  currency: string;
  exchangeRateOverride?: number;

  shippingMode: ShippingMode;
  containerType?: ContainerType;
  numberOfContainers?: number;
  destinationSeaPort: SeaPort;

  products: SeaFreightProductInput[];

  // User-overridable freight cost (INR)
  userFreightCostINR?: number;

  // User-overridable port charges (INR)
  thcOriginOverride?: number;
  thcDestinationOverride?: number;
  blFeeOverride?: number;
  doChargesOverride?: number;
  cfsChargesOverride?: number;
  customExaminationOverride?: number;
  demurrageDays?: number;
  detentionDays?: number;

  // Inland delivery
  includeInlandDelivery: boolean;
  destinationCity?: string;
  clearancePort?: ClearancePort;
  inlandZone?: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface SeaProductResult {
  productName: string;
  hsnCode: string;
  quantity: number;

  grossWeight: number;
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

export interface SeaFreightResult {
  originCountry: string;
  destinationSeaPort: string;
  destinationCity: string;
  clearancePort: string;
  currency: string;
  exchangeRate: number;

  shippingMode: ShippingMode;
  containerType?: ContainerType;
  numberOfContainers?: number;
  tradeRoute: TradeRoute;

  totalGrossWeight: number;
  totalCbm: number;
  containerUtilizationPercent?: number;
  weightUtilizationPercent?: number;

  oceanFreight: number;
  thcOrigin: number;
  thcDestination: number;
  blFee: number;
  doCharges: number;
  cfsCharges: number;
  customExamination: number;
  demurrage: number;
  detention: number;
  totalFreightAndCharges: number;

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

  isUserFreight: boolean;
  deliveryEstimate: string;

  products: SeaProductResult[];
  calculatedAt: string;
}

// ─── Main calculation function ──────────────────────────────────────────

export function calculateSeaFreightLandedCost(input: SeaFreightInput): SeaFreightResult {
  // Resolve origin country
  const countryInfo = importCountryZones[input.originCountryCode];
  if (!countryInfo) throw new Error(`Unknown origin country code: ${input.originCountryCode}`);

  const tradeRoute = getTradeRoute(input.originCountryCode);

  // Per-product weight/CBM calculations
  const productMetrics = input.products.map(p => {
    const gross = p.actualWeightKg * p.numPackages;
    const cbm = (p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.numPackages;
    return {
      grossWeight: Math.round(gross * 100) / 100,
      cbm: Math.round(cbm * 1000000) / 1000000,
    };
  });

  const totalGrossWeight = productMetrics.reduce((s, w) => s + w.grossWeight, 0);
  const totalCbm = productMetrics.reduce((s, w) => s + w.cbm, 0);

  // Container utilization (FCL only)
  let containerUtilizationPercent: number | undefined;
  let weightUtilizationPercent: number | undefined;
  if (input.shippingMode === 'FCL' && input.containerType) {
    const spec = CONTAINER_SPECS[input.containerType];
    const totalContainerCbm = spec.maxCbm * (input.numberOfContainers || 1);
    const totalContainerWeight = spec.maxPayloadKg * (input.numberOfContainers || 1);
    containerUtilizationPercent = Math.round((totalCbm / totalContainerCbm) * 10000) / 100;
    weightUtilizationPercent = Math.round((totalGrossWeight / totalContainerWeight) * 10000) / 100;
  }

  // Exchange rate (+2% bank charges for non-INR)
  const rawExchangeRate = input.exchangeRateOverride && input.exchangeRateOverride > 0
    ? input.exchangeRateOverride
    : (exchangeRates[input.currency] || exchangeRates['USD']);
  const effectiveExchangeRate = input.currency === 'INR'
    ? rawExchangeRate
    : Math.round(rawExchangeRate * 1.02 * 100) / 100;

  // USD to INR for freight conversion
  const usdRate = exchangeRates['USD'] || 83;
  const usdToInr = Math.round(usdRate * 1.02 * 100) / 100;

  // Ocean Freight
  const isUserFreight = !!(input.userFreightCostINR && input.userFreightCostINR > 0);
  let oceanFreight: number;
  if (isUserFreight) {
    oceanFreight = Math.round(input.userFreightCostINR! * 100) / 100;
  } else {
    const freightUSD = getOceanFreightUSD(
      input.shippingMode,
      tradeRoute,
      input.containerType,
      input.numberOfContainers,
      totalCbm,
    );
    oceanFreight = Math.round(freightUSD * usdToInr * 100) / 100;
  }

  // Port & Terminal Charges
  const thcOrigin = input.thcOriginOverride !== undefined && input.thcOriginOverride >= 0
    ? input.thcOriginOverride
    : Math.round(getThcOriginUSD(input.shippingMode, input.containerType, totalCbm) * usdToInr * 100) / 100;

  const thcDestination = input.thcDestinationOverride !== undefined && input.thcDestinationOverride >= 0
    ? input.thcDestinationOverride
    : getThcDestinationINR(input.shippingMode, input.containerType, totalCbm);

  const blFee = input.blFeeOverride !== undefined && input.blFeeOverride >= 0
    ? input.blFeeOverride
    : BL_FEE_INR;

  const doCharges = input.doChargesOverride !== undefined && input.doChargesOverride >= 0
    ? input.doChargesOverride
    : getDoChargesINR(input.shippingMode);

  const cfsCharges = input.shippingMode === 'LCL'
    ? (input.cfsChargesOverride !== undefined && input.cfsChargesOverride >= 0
      ? input.cfsChargesOverride
      : getCfsChargesINR(totalCbm))
    : 0;

  const customExamination = input.customExaminationOverride !== undefined && input.customExaminationOverride >= 0
    ? input.customExaminationOverride
    : CUSTOMS_EXAMINATION_INR;

  const demurrage = input.shippingMode === 'FCL' && input.demurrageDays && input.demurrageDays > 0 && input.containerType
    ? getDemurrageINR(input.containerType, input.demurrageDays, input.numberOfContainers || 1)
    : 0;

  const detention = input.shippingMode === 'FCL' && input.detentionDays && input.detentionDays > 0 && input.containerType
    ? getDetentionINR(input.containerType, input.detentionDays, input.numberOfContainers || 1)
    : 0;

  const totalFreightAndCharges = Math.round(
    (oceanFreight + thcOrigin + thcDestination + blFee + doCharges + cfsCharges + customExamination + demurrage + detention) * 100
  ) / 100;

  // Clearance charges
  const anyHazardous = input.products.some(p => getDutyRates(p.hsnCode).isHazardous);
  const clearanceCharges = anyHazardous ? SEA_CLEARANCE_CHARGE_HAZARDOUS : SEA_CLEARANCE_CHARGE_DEFAULT;

  // Inland transport
  let inlandTransport = 0;
  const effectiveClearancePort = input.clearancePort || SEA_PORT_TO_CLEARANCE_PORT[input.destinationSeaPort];
  if (input.includeInlandDelivery && effectiveClearancePort && input.inlandZone) {
    try {
      const inlandResult = getInlandShippingCost(
        totalGrossWeight, // sea uses gross weight, not volumetric
        input.inlandZone,
        effectiveClearancePort,
      );
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

  const productResults: SeaProductResult[] = input.products.map((p, i) => {
    const metrics = productMetrics[i];

    const fobValueINR = Math.round(p.fobValue * effectiveExchangeRate * 100) / 100;

    // Freight share proportional to CBM (sea freight is volume-based)
    const freightShare = totalCbm > 0
      ? Math.round((totalFreightAndCharges * (metrics.cbm / totalCbm)) * 100) / 100
      : Math.round((totalFreightAndCharges / numProducts) * 100) / 100;

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
    const inlandShare = totalCbm > 0
      ? Math.round((inlandTransport * (metrics.cbm / totalCbm)) * 100) / 100
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
      ...metrics,
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
  const freightPercent = totalLandedCost > 0 ? Math.round(((totalFreightAndCharges + totalInsurance) / totalLandedCost) * 10000) / 100 : 0;
  const dutiesPercent = totalLandedCost > 0 ? Math.round((totalDuties / totalLandedCost) * 10000) / 100 : 0;
  const additionalPercent = totalLandedCost > 0 ? Math.round((totalAdditionalCharges / totalLandedCost) * 10000) / 100 : 0;

  const deliveryEstimate = isUserFreight ? '15\u201345 days' : TRANSIT_ESTIMATES[tradeRoute];

  return {
    originCountry: countryInfo.name,
    destinationSeaPort: input.destinationSeaPort,
    destinationCity: input.destinationCity || '',
    clearancePort: effectiveClearancePort || '',
    currency: input.currency,
    exchangeRate: effectiveExchangeRate,

    shippingMode: input.shippingMode,
    containerType: input.containerType,
    numberOfContainers: input.numberOfContainers,
    tradeRoute,

    totalGrossWeight: Math.round(totalGrossWeight * 100) / 100,
    totalCbm: Math.round(totalCbm * 1000000) / 1000000,
    containerUtilizationPercent,
    weightUtilizationPercent,

    oceanFreight: Math.round(oceanFreight * 100) / 100,
    thcOrigin: Math.round(thcOrigin * 100) / 100,
    thcDestination: Math.round(thcDestination * 100) / 100,
    blFee,
    doCharges,
    cfsCharges: Math.round(cfsCharges * 100) / 100,
    customExamination,
    demurrage,
    detention,
    totalFreightAndCharges,

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

    isUserFreight,
    deliveryEstimate,

    products: productResults,
    calculatedAt: new Date().toISOString(),
  };
}

// Re-export utilities
export { getAvailableCurrencies, getDutyRates };
export { importCountryZones };
export { exchangeRates };
export type { ClearancePort, ShippingMode, ContainerType, SeaPort, TradeRoute };
export { CONTAINER_SPECS, SEA_PORTS, SEA_PORT_TO_CLEARANCE_PORT, LCL_MINIMUM_CBM };
