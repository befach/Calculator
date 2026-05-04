export type SeaIncoterm = 'FOB' | 'CIF';
export type SeaShipmentMode = 'LCL' | 'FCL_20' | 'FCL_40HQ' | 'MULTI_FCL';
export type SeaShipmentPreference = 'LCL' | 'FCL_20' | 'FCL_40HQ';

export interface SeaRateRange {
  min: number;
  max: number;
}

export interface SeaFreightLane {
  zone: 1 | 2 | 3 | 4;
  region: string;
  originCountry?: string;
  originPort: string;
  destinationPort: string;
  fcl20: SeaRateRange;
  fcl40hq: SeaRateRange;
  lclPerCbm: SeaRateRange;
  transitDays: SeaRateRange;
}

export interface SeaFreightQuote {
  lane: SeaFreightLane;
  shipmentMode: SeaShipmentMode;
  chargeableCbm: number;
  containerCount20: number;
  containerCount40: number;
  oceanFreightUSD: number;
  lowOceanFreightUSD: number;
  highOceanFreightUSD: number;
  destinationChargesINR: number;
  documentationUSD: number;
  cfsChargesINR: number;
  deliveryEstimate: string;
  recommendation: string;
}

export const SEA_DESTINATION_CLEARANCE_INR = 25000;
export const SEA_DOCUMENTATION_FEE_USD = 85;
export const SEA_LCL_DESTINATION_CFS_PER_CBM_INR = 475;
export const SEA_PRODUCT_DIMENSION_CBM_MULTIPLIER = 2.22;

/**
 * Calculates the raw product volume before sea packaging estimation.
 */
export function computeRawProductCbm(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  quantity: number
): number {
  if (![lengthCm, widthCm, heightCm, quantity].every(Number.isFinite)) {
    return 0;
  }

  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || quantity <= 0) {
    return 0;
  }

  const cbm = (lengthCm * widthCm * heightCm / 1_000_000) * quantity;
  return Number.isFinite(cbm) && cbm > 0 ? cbm : 0;
}

/**
 * Applies the fixed sea packaging multiplier used for product-dimension estimates.
 */
export function estimateSeaProductCbm(rawProductCbm: number): number {
  if (!Number.isFinite(rawProductCbm) || rawProductCbm <= 0) {
    return 0;
  }

  const cbm = Math.round(rawProductCbm * SEA_PRODUCT_DIMENSION_CBM_MULTIPLIER * 1_000_000) / 1_000_000;
  return Number.isFinite(cbm) && cbm > 0 ? cbm : 0;
}

export const SEA_CONTAINER_CAPACITY = {
  FCL_20: {
    label: 'FCL 20ft',
    recommendedCbm: 28,
    maxCbm: 33.2,
  },
  FCL_40HQ: {
    label: 'FCL 40ft',
    recommendedCbm: 58,
    maxCbm: 76.3,
  },
} as const;

const DESTINATION_THC_20_INR = 15000;
const DESTINATION_THC_40_INR = 22000;

export const seaFreightLanes: SeaFreightLane[] = [
  { zone: 1, region: 'China & East Asia', originCountry: 'China', originPort: 'Shanghai', destinationPort: 'Nhava Sheva', fcl20: { min: 1200, max: 1800 }, fcl40hq: { min: 1800, max: 2800 }, lclPerCbm: { min: 50, max: 110 }, transitDays: { min: 16, max: 22 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Shanghai', destinationPort: 'Mundra', fcl20: { min: 1150, max: 1750 }, fcl40hq: { min: 1750, max: 2700 }, lclPerCbm: { min: 50, max: 110 }, transitDays: { min: 15, max: 21 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Shanghai', destinationPort: 'Chennai', fcl20: { min: 1400, max: 2000 }, fcl40hq: { min: 2100, max: 3000 }, lclPerCbm: { min: 60, max: 120 }, transitDays: { min: 16, max: 24 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Shenzhen (Yantian)', destinationPort: 'Nhava Sheva', fcl20: { min: 1100, max: 1700 }, fcl40hq: { min: 1700, max: 2600 }, lclPerCbm: { min: 45, max: 100 }, transitDays: { min: 14, max: 20 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Shenzhen (Shekou)', destinationPort: 'Nhava Sheva', fcl20: { min: 1150, max: 1800 }, fcl40hq: { min: 1800, max: 2700 }, lclPerCbm: { min: 50, max: 105 }, transitDays: { min: 14, max: 20 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Shenzhen (Yantian)', destinationPort: 'Chennai', fcl20: { min: 1300, max: 1900 }, fcl40hq: { min: 1900, max: 2800 }, lclPerCbm: { min: 55, max: 115 }, transitDays: { min: 13, max: 19 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Ningbo', destinationPort: 'Nhava Sheva', fcl20: { min: 1200, max: 1800 }, fcl40hq: { min: 1800, max: 2700 }, lclPerCbm: { min: 50, max: 110 }, transitDays: { min: 16, max: 22 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Qingdao', destinationPort: 'Nhava Sheva', fcl20: { min: 1300, max: 1900 }, fcl40hq: { min: 1900, max: 2800 }, lclPerCbm: { min: 55, max: 115 }, transitDays: { min: 20, max: 26 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Qingdao', destinationPort: 'Mundra', fcl20: { min: 1250, max: 1850 }, fcl40hq: { min: 1850, max: 2750 }, lclPerCbm: { min: 55, max: 115 }, transitDays: { min: 19, max: 25 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Xiamen', destinationPort: 'Nhava Sheva', fcl20: { min: 1250, max: 1850 }, fcl40hq: { min: 1850, max: 2800 }, lclPerCbm: { min: 55, max: 115 }, transitDays: { min: 16, max: 22 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Guangzhou (Nansha)', destinationPort: 'Nhava Sheva', fcl20: { min: 1150, max: 1750 }, fcl40hq: { min: 1750, max: 2650 }, lclPerCbm: { min: 50, max: 105 }, transitDays: { min: 14, max: 20 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Tianjin', destinationPort: 'Nhava Sheva', fcl20: { min: 1400, max: 2000 }, fcl40hq: { min: 2000, max: 3000 }, lclPerCbm: { min: 60, max: 120 }, transitDays: { min: 22, max: 28 } },
  { zone: 1, region: 'China & East Asia', originPort: 'Hong Kong', destinationPort: 'Nhava Sheva', fcl20: { min: 1300, max: 1900 }, fcl40hq: { min: 1900, max: 2800 }, lclPerCbm: { min: 55, max: 115 }, transitDays: { min: 16, max: 22 } },

  { zone: 2, region: 'Europe & Africa', originPort: 'Hamburg, Germany', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2800 }, fcl40hq: { min: 2800, max: 4200 }, lclPerCbm: { min: 80, max: 150 }, transitDays: { min: 22, max: 32 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Rotterdam, NL', destinationPort: 'Nhava Sheva', fcl20: { min: 1750, max: 2750 }, fcl40hq: { min: 2750, max: 4100 }, lclPerCbm: { min: 75, max: 145 }, transitDays: { min: 22, max: 32 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Antwerp, Belgium', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2800 }, fcl40hq: { min: 2800, max: 4200 }, lclPerCbm: { min: 80, max: 150 }, transitDays: { min: 23, max: 33 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Felixstowe, UK', destinationPort: 'Nhava Sheva', fcl20: { min: 1900, max: 2900 }, fcl40hq: { min: 2900, max: 4400 }, lclPerCbm: { min: 85, max: 160 }, transitDays: { min: 24, max: 34 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Le Havre, France', destinationPort: 'Nhava Sheva', fcl20: { min: 1850, max: 2850 }, fcl40hq: { min: 2850, max: 4300 }, lclPerCbm: { min: 80, max: 155 }, transitDays: { min: 23, max: 33 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Genoa, Italy', destinationPort: 'Nhava Sheva', fcl20: { min: 1500, max: 2400 }, fcl40hq: { min: 2400, max: 3600 }, lclPerCbm: { min: 70, max: 130 }, transitDays: { min: 16, max: 24 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Barcelona, Spain', destinationPort: 'Nhava Sheva', fcl20: { min: 1500, max: 2400 }, fcl40hq: { min: 2400, max: 3600 }, lclPerCbm: { min: 70, max: 130 }, transitDays: { min: 16, max: 24 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Valencia, Spain', destinationPort: 'Nhava Sheva', fcl20: { min: 1500, max: 2400 }, fcl40hq: { min: 2400, max: 3600 }, lclPerCbm: { min: 70, max: 130 }, transitDays: { min: 16, max: 24 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Piraeus, Greece', destinationPort: 'Nhava Sheva', fcl20: { min: 1400, max: 2300 }, fcl40hq: { min: 2300, max: 3500 }, lclPerCbm: { min: 65, max: 125 }, transitDays: { min: 14, max: 22 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Hamburg, Germany', destinationPort: 'Chennai', fcl20: { min: 2000, max: 3000 }, fcl40hq: { min: 3000, max: 4500 }, lclPerCbm: { min: 85, max: 160 }, transitDays: { min: 26, max: 36 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Durban, S. Africa', destinationPort: 'Nhava Sheva', fcl20: { min: 1400, max: 2200 }, fcl40hq: { min: 2200, max: 3400 }, lclPerCbm: { min: 70, max: 130 }, transitDays: { min: 18, max: 28 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Cape Town, S. Africa', destinationPort: 'Nhava Sheva', fcl20: { min: 1500, max: 2300 }, fcl40hq: { min: 2300, max: 3500 }, lclPerCbm: { min: 75, max: 135 }, transitDays: { min: 20, max: 30 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Mombasa, Kenya', destinationPort: 'Nhava Sheva', fcl20: { min: 1200, max: 2000 }, fcl40hq: { min: 2000, max: 3000 }, lclPerCbm: { min: 60, max: 115 }, transitDays: { min: 12, max: 18 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Dar es Salaam, TZ', destinationPort: 'Nhava Sheva', fcl20: { min: 1300, max: 2100 }, fcl40hq: { min: 2100, max: 3100 }, lclPerCbm: { min: 65, max: 120 }, transitDays: { min: 13, max: 19 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Lagos, Nigeria', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2800 }, fcl40hq: { min: 2800, max: 4200 }, lclPerCbm: { min: 85, max: 155 }, transitDays: { min: 28, max: 38 } },
  { zone: 2, region: 'Europe & Africa', originPort: 'Casablanca, Morocco', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2700 }, fcl40hq: { min: 2700, max: 4000 }, lclPerCbm: { min: 80, max: 150 }, transitDays: { min: 24, max: 32 } },

  { zone: 3, region: 'USA', originPort: 'Los Angeles (USWC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2500, max: 3800 }, fcl40hq: { min: 3800, max: 5500 }, lclPerCbm: { min: 110, max: 200 }, transitDays: { min: 30, max: 40 } },
  { zone: 3, region: 'USA', originPort: 'Long Beach (USWC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2500, max: 3800 }, fcl40hq: { min: 3800, max: 5500 }, lclPerCbm: { min: 110, max: 200 }, transitDays: { min: 30, max: 40 } },
  { zone: 3, region: 'USA', originPort: 'Oakland (USWC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2600, max: 3900 }, fcl40hq: { min: 3900, max: 5600 }, lclPerCbm: { min: 115, max: 205 }, transitDays: { min: 32, max: 42 } },
  { zone: 3, region: 'USA', originPort: 'Seattle (USWC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2700, max: 4000 }, fcl40hq: { min: 4000, max: 5800 }, lclPerCbm: { min: 120, max: 210 }, transitDays: { min: 33, max: 43 } },
  { zone: 3, region: 'USA', originPort: 'New York (USEC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2200, max: 3400 }, fcl40hq: { min: 3400, max: 5000 }, lclPerCbm: { min: 100, max: 185 }, transitDays: { min: 28, max: 38 } },
  { zone: 3, region: 'USA', originPort: 'Savannah (USEC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2300, max: 3500 }, fcl40hq: { min: 3500, max: 5100 }, lclPerCbm: { min: 105, max: 190 }, transitDays: { min: 29, max: 39 } },
  { zone: 3, region: 'USA', originPort: 'Houston (USGC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2400, max: 3600 }, fcl40hq: { min: 3600, max: 5200 }, lclPerCbm: { min: 110, max: 195 }, transitDays: { min: 32, max: 42 } },
  { zone: 3, region: 'USA', originPort: 'Charleston (USEC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2300, max: 3500 }, fcl40hq: { min: 3500, max: 5100 }, lclPerCbm: { min: 105, max: 190 }, transitDays: { min: 29, max: 39 } },
  { zone: 3, region: 'USA', originPort: 'Norfolk (USEC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2250, max: 3450 }, fcl40hq: { min: 3450, max: 5050 }, lclPerCbm: { min: 100, max: 185 }, transitDays: { min: 28, max: 38 } },
  { zone: 3, region: 'USA', originPort: 'Miami (USEC)', destinationPort: 'Nhava Sheva', fcl20: { min: 2400, max: 3600 }, fcl40hq: { min: 3600, max: 5200 }, lclPerCbm: { min: 110, max: 195 }, transitDays: { min: 32, max: 42 } },
  { zone: 3, region: 'USA', originPort: 'Los Angeles (USWC)', destinationPort: 'Chennai', fcl20: { min: 2700, max: 4100 }, fcl40hq: { min: 4100, max: 5900 }, lclPerCbm: { min: 120, max: 215 }, transitDays: { min: 32, max: 42 } },
  { zone: 3, region: 'USA', originPort: 'New York (USEC)', destinationPort: 'Chennai', fcl20: { min: 2400, max: 3700 }, fcl40hq: { min: 3700, max: 5300 }, lclPerCbm: { min: 110, max: 200 }, transitDays: { min: 30, max: 40 } },

  { zone: 4, region: 'Australia & Oceania', originPort: 'Sydney', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2800 }, fcl40hq: { min: 2800, max: 4200 }, lclPerCbm: { min: 85, max: 160 }, transitDays: { min: 22, max: 30 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Melbourne', destinationPort: 'Nhava Sheva', fcl20: { min: 1800, max: 2800 }, fcl40hq: { min: 2800, max: 4200 }, lclPerCbm: { min: 85, max: 160 }, transitDays: { min: 22, max: 30 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Brisbane', destinationPort: 'Nhava Sheva', fcl20: { min: 1750, max: 2750 }, fcl40hq: { min: 2750, max: 4150 }, lclPerCbm: { min: 80, max: 155 }, transitDays: { min: 20, max: 28 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Adelaide', destinationPort: 'Nhava Sheva', fcl20: { min: 1900, max: 2900 }, fcl40hq: { min: 2900, max: 4300 }, lclPerCbm: { min: 90, max: 165 }, transitDays: { min: 24, max: 32 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Fremantle (Perth)', destinationPort: 'Nhava Sheva', fcl20: { min: 1500, max: 2400 }, fcl40hq: { min: 2400, max: 3600 }, lclPerCbm: { min: 75, max: 140 }, transitDays: { min: 16, max: 24 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Sydney', destinationPort: 'Chennai', fcl20: { min: 2000, max: 3000 }, fcl40hq: { min: 3000, max: 4500 }, lclPerCbm: { min: 95, max: 170 }, transitDays: { min: 24, max: 32 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Melbourne', destinationPort: 'Chennai', fcl20: { min: 2000, max: 3000 }, fcl40hq: { min: 3000, max: 4500 }, lclPerCbm: { min: 95, max: 170 }, transitDays: { min: 24, max: 32 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Auckland, NZ', destinationPort: 'Nhava Sheva', fcl20: { min: 2100, max: 3100 }, fcl40hq: { min: 3100, max: 4600 }, lclPerCbm: { min: 100, max: 180 }, transitDays: { min: 25, max: 33 } },
  { zone: 4, region: 'Australia & Oceania', originPort: 'Wellington, NZ', destinationPort: 'Nhava Sheva', fcl20: { min: 2150, max: 3150 }, fcl40hq: { min: 3150, max: 4650 }, lclPerCbm: { min: 100, max: 180 }, transitDays: { min: 26, max: 34 } },
];

export const seaZones = [
  { zone: 1, label: 'Zone 1', region: 'China & East Asia' },
  { zone: 2, label: 'Zone 2', region: 'Europe & Africa' },
  { zone: 3, label: 'Zone 3', region: 'USA' },
  { zone: 4, label: 'Zone 4', region: 'Australia & Oceania' },
] as const;

export const indianSeaPorts = [
  'Nhava Sheva',
  'Mundra',
  'Chennai',
  'Cochin',
  'Visakhapatnam',
  'Kolkata',
  'Kattupalli',
  'Tuticorin',
  'Hazira',
  'Pipavav',
] as const;

const originCountryByPort: Record<string, string> = {
  Shanghai: 'China',
  'Shenzhen (Yantian)': 'China',
  'Shenzhen (Shekou)': 'China',
  Ningbo: 'China',
  Qingdao: 'China',
  Xiamen: 'China',
  'Guangzhou (Nansha)': 'China',
  Tianjin: 'China',
  'Hong Kong': 'Hong Kong',
  'Hamburg, Germany': 'Germany',
  'Rotterdam, NL': 'Netherlands',
  'Antwerp, Belgium': 'Belgium',
  'Felixstowe, UK': 'United Kingdom',
  'Le Havre, France': 'France',
  'Genoa, Italy': 'Italy',
  'Barcelona, Spain': 'Spain',
  'Valencia, Spain': 'Spain',
  'Piraeus, Greece': 'Greece',
  'Durban, S. Africa': 'South Africa',
  'Cape Town, S. Africa': 'South Africa',
  'Mombasa, Kenya': 'Kenya',
  'Dar es Salaam, TZ': 'Tanzania',
  'Lagos, Nigeria': 'Nigeria',
  'Casablanca, Morocco': 'Morocco',
  'Los Angeles (USWC)': 'United States',
  'Long Beach (USWC)': 'United States',
  'Oakland (USWC)': 'United States',
  'Seattle (USWC)': 'United States',
  'New York (USEC)': 'United States',
  'Savannah (USEC)': 'United States',
  'Houston (USGC)': 'United States',
  'Charleston (USEC)': 'United States',
  'Norfolk (USEC)': 'United States',
  'Miami (USEC)': 'United States',
  Sydney: 'Australia',
  Melbourne: 'Australia',
  Brisbane: 'Australia',
  Adelaide: 'Australia',
  'Fremantle (Perth)': 'Australia',
  'Auckland, NZ': 'New Zealand',
  'Wellington, NZ': 'New Zealand',
};

export function getSeaOriginCountry(originPort: string): string {
  return originCountryByPort[originPort] || '';
}

function midpoint(range: SeaRateRange): number {
  return (range.min + range.max) / 2;
}

export function getSeaOriginPorts(zone?: number): string[] {
  const ports = seaFreightLanes
    .filter((lane) => !zone || lane.zone === zone)
    .map((lane) => lane.originPort);
  return Array.from(new Set(ports)).sort();
}

export function getSeaOriginCountries(): string[] {
  const countries = seaFreightLanes.map((lane) => lane.originCountry || getSeaOriginCountry(lane.originPort));
  return Array.from(new Set(countries.filter(Boolean))).sort();
}

export function getSeaOriginPortsByCountry(country?: string): string[] {
  const ports = seaFreightLanes
    .filter((lane) => !country || (lane.originCountry || getSeaOriginCountry(lane.originPort)) === country)
    .map((lane) => lane.originPort);
  return Array.from(new Set(ports)).sort();
}

export function getSeaDestinationPorts(originPort?: string): string[] {
  return [...indianSeaPorts].sort();
}

export function findSeaLane(originPort: string, destinationPort: string): SeaFreightLane | undefined {
  const exactLane = seaFreightLanes.find(
    (lane) => lane.originPort === originPort && lane.destinationPort === destinationPort
  );
  if (exactLane) return exactLane;

  return seaFreightLanes.find((lane) => lane.originPort === originPort);
}

export function quoteSeaFreight(
  lane: SeaFreightLane,
  totalCbm: number,
  _totalGrossWeightKg: number,
  preference: SeaShipmentPreference = 'LCL'
): SeaFreightQuote {
  const chargeableCbm = Math.max(totalCbm, 1);
  const lclMid = chargeableCbm * midpoint(lane.lclPerCbm);
  const lclLow = chargeableCbm * lane.lclPerCbm.min;
  const lclHigh = chargeableCbm * lane.lclPerCbm.max;

  let shipmentMode: SeaShipmentMode = 'LCL';
  let oceanFreightUSD = lclMid;
  let lowOceanFreightUSD = lclLow;
  let highOceanFreightUSD = lclHigh;
  let containerCount20 = 0;
  let containerCount40 = 0;
  let destinationChargesINR = SEA_DESTINATION_CLEARANCE_INR;
  let cfsChargesINR = Math.round(chargeableCbm * SEA_LCL_DESTINATION_CFS_PER_CBM_INR);
  let recommendation = 'Sea LCL is selected because volume is below the full-container crossover.';

  if (preference === 'LCL') {
    recommendation = 'LCL selected by user.';
  } else if (preference === 'FCL_20') {
    shipmentMode = 'FCL_20';
    oceanFreightUSD = midpoint(lane.fcl20);
    lowOceanFreightUSD = lane.fcl20.min;
    highOceanFreightUSD = lane.fcl20.max;
    containerCount20 = 1;
    destinationChargesINR += DESTINATION_THC_20_INR;
    cfsChargesINR = 0;
    recommendation = '20ft FCL selected by user.';
  } else if (preference === 'FCL_40HQ') {
    shipmentMode = 'FCL_40HQ';
    oceanFreightUSD = midpoint(lane.fcl40hq);
    lowOceanFreightUSD = lane.fcl40hq.min;
    highOceanFreightUSD = lane.fcl40hq.max;
    containerCount40 = 1;
    destinationChargesINR += DESTINATION_THC_40_INR;
    cfsChargesINR = 0;
    recommendation = '40ft HQ FCL selected by user.';
  } else if (chargeableCbm >= 13 && chargeableCbm < 15) {
    const fcl20Mid = midpoint(lane.fcl20);
    if (fcl20Mid < lclMid) {
      shipmentMode = 'FCL_20';
      oceanFreightUSD = fcl20Mid;
      lowOceanFreightUSD = lane.fcl20.min;
      highOceanFreightUSD = lane.fcl20.max;
      containerCount20 = 1;
      destinationChargesINR += DESTINATION_THC_20_INR;
      cfsChargesINR = 0;
      recommendation = '20ft FCL is cheaper than LCL at this crossover volume.';
    } else {
      recommendation = 'LCL remains cheaper than 20ft FCL at this crossover volume.';
    }
  } else if (chargeableCbm >= 15 && chargeableCbm <= 28) {
    shipmentMode = 'FCL_20';
    oceanFreightUSD = midpoint(lane.fcl20);
    lowOceanFreightUSD = lane.fcl20.min;
    highOceanFreightUSD = lane.fcl20.max;
    containerCount20 = 1;
    destinationChargesINR += DESTINATION_THC_20_INR;
    cfsChargesINR = 0;
    recommendation = '20ft FCL is selected for this volume band.';
  } else if (chargeableCbm > 28 && chargeableCbm <= 58) {
    shipmentMode = 'FCL_40HQ';
    oceanFreightUSD = midpoint(lane.fcl40hq);
    lowOceanFreightUSD = lane.fcl40hq.min;
    highOceanFreightUSD = lane.fcl40hq.max;
    containerCount40 = 1;
    destinationChargesINR += DESTINATION_THC_40_INR;
    cfsChargesINR = 0;
    recommendation = '40ft HQ FCL is selected for this volume band.';
  } else if (chargeableCbm > 58) {
    shipmentMode = 'MULTI_FCL';
    containerCount40 = Math.floor(chargeableCbm / 58);
    const remainingCbm = chargeableCbm - containerCount40 * 58;
    if (remainingCbm > 28) {
      containerCount40 += 1;
    } else if (remainingCbm > 0) {
      containerCount20 = 1;
    }
    oceanFreightUSD = containerCount40 * midpoint(lane.fcl40hq) + containerCount20 * midpoint(lane.fcl20);
    lowOceanFreightUSD = containerCount40 * lane.fcl40hq.min + containerCount20 * lane.fcl20.min;
    highOceanFreightUSD = containerCount40 * lane.fcl40hq.max + containerCount20 * lane.fcl20.max;
    destinationChargesINR += containerCount40 * DESTINATION_THC_40_INR + containerCount20 * DESTINATION_THC_20_INR;
    cfsChargesINR = 0;
    recommendation = 'Multiple FCL containers are selected because volume is above one 40ft HQ usable capacity.';
  } else if (chargeableCbm < 2) {
    recommendation = 'Sea LCL is estimated, but shipments below 2 CBM should be compared with air or express.';
  }

  return {
    lane,
    shipmentMode,
    chargeableCbm: Math.round(chargeableCbm * 1000) / 1000,
    containerCount20,
    containerCount40,
    oceanFreightUSD: Math.round(oceanFreightUSD * 100) / 100,
    lowOceanFreightUSD: Math.round(lowOceanFreightUSD * 100) / 100,
    highOceanFreightUSD: Math.round(highOceanFreightUSD * 100) / 100,
    destinationChargesINR,
    documentationUSD: SEA_DOCUMENTATION_FEE_USD,
    cfsChargesINR,
    deliveryEstimate: `${lane.transitDays.min}-${lane.transitDays.max} days port-to-port`,
    recommendation,
  };
}
