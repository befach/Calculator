// Sea Freight Import Rate Data — Container/LCL rates to India
// All INR rates unless noted, USD rates will be converted at runtime

import { type ClearancePort } from './inlandRates';

// ─── Types ────────────────────────────────────────────────────────────

export type ShippingMode = 'FCL' | 'LCL';

export type ContainerType = '20ft' | '40ft' | '40ftHC' | '20ftReefer' | '40ftReeferHC';

export type SeaPort =
  | 'JNPT'
  | 'Mundra'
  | 'Chennai'
  | 'Kolkata'
  | 'Vizag'
  | 'Cochin'
  | 'Tuticorin'
  | 'Kandla';

export type TradeRoute =
  | 'ASIA'
  | 'GCC_MIDDLE_EAST'
  | 'EUROPE'
  | 'AMERICAS'
  | 'AFRICA'
  | 'OCEANIA';

// ─── Container Specifications ─────────────────────────────────────────

export interface ContainerSpec {
  label: string;
  shortLabel: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  maxCbm: number;
  maxPayloadKg: number;
}

export const CONTAINER_SPECS: Record<ContainerType, ContainerSpec> = {
  '20ft': {
    label: '20ft Standard (TEU)',
    shortLabel: '20\' Std',
    lengthM: 5.9,
    widthM: 2.35,
    heightM: 2.39,
    maxCbm: 33,
    maxPayloadKg: 21700,
  },
  '40ft': {
    label: '40ft Standard',
    shortLabel: '40\' Std',
    lengthM: 12.03,
    widthM: 2.35,
    heightM: 2.39,
    maxCbm: 67,
    maxPayloadKg: 26680,
  },
  '40ftHC': {
    label: '40ft High Cube',
    shortLabel: '40\' HC',
    lengthM: 12.03,
    widthM: 2.35,
    heightM: 2.69,
    maxCbm: 76,
    maxPayloadKg: 26460,
  },
  '20ftReefer': {
    label: '20ft Reefer',
    shortLabel: '20\' Reefer',
    lengthM: 5.44,
    widthM: 2.29,
    heightM: 2.27,
    maxCbm: 28,
    maxPayloadKg: 21000,
  },
  '40ftReeferHC': {
    label: '40ft Reefer High Cube',
    shortLabel: '40\' Reefer HC',
    lengthM: 11.56,
    widthM: 2.29,
    heightM: 2.55,
    maxCbm: 67,
    maxPayloadKg: 26280,
  },
};

// ─── Sea Port Data ────────────────────────────────────────────────────

export interface SeaPortInfo {
  name: string;
  code: SeaPort;
  city: string;
  state: string;
}

export const SEA_PORTS: SeaPortInfo[] = [
  { name: 'JNPT / Nhava Sheva', code: 'JNPT', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Mundra Port', code: 'Mundra', city: 'Mundra', state: 'Gujarat' },
  { name: 'Chennai Port', code: 'Chennai', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Kolkata / Haldia Port', code: 'Kolkata', city: 'Kolkata', state: 'West Bengal' },
  { name: 'Visakhapatnam Port', code: 'Vizag', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'Cochin Port', code: 'Cochin', city: 'Kochi', state: 'Kerala' },
  { name: 'Tuticorin / V.O.C. Port', code: 'Tuticorin', city: 'Tuticorin', state: 'Tamil Nadu' },
  { name: 'Kandla / Deendayal Port', code: 'Kandla', city: 'Kandla', state: 'Gujarat' },
];

// ─── Sea Port → Clearance Port Mapping (for inland delivery) ─────────

export const SEA_PORT_TO_CLEARANCE_PORT: Record<SeaPort, ClearancePort> = {
  JNPT: 'Mumbai',
  Mundra: 'Mumbai',
  Chennai: 'Chennai',
  Kolkata: 'Kolkata',
  Vizag: 'Hyderabad',
  Cochin: 'Bangalore',
  Tuticorin: 'Chennai',
  Kandla: 'Mumbai',
};

// ─── Trade Route Mapping ──────────────────────────────────────────────

const TRADE_ROUTE_COUNTRIES: Record<TradeRoute, string[]> = {
  ASIA: [
    'CN', 'HK', 'TW', 'KR', 'JP', 'SG', 'MY', 'TH', 'VN', 'ID', 'PH',
    'KH', 'MM', 'BD', 'LK', 'NP', 'BT', 'LA', 'BN', 'MO', 'TL', 'PK',
  ],
  GCC_MIDDLE_EAST: ['AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'JO', 'IR', 'IQ', 'LB'],
  EUROPE: [
    'DE', 'GB', 'FR', 'IT', 'NL', 'BE', 'ES', 'PT', 'PL', 'CZ', 'AT',
    'SE', 'NO', 'DK', 'FI', 'CH', 'IE', 'GR', 'RO', 'BG', 'HU', 'SK',
    'SI', 'HR', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU', 'TR', 'RU', 'UA',
    'RS', 'BA', 'MK', 'AL', 'ME', 'BY', 'MD', 'GE', 'AM', 'AZ', 'IS',
  ],
  AMERICAS: [
    'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'VE', 'UY',
    'PY', 'BO', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'JM',
    'TT', 'PR', 'GY', 'SR', 'BZ', 'BS', 'BB',
  ],
  AFRICA: [
    'ZA', 'KE', 'NG', 'EG', 'MA', 'TN', 'GH', 'TZ', 'ET', 'DZ', 'CM',
    'SN', 'CI', 'MZ', 'AO', 'UG', 'ZM', 'ZW', 'MW', 'MU', 'BW', 'NA',
    'RW', 'SD', 'LY', 'GA', 'CG', 'CD', 'MG', 'ML', 'BF', 'NE', 'TG',
    'BJ', 'SL', 'LR', 'SO', 'DJ', 'ER', 'SC',
  ],
  OCEANIA: ['AU', 'NZ', 'PG', 'FJ', 'WS', 'TO', 'VU', 'SB'],
};

export function getTradeRoute(countryCode: string): TradeRoute {
  for (const [route, countries] of Object.entries(TRADE_ROUTE_COUNTRIES)) {
    if (countries.includes(countryCode)) return route as TradeRoute;
  }
  return 'ASIA'; // default fallback
}

// ─── Ocean Freight Rates (USD) ────────────────────────────────────────
// Indicative rates — user can override

// FCL rates per container (USD)
export const FCL_RATES_USD: Record<TradeRoute, Record<ContainerType, number>> = {
  ASIA:            { '20ft': 900,  '40ft': 1500, '40ftHC': 1600, '20ftReefer': 1800, '40ftReeferHC': 3000 },
  GCC_MIDDLE_EAST: { '20ft': 700,  '40ft': 1200, '40ftHC': 1300, '20ftReefer': 1500, '40ftReeferHC': 2500 },
  EUROPE:          { '20ft': 1200, '40ft': 2000, '40ftHC': 2200, '20ftReefer': 2400, '40ftReeferHC': 3800 },
  AMERICAS:        { '20ft': 1500, '40ft': 2500, '40ftHC': 2700, '20ftReefer': 3000, '40ftReeferHC': 4500 },
  AFRICA:          { '20ft': 1300, '40ft': 2200, '40ftHC': 2400, '20ftReefer': 2600, '40ftReeferHC': 4000 },
  OCEANIA:         { '20ft': 1100, '40ft': 1800, '40ftHC': 2000, '20ftReefer': 2200, '40ftReeferHC': 3500 },
};

// LCL rates per CBM (USD)
export const LCL_RATES_USD_PER_CBM: Record<TradeRoute, number> = {
  ASIA: 45,
  GCC_MIDDLE_EAST: 40,
  EUROPE: 55,
  AMERICAS: 65,
  AFRICA: 60,
  OCEANIA: 50,
};

// LCL minimum CBM
export const LCL_MINIMUM_CBM = 1;

// ─── Port & Terminal Charges (INR) ────────────────────────────────────

// THC Origin (USD — at loading port)
export const THC_ORIGIN_USD: Record<ShippingMode, Record<string, number>> = {
  FCL: { '20ft': 150, '40ft': 250, '40ftHC': 250, '20ftReefer': 200, '40ftReeferHC': 300 },
  LCL: { perCbm: 15 },
};

// THC Destination (INR — at Indian port)
export const THC_DESTINATION_INR: Record<ShippingMode, Record<string, number>> = {
  FCL: { '20ft': 8000, '40ft': 12000, '40ftHC': 12000, '20ftReefer': 10000, '40ftReeferHC': 14000 },
  LCL: { perCbm: 800 },
};

// BL (Bill of Lading) Fee — flat INR
export const BL_FEE_INR = 3500;

// Delivery Order Charges — INR
export const DO_CHARGES_INR: Record<ShippingMode, number> = {
  FCL: 3500,
  LCL: 2000,
};

// CFS (Container Freight Station) Charges — LCL only, per CBM INR
export const CFS_CHARGES_PER_CBM_INR = 1500;

// Customs Examination — flat INR
export const CUSTOMS_EXAMINATION_INR = 2000;

// Demurrage (FCL only) — per day per container INR
export const DEMURRAGE_PER_DAY_INR: Record<string, number> = {
  '20ft': 2000,
  '40ft': 3000,
  '40ftHC': 3000,
  '20ftReefer': 3500,
  '40ftReeferHC': 4500,
};

// Detention (FCL only) — per day per container INR
export const DETENTION_PER_DAY_INR: Record<string, number> = {
  '20ft': 1500,
  '40ft': 2500,
  '40ftHC': 2500,
  '20ftReefer': 3000,
  '40ftReeferHC': 4000,
};

// ─── Sea Clearance Charges ────────────────────────────────────────────

export const SEA_CLEARANCE_CHARGE_DEFAULT = 5500;
export const SEA_CLEARANCE_CHARGE_HAZARDOUS = 10000;

// ─── Transit Time Estimates ───────────────────────────────────────────

export const TRANSIT_ESTIMATES: Record<TradeRoute, string> = {
  ASIA: '10\u201320 days',
  GCC_MIDDLE_EAST: '5\u201312 days',
  EUROPE: '20\u201330 days',
  AMERICAS: '25\u201340 days',
  AFRICA: '15\u201330 days',
  OCEANIA: '15\u201325 days',
};

// ─── Utility Functions ────────────────────────────────────────────────

export function getOceanFreightUSD(
  mode: ShippingMode,
  tradeRoute: TradeRoute,
  containerType?: ContainerType,
  numberOfContainers?: number,
  totalCbm?: number,
): number {
  if (mode === 'FCL') {
    if (!containerType) throw new Error('Container type required for FCL');
    const rate = FCL_RATES_USD[tradeRoute][containerType];
    return rate * (numberOfContainers || 1);
  } else {
    const cbm = Math.max(totalCbm || 0, LCL_MINIMUM_CBM);
    return LCL_RATES_USD_PER_CBM[tradeRoute] * cbm;
  }
}

export function getThcOriginUSD(mode: ShippingMode, containerType?: ContainerType, totalCbm?: number): number {
  if (mode === 'FCL') {
    return THC_ORIGIN_USD.FCL[containerType || '20ft'] || 150;
  }
  return (THC_ORIGIN_USD.LCL.perCbm || 15) * Math.max(totalCbm || 0, LCL_MINIMUM_CBM);
}

export function getThcDestinationINR(mode: ShippingMode, containerType?: ContainerType, totalCbm?: number): number {
  if (mode === 'FCL') {
    return THC_DESTINATION_INR.FCL[containerType || '20ft'] || 8000;
  }
  return (THC_DESTINATION_INR.LCL.perCbm || 800) * Math.max(totalCbm || 0, LCL_MINIMUM_CBM);
}

export function getDoChargesINR(mode: ShippingMode): number {
  return DO_CHARGES_INR[mode];
}

export function getCfsChargesINR(totalCbm: number): number {
  return CFS_CHARGES_PER_CBM_INR * Math.max(totalCbm, LCL_MINIMUM_CBM);
}

export function getDemurrageINR(containerType: ContainerType, days: number, numberOfContainers: number): number {
  return (DEMURRAGE_PER_DAY_INR[containerType] || 2000) * days * numberOfContainers;
}

export function getDetentionINR(containerType: ContainerType, days: number, numberOfContainers: number): number {
  return (DETENTION_PER_DAY_INR[containerType] || 1500) * days * numberOfContainers;
}
