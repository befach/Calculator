import {
  calculateCIF,
  calculateInsurance,
  calculateSocialWelfareSurcharge,
  CLEARANCE_CHARGE_DEFAULT,
  CLEARANCE_CHARGE_HAZARDOUS,
  exchangeRates,
  getAvailableCurrencies,
  getDutyRates,
} from '@/core/calculatorUtils';
import { getChargeableWeight, getVolumetricWeight } from '@/core/dhlRates';
import { getInlandShippingCost, type ClearancePort } from '@/core/inlandRates';
import {
  findSeaLane,
  getSeaOriginCountry,
  quoteSeaFreight,
  SEA_DESTINATION_CLEARANCE_INR,
  type SeaIncoterm,
  type SeaShipmentPreference,
  type SeaShipmentMode,
} from '@/core/seaFreightRates';

export interface SeaProductInput {
  productName: string;
  hsnCode: string;
  bcdRateOverride?: number;
  igstRateOverride?: number;
  unitPrice: number;
  quantity: number;
  invoiceValue: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;
  dimensionMode?: 'box' | 'product';
}

export interface SeaMultiProductInput {
  incoterm: SeaIncoterm;
  shipmentPreference: SeaShipmentPreference;
  originCountry?: string;
  originPort?: string;
  destinationPort: string;
  currency: string;
  exchangeRateOverride?: number;
  products: SeaProductInput[];
  includeInlandDelivery: boolean;
  clearancePort?: ClearancePort;
  inlandZone?: 'A' | 'B' | 'C' | 'D' | 'E';
  destinationCity?: string;
}

export interface SeaProductResult {
  productName: string;
  hsnCode: string;
  quantity: number;
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  invoiceValueOriginal: number;
  invoiceValueINR: number;
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

export interface SeaMultiProductResult {
  incoterm: SeaIncoterm;
  originCountry: string;
  originPort: string;
  originZone: number | null;
  originRegion: string;
  destinationPort: string;
  destinationCity: string;
  clearancePort: string;
  currency: string;
  exchangeRate: number;
  shipmentMode: SeaShipmentMode | 'CIF';
  containerCount20: number;
  containerCount40: number;
  chargeableCbm: number;
  totalVolumetricWeight: number;
  totalGrossWeight: number;
  totalChargeableWeight: number;
  totalCbm: number;
  oceanFreightUSD: number;
  oceanFreightLowUSD: number;
  oceanFreightHighUSD: number;
  totalFreight: number;
  documentationCharges: number;
  cfsCharges: number;
  portAndClearanceCharges: number;
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
  deliveryEstimate: string;
  recommendation: string;
  products: SeaProductResult[];
  calculatedAt: string;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeProductWeights(product: SeaProductInput) {
  if (product.dimensionMode === 'product') {
    const volumetricWeight = getVolumetricWeight(product.lengthCm, product.widthCm, product.heightCm) * product.quantity;
    const grossWeight = product.actualWeightKg * product.quantity;
    const cbm = (product.lengthCm * product.widthCm * product.heightCm / 1_000_000) * product.quantity;
    return {
      volumetricWeight: round2(volumetricWeight),
      grossWeight: round2(grossWeight),
      chargeableWeight: getChargeableWeight(grossWeight, volumetricWeight),
      cbm: Math.round(cbm * 1_000_000) / 1_000_000,
    };
  }

  const volumetricWeight = getVolumetricWeight(product.lengthCm, product.widthCm, product.heightCm) * product.numPackages;
  const grossWeight = product.actualWeightKg * product.numPackages;
  const cbm = (product.lengthCm * product.widthCm * product.heightCm / 1_000_000) * product.numPackages;
  return {
    volumetricWeight: round2(volumetricWeight),
    grossWeight: round2(grossWeight),
    chargeableWeight: getChargeableWeight(grossWeight, volumetricWeight),
    cbm: Math.round(cbm * 1_000_000) / 1_000_000,
  };
}

export function calculateSeaMultiProductLandedCost(input: SeaMultiProductInput): SeaMultiProductResult {
  const rawExchangeRate = input.exchangeRateOverride && input.exchangeRateOverride > 0
    ? input.exchangeRateOverride
    : (exchangeRates[input.currency] || exchangeRates.USD);
  const exchangeRate = input.currency === 'INR' ? rawExchangeRate : round2(rawExchangeRate * 1.02);

  const productWeights = input.products.map(computeProductWeights);
  const totalCbm = productWeights.reduce((sum, weight) => sum + weight.cbm, 0);
  const totalGrossWeight = productWeights.reduce((sum, weight) => sum + weight.grossWeight, 0);
  const totalVolumetricWeight = productWeights.reduce((sum, weight) => sum + weight.volumetricWeight, 0);
  const totalChargeableWeight = productWeights.reduce((sum, weight) => sum + weight.chargeableWeight, 0);

  let originZone: number | null = null;
  let originCountry = input.originCountry || '';
  let originRegion = '';
  let oceanFreightUSD = 0;
  let oceanFreightLowUSD = 0;
  let oceanFreightHighUSD = 0;
  let totalFreight = 0;
  let documentationCharges = 0;
  let cfsCharges = 0;
  let portAndClearanceCharges = SEA_DESTINATION_CLEARANCE_INR;
  let shipmentMode: SeaMultiProductResult['shipmentMode'] = 'CIF';
  let containerCount20 = 0;
  let containerCount40 = 0;
  let chargeableCbm = Math.max(totalCbm, 1);
  let deliveryEstimate = 'Freight included in supplier CIF invoice';
  let recommendation = 'CIF selected: freight and insurance are already included in the supplier invoice value.';

  if (input.incoterm === 'FOB') {
    if (!input.originPort) {
      throw new Error('Please select an origin port');
    }
    const lane = findSeaLane(input.originPort, input.destinationPort);
    if (!lane) {
      throw new Error('No sea freight lane found for the selected ports');
    }
    const quote = quoteSeaFreight(lane, totalCbm, totalGrossWeight, input.shipmentPreference);
    originZone = lane.zone;
    originCountry = lane.originCountry || getSeaOriginCountry(lane.originPort);
    originRegion = lane.region;
    oceanFreightUSD = quote.oceanFreightUSD;
    oceanFreightLowUSD = quote.lowOceanFreightUSD;
    oceanFreightHighUSD = quote.highOceanFreightUSD;
    totalFreight = round2(quote.oceanFreightUSD * exchangeRate);
    documentationCharges = round2(quote.documentationUSD * exchangeRate);
    cfsCharges = quote.cfsChargesINR;
    portAndClearanceCharges = quote.destinationChargesINR;
    shipmentMode = quote.shipmentMode;
    containerCount20 = quote.containerCount20;
    containerCount40 = quote.containerCount40;
    chargeableCbm = quote.chargeableCbm;
    deliveryEstimate = quote.deliveryEstimate;
    recommendation = quote.recommendation;
  }

  const anyHazardous = input.products.some((product) => getDutyRates(product.hsnCode).isHazardous);
  const baseClearanceCharges = anyHazardous ? CLEARANCE_CHARGE_HAZARDOUS : CLEARANCE_CHARGE_DEFAULT;
  const clearanceCharges = portAndClearanceCharges + documentationCharges + cfsCharges + baseClearanceCharges;

  let inlandTransport = 0;
  if (input.includeInlandDelivery && input.clearancePort && input.inlandZone) {
    try {
      const inlandResult = getInlandShippingCost(totalGrossWeight, input.inlandZone, input.clearancePort);
      inlandTransport = inlandResult.totalINR;
    } catch {
      inlandTransport = 0;
    }
  }

  const totalInvoiceOriginal = input.products.reduce((sum, product) => sum + product.invoiceValue, 0);
  const numProducts = input.products.length;
  let totalFobINR = 0;
  let totalInsurance = 0;
  let totalCifValue = 0;
  let totalDuties = 0;
  let totalLandedCost = 0;
  let totalQuantity = 0;

  const products = input.products.map((product, index) => {
    const weights = productWeights[index];
    const invoiceValueINR = round2(product.invoiceValue * exchangeRate);
    const valueRatio = totalInvoiceOriginal > 0 ? product.invoiceValue / totalInvoiceOriginal : 1 / numProducts;
    const cbmRatio = totalCbm > 0 ? weights.cbm / totalCbm : valueRatio;
    const freightShare = input.incoterm === 'FOB' ? round2(totalFreight * cbmRatio) : 0;
    const insurance = input.incoterm === 'FOB' ? calculateInsurance(invoiceValueINR, freightShare) : 0;
    const cifValue = input.incoterm === 'FOB'
      ? calculateCIF(invoiceValueINR, freightShare, insurance)
      : invoiceValueINR;

    const dutyRates = getDutyRates(product.hsnCode);
    const bcdRate = product.bcdRateOverride !== undefined && product.bcdRateOverride >= 0
      ? product.bcdRateOverride
      : dutyRates.bcd;
    const igstRate = product.igstRateOverride !== undefined && product.igstRateOverride >= 0
      ? product.igstRateOverride
      : dutyRates.igst;

    const basicCustomsDuty = round2(cifValue * (bcdRate / 100));
    const socialWelfareSurcharge = calculateSocialWelfareSurcharge(basicCustomsDuty);
    const igst = round2((cifValue + basicCustomsDuty + socialWelfareSurcharge) * (igstRate / 100));
    const totalProductDuties = basicCustomsDuty + socialWelfareSurcharge + igst;
    const clearanceShare = round2(clearanceCharges * valueRatio);
    const inlandShare = round2(inlandTransport * cbmRatio);
    const totalProductLandedCost = round2(cifValue + totalProductDuties + clearanceShare + inlandShare);
    const costPerUnit = product.quantity > 0 ? round2(totalProductLandedCost / product.quantity) : totalProductLandedCost;

    totalFobINR += invoiceValueINR;
    totalInsurance += insurance;
    totalCifValue += cifValue;
    totalDuties += totalProductDuties;
    totalLandedCost += totalProductLandedCost;
    totalQuantity += product.quantity;

    return {
      productName: product.productName,
      hsnCode: product.hsnCode,
      quantity: product.quantity,
      ...weights,
      invoiceValueOriginal: product.invoiceValue,
      invoiceValueINR,
      freightShare,
      insurance,
      cifValue,
      bcdRate,
      basicCustomsDuty,
      socialWelfareSurcharge,
      igstRate,
      igst,
      totalDuties: totalProductDuties,
      clearanceShare,
      inlandShare,
      totalLandedCost: totalProductLandedCost,
      costPerUnit,
      totalLandedCostForeign: exchangeRate > 0 ? round2(totalProductLandedCost / exchangeRate) : 0,
      costPerUnitForeign: exchangeRate > 0 ? round2(costPerUnit / exchangeRate) : 0,
    };
  });

  totalFobINR = round2(totalFobINR);
  totalInsurance = round2(totalInsurance);
  totalCifValue = round2(totalCifValue);
  totalDuties = round2(totalDuties);
  totalLandedCost = round2(totalLandedCost);
  const totalAdditionalCharges = round2(clearanceCharges + inlandTransport);

  return {
    incoterm: input.incoterm,
    originCountry,
    originPort: input.originPort || '',
    originZone,
    originRegion,
    destinationPort: input.destinationPort,
    destinationCity: input.destinationCity || '',
    clearancePort: input.clearancePort || '',
    currency: input.currency,
    exchangeRate,
    shipmentMode,
    containerCount20,
    containerCount40,
    chargeableCbm: Math.round(chargeableCbm * 1000) / 1000,
    totalVolumetricWeight: round2(totalVolumetricWeight),
    totalGrossWeight: round2(totalGrossWeight),
    totalChargeableWeight: round2(totalChargeableWeight),
    totalCbm: Math.round(totalCbm * 1_000_000) / 1_000_000,
    oceanFreightUSD,
    oceanFreightLowUSD,
    oceanFreightHighUSD,
    totalFreight,
    documentationCharges,
    cfsCharges,
    portAndClearanceCharges,
    totalFobINR,
    totalInsurance,
    totalCifValue,
    totalDuties,
    clearanceCharges: round2(clearanceCharges),
    inlandTransport: round2(inlandTransport),
    totalAdditionalCharges,
    totalLandedCost,
    totalQuantity,
    totalLandedCostForeign: exchangeRate > 0 ? round2(totalLandedCost / exchangeRate) : 0,
    fobPercent: totalLandedCost > 0 ? round2((totalFobINR / totalLandedCost) * 100) : 0,
    freightPercent: totalLandedCost > 0 ? round2(((totalFreight + totalInsurance) / totalLandedCost) * 100) : 0,
    dutiesPercent: totalLandedCost > 0 ? round2((totalDuties / totalLandedCost) * 100) : 0,
    additionalPercent: totalLandedCost > 0 ? round2((totalAdditionalCharges / totalLandedCost) * 100) : 0,
    deliveryEstimate,
    recommendation,
    products,
    calculatedAt: new Date().toISOString(),
  };
}

export { exchangeRates, getAvailableCurrencies, getDutyRates };
export type { ClearancePort, SeaIncoterm };
