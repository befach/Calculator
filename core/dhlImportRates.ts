// DHL Time Definite Worldwide Import Rate Card — Non-Documents, to India
// Source: Import_2026_I.pdf (effective 2026)
// All rates in INR

import { getVolumetricWeight, getChargeableWeight } from './dhlRates';

// Re-export for convenience
export { getVolumetricWeight, getChargeableWeight };

// ─── Country → Zone mapping ────────────────────────────────────────────────────

export const importCountryZones: Record<string, { name: string; zone: number }> = {
  // Zone 1
  BD: { name: 'Bangladesh', zone: 1 },
  BT: { name: 'Bhutan', zone: 1 },
  MV: { name: 'Maldives', zone: 1 },
  NP: { name: 'Nepal', zone: 1 },
  LK: { name: 'Sri Lanka', zone: 1 },
  AE: { name: 'United Arab Emirates', zone: 1 },

  // Zone 2
  HK: { name: 'Hong Kong SAR China', zone: 2 },
  MY: { name: 'Malaysia', zone: 2 },
  SG: { name: 'Singapore', zone: 2 },
  TH: { name: 'Thailand', zone: 2 },

  // Zone 3
  CN: { name: 'China', zone: 3 },

  // Zone 4
  BH: { name: 'Bahrain', zone: 4 },
  JO: { name: 'Jordan', zone: 4 },
  KW: { name: 'Kuwait', zone: 4 },
  OM: { name: 'Oman', zone: 4 },
  PK: { name: 'Pakistan', zone: 4 },
  QA: { name: 'Qatar', zone: 4 },
  SA: { name: 'Saudi Arabia', zone: 4 },

  // Zone 5
  BN: { name: 'Brunei', zone: 5 },
  KH: { name: 'Cambodia', zone: 5 },
  ID: { name: 'Indonesia', zone: 5 },
  JP: { name: 'Japan', zone: 5 },
  KR: { name: 'Korea Rep Of', zone: 5 },
  LA: { name: 'Laos', zone: 5 },
  MO: { name: 'Macau SAR China', zone: 5 },
  MM: { name: 'Myanmar', zone: 5 },
  PH: { name: 'Philippines', zone: 5 },
  TW: { name: 'Taiwan', zone: 5 },
  TL: { name: 'Timor-Leste', zone: 5 },
  VN: { name: 'Vietnam', zone: 5 },

  // Zone 6
  AU: { name: 'Australia', zone: 6 },
  NZ: { name: 'New Zealand', zone: 6 },
  PG: { name: 'Papua New Guinea', zone: 6 },

  // Zone 7
  AL: { name: 'Albania', zone: 7 },
  AD: { name: 'Andorra', zone: 7 },
  AT: { name: 'Austria', zone: 7 },
  BE: { name: 'Belgium', zone: 7 },
  BA: { name: 'Bosnia & Herzegovina', zone: 7 },
  BG: { name: 'Bulgaria', zone: 7 },
  IC: { name: 'Canary Islands', zone: 7 },
  HR: { name: 'Croatia', zone: 7 },
  CY: { name: 'Cyprus', zone: 7 },
  CZ: { name: 'Czech Rep', zone: 7 },
  DK: { name: 'Denmark', zone: 7 },
  EE: { name: 'Estonia', zone: 7 },
  FI: { name: 'Finland', zone: 7 },
  FR: { name: 'France', zone: 7 },
  DE: { name: 'Germany', zone: 7 },
  GI: { name: 'Gibraltar', zone: 7 },
  GR: { name: 'Greece', zone: 7 },
  GG: { name: 'Guernsey', zone: 7 },
  HU: { name: 'Hungary', zone: 7 },
  IE: { name: 'Ireland', zone: 7 },
  IL: { name: 'Israel', zone: 7 },
  IT: { name: 'Italy', zone: 7 },
  JE: { name: 'Jersey', zone: 7 },
  KV: { name: 'Kosovo', zone: 7 },
  LV: { name: 'Latvia', zone: 7 },
  LI: { name: 'Liechtenstein', zone: 7 },
  LT: { name: 'Lithuania', zone: 7 },
  LU: { name: 'Luxembourg', zone: 7 },
  MT: { name: 'Malta', zone: 7 },
  MC: { name: 'Monaco', zone: 7 },
  ME: { name: 'Montenegro', zone: 7 },
  NL: { name: 'Netherlands', zone: 7 },
  MK: { name: 'North Macedonia', zone: 7 },
  NO: { name: 'Norway', zone: 7 },
  PL: { name: 'Poland', zone: 7 },
  PT: { name: 'Portugal', zone: 7 },
  RO: { name: 'Romania', zone: 7 },
  SM: { name: 'San Marino', zone: 7 },
  RS: { name: 'Serbia', zone: 7 },
  SK: { name: 'Slovakia', zone: 7 },
  SI: { name: 'Slovenia', zone: 7 },
  ES: { name: 'Spain', zone: 7 },
  SE: { name: 'Sweden', zone: 7 },
  CH: { name: 'Switzerland', zone: 7 },
  TR: { name: 'Turkey', zone: 7 },
  GB: { name: 'United Kingdom', zone: 7 },
  VA: { name: 'Vatican City', zone: 7 },

  // Zone 8
  CA: { name: 'Canada', zone: 8 },
  MX: { name: 'Mexico', zone: 8 },
  US: { name: 'USA', zone: 8 },

  // Zone 9
  AR: { name: 'Argentina', zone: 9 },
  BO: { name: 'Bolivia', zone: 9 },
  BR: { name: 'Brazil', zone: 9 },
  CL: { name: 'Chile', zone: 9 },
  CO: { name: 'Colombia', zone: 9 },
  EC: { name: 'Ecuador', zone: 9 },
  GF: { name: 'French Guyana', zone: 9 },
  GY: { name: 'Guyana British', zone: 9 },
  PY: { name: 'Paraguay', zone: 9 },
  PE: { name: 'Peru', zone: 9 },
  ZA: { name: 'South Africa', zone: 9 },
  SR: { name: 'Suriname', zone: 9 },
  UY: { name: 'Uruguay', zone: 9 },
  VE: { name: 'Venezuela', zone: 9 },

  // Zone 10 — Rest of World
  AF: { name: 'Afghanistan', zone: 10 },
  DZ: { name: 'Algeria', zone: 10 },
  AS: { name: 'American Samoa', zone: 10 },
  AO: { name: 'Angola', zone: 10 },
  AI: { name: 'Anguilla', zone: 10 },
  AG: { name: 'Antigua', zone: 10 },
  AM: { name: 'Armenia', zone: 10 },
  AW: { name: 'Aruba', zone: 10 },
  AZ: { name: 'Azerbaijan', zone: 10 },
  BS: { name: 'Bahamas', zone: 10 },
  BB: { name: 'Barbados', zone: 10 },
  BY: { name: 'Belarus', zone: 10 },
  BZ: { name: 'Belize', zone: 10 },
  BJ: { name: 'Benin', zone: 10 },
  BM: { name: 'Bermuda', zone: 10 },
  BQ: { name: 'Bonaire', zone: 10 },
  BW: { name: 'Botswana', zone: 10 },
  BF: { name: 'Burkina Faso', zone: 10 },
  BI: { name: 'Burundi', zone: 10 },
  CM: { name: 'Cameroon', zone: 10 },
  CV: { name: 'Cape Verde', zone: 10 },
  KY: { name: 'Cayman Islands', zone: 10 },
  CF: { name: 'Central African Rep', zone: 10 },
  TD: { name: 'Chad', zone: 10 },
  KM: { name: 'Comoros', zone: 10 },
  CG: { name: 'Congo', zone: 10 },
  CD: { name: 'Congo DPR', zone: 10 },
  CK: { name: 'Cook Islands', zone: 10 },
  CR: { name: 'Costa Rica', zone: 10 },
  CI: { name: 'Cote D Ivoire', zone: 10 },
  CU: { name: 'Cuba', zone: 10 },
  CW: { name: 'Curacao', zone: 10 },
  DJ: { name: 'Djibouti', zone: 10 },
  DM: { name: 'Dominica', zone: 10 },
  DO: { name: 'Dominican Rep', zone: 10 },
  EG: { name: 'Egypt', zone: 10 },
  SV: { name: 'El Salvador', zone: 10 },
  ER: { name: 'Eritrea', zone: 10 },
  SZ: { name: 'Eswatini', zone: 10 },
  ET: { name: 'Ethiopia', zone: 10 },
  FK: { name: 'Falkland Islands', zone: 10 },
  FO: { name: 'Faroe Islands', zone: 10 },
  FJ: { name: 'Fiji', zone: 10 },
  GA: { name: 'Gabon', zone: 10 },
  GM: { name: 'Gambia', zone: 10 },
  GE: { name: 'Georgia', zone: 10 },
  GH: { name: 'Ghana', zone: 10 },
  GL: { name: 'Greenland', zone: 10 },
  GD: { name: 'Grenada', zone: 10 },
  GP: { name: 'Guadeloupe', zone: 10 },
  GU: { name: 'Guam', zone: 10 },
  GT: { name: 'Guatemala', zone: 10 },
  GN: { name: 'Guinea Rep', zone: 10 },
  GW: { name: 'Guinea-Bissau', zone: 10 },
  GQ: { name: 'Guinea-Equatorial', zone: 10 },
  HT: { name: 'Haiti', zone: 10 },
  HN: { name: 'Honduras', zone: 10 },
  IS: { name: 'Iceland', zone: 10 },
  IR: { name: 'Iran', zone: 10 },
  IQ: { name: 'Iraq', zone: 10 },
  JM: { name: 'Jamaica', zone: 10 },
  KZ: { name: 'Kazakhstan', zone: 10 },
  KE: { name: 'Kenya', zone: 10 },
  KI: { name: 'Kiribati', zone: 10 },
  KP: { name: 'Korea DPR', zone: 10 },
  KG: { name: 'Kyrgyzstan', zone: 10 },
  LB: { name: 'Lebanon', zone: 10 },
  LS: { name: 'Lesotho', zone: 10 },
  LR: { name: 'Liberia', zone: 10 },
  LY: { name: 'Libya', zone: 10 },
  MG: { name: 'Madagascar', zone: 10 },
  MW: { name: 'Malawi', zone: 10 },
  ML: { name: 'Mali', zone: 10 },
  MH: { name: 'Marshall Islands', zone: 10 },
  MQ: { name: 'Martinique', zone: 10 },
  MR: { name: 'Mauritania', zone: 10 },
  MU: { name: 'Mauritius', zone: 10 },
  YT: { name: 'Mayotte', zone: 10 },
  FM: { name: 'Micronesia', zone: 10 },
  MD: { name: 'Moldova', zone: 10 },
  MN: { name: 'Mongolia', zone: 10 },
  MS: { name: 'Montserrat', zone: 10 },
  MA: { name: 'Morocco', zone: 10 },
  MZ: { name: 'Mozambique', zone: 10 },
  NA: { name: 'Namibia', zone: 10 },
  NR: { name: 'Nauru', zone: 10 },
  KN: { name: 'Nevis', zone: 10 },
  NC: { name: 'New Caledonia', zone: 10 },
  NI: { name: 'Nicaragua', zone: 10 },
  NE: { name: 'Niger', zone: 10 },
  NG: { name: 'Nigeria', zone: 10 },
  NU: { name: 'Niue', zone: 10 },
  MP: { name: 'Northern Mariana Islands', zone: 10 },
  PW: { name: 'Palau', zone: 10 },
  PA: { name: 'Panama', zone: 10 },
  PR: { name: 'Puerto Rico', zone: 10 },
  RE: { name: 'Reunion', zone: 10 },
  RU: { name: 'Russian Federation', zone: 10 },
  RW: { name: 'Rwanda', zone: 10 },
  SH: { name: 'Saint Helena', zone: 10 },
  WS: { name: 'Samoa', zone: 10 },
  ST: { name: 'Sao Tome And Principe', zone: 10 },
  SN: { name: 'Senegal', zone: 10 },
  SC: { name: 'Seychelles', zone: 10 },
  SL: { name: 'Sierra Leone', zone: 10 },
  SB: { name: 'Solomon Islands', zone: 10 },
  SO: { name: 'Somalia', zone: 10 },
  SS: { name: 'South Sudan', zone: 10 },
  BL: { name: 'St Barthelemy', zone: 10 },
  SE2: { name: 'St Eustatius', zone: 10 },
  LC: { name: 'St Lucia', zone: 10 },
  SX: { name: 'St Maarten', zone: 10 },
  VC: { name: 'St Vincent', zone: 10 },
  SD: { name: 'Sudan', zone: 10 },
  SY: { name: 'Syria', zone: 10 },
  PF: { name: 'Tahiti', zone: 10 },
  TJ: { name: 'Tajikistan', zone: 10 },
  TZ: { name: 'Tanzania', zone: 10 },
  TG: { name: 'Togo', zone: 10 },
  TO: { name: 'Tonga', zone: 10 },
  TT: { name: 'Trinidad And Tobago', zone: 10 },
  TN: { name: 'Tunisia', zone: 10 },
  TM: { name: 'Turkmenistan', zone: 10 },
  TC: { name: 'Turks & Caicos', zone: 10 },
  TV: { name: 'Tuvalu', zone: 10 },
  UG: { name: 'Uganda', zone: 10 },
  UA: { name: 'Ukraine', zone: 10 },
  UZ: { name: 'Uzbekistan', zone: 10 },
  VU: { name: 'Vanuatu', zone: 10 },
  VG: { name: 'Virgin Islands-British', zone: 10 },
  VI: { name: 'Virgin Islands-US', zone: 10 },
  YE: { name: 'Yemen', zone: 10 },
  ZM: { name: 'Zambia', zone: 10 },
  ZW: { name: 'Zimbabwe', zone: 10 },
};

// ─── Non-Documents Rate Table (INR) ────────────────────────────────────────────
// zones array: index 0 = Zone 1, index 1 = Zone 2, … index 9 = Zone 10

export const importRateTable: { kg: number; zones: number[] }[] = [
  { kg: 0.5,  zones: [2330, 3078, 3241, 3375, 3462, 3569, 3315, 3409, 4169, 4827] },
  { kg: 1.0,  zones: [3033, 3806, 4047, 4162, 4330, 4394, 3831, 3939, 5503, 5987] },
  { kg: 1.5,  zones: [3491, 4389, 4669, 4795, 4978, 5050, 4347, 4470, 6244, 6916] },
  { kg: 2.0,  zones: [3949, 4972, 5291, 5428, 5626, 5706, 4863, 5001, 6985, 7845] },
  { kg: 2.5,  zones: [4407, 5555, 5921, 6061, 6274, 6362, 5379, 5532, 7727, 8774] },
  { kg: 3.0,  zones: [4759, 5995, 6437, 6577, 6804, 6923, 5856, 6029, 8406, 9646] },
  { kg: 3.5,  zones: [5111, 6435, 6953, 7093, 7334, 7484, 6333, 6526, 9085, 10518] },
  { kg: 4.0,  zones: [5463, 6875, 7469, 7609, 7864, 8045, 6810, 7023, 9764, 11390] },
  { kg: 4.5,  zones: [5815, 7315, 7985, 8125, 8394, 8606, 7287, 7520, 10443, 12262] },
  { kg: 5.0,  zones: [6167, 7755, 8501, 8641, 8924, 9167, 7764, 8017, 11122, 13134] },
  { kg: 5.5,  zones: [6377, 8008, 8867, 9013, 9309, 9544, 8149, 8434, 11705, 13869] },
  { kg: 6.0,  zones: [6587, 8261, 9233, 9385, 9694, 9921, 8534, 8851, 12288, 14604] },
  { kg: 6.5,  zones: [6797, 8514, 9599, 9757, 10079, 10298, 8919, 9268, 12871, 15339] },
  { kg: 7.0,  zones: [7007, 8767, 9965, 10129, 10464, 10675, 9304, 9685, 13454, 16074] },
  { kg: 7.5,  zones: [7217, 9020, 10331, 10501, 10849, 11052, 9689, 10102, 14037, 16809] },
  { kg: 8.0,  zones: [7427, 9273, 10697, 10873, 11234, 11429, 10074, 10519, 14620, 17544] },
  { kg: 8.5,  zones: [7637, 9526, 11063, 11245, 11619, 11806, 10459, 10936, 15203, 18279] },
  { kg: 9.0,  zones: [7847, 9779, 11429, 11617, 12004, 12183, 10844, 11353, 15786, 19014] },
  { kg: 9.5,  zones: [8057, 10032, 11795, 11989, 12389, 12560, 11229, 11770, 16369, 19749] },
  { kg: 10.0, zones: [8267, 10285, 12161, 12361, 12774, 12937, 11614, 12187, 16952, 20484] },
  { kg: 10.5, zones: [8511, 10460, 12446, 12641, 13058, 13242, 11887, 12541, 17439, 21010] },
  { kg: 11.0, zones: [8755, 10635, 12731, 12921, 13342, 13547, 12160, 12895, 17926, 21536] },
  { kg: 11.5, zones: [8999, 10810, 13016, 13201, 13626, 13852, 12433, 13249, 18413, 22062] },
  { kg: 12.0, zones: [9243, 10985, 13301, 13481, 13910, 14157, 12706, 13603, 18900, 22588] },
  { kg: 12.5, zones: [9487, 11160, 13586, 13761, 14194, 14462, 12979, 13957, 19387, 23114] },
  { kg: 13.0, zones: [9731, 11335, 13871, 14041, 14478, 14767, 13252, 14311, 19874, 23640] },
  { kg: 13.5, zones: [9975, 11510, 14156, 14321, 14762, 15072, 13525, 14665, 20361, 24166] },
  { kg: 14.0, zones: [10219, 11685, 14441, 14601, 15046, 15377, 13798, 15019, 20848, 24692] },
  { kg: 14.5, zones: [10463, 11860, 14726, 14881, 15330, 15682, 14071, 15373, 21335, 25218] },
  { kg: 15.0, zones: [10707, 12035, 15011, 15161, 15614, 15987, 14344, 15727, 21822, 25744] },
  { kg: 15.5, zones: [10951, 12210, 15296, 15441, 15898, 16292, 14617, 16081, 22309, 26270] },
  { kg: 16.0, zones: [11195, 12385, 15581, 15721, 16182, 16597, 14890, 16435, 22796, 26796] },
  { kg: 16.5, zones: [11439, 12560, 15866, 16001, 16466, 16902, 15163, 16789, 23283, 27322] },
  { kg: 17.0, zones: [11683, 12735, 16151, 16281, 16750, 17207, 15436, 17143, 23770, 27848] },
  { kg: 17.5, zones: [11927, 12910, 16436, 16561, 17034, 17512, 15709, 17497, 24257, 28374] },
  { kg: 18.0, zones: [12171, 13085, 16721, 16841, 17318, 17817, 15982, 17851, 24744, 28900] },
  { kg: 18.5, zones: [12415, 13260, 17006, 17121, 17602, 18122, 16255, 18205, 25231, 29426] },
  { kg: 19.0, zones: [12659, 13435, 17291, 17401, 17886, 18427, 16528, 18559, 25718, 29952] },
  { kg: 19.5, zones: [12903, 13610, 17576, 17681, 18170, 18732, 16801, 18913, 26205, 30478] },
  { kg: 20.0, zones: [13147, 13785, 17861, 17961, 18454, 19037, 17074, 19267, 26692, 31004] },
  { kg: 21.0, zones: [13575, 14371, 18455, 18555, 19352, 19870, 17900, 20106, 27498, 32328] },
  { kg: 22.0, zones: [14003, 14957, 19049, 19149, 20250, 20703, 18726, 20945, 28304, 33652] },
  { kg: 23.0, zones: [14431, 15543, 19643, 19743, 21148, 21536, 19552, 21784, 29110, 34976] },
  { kg: 24.0, zones: [14859, 16129, 20237, 20337, 22046, 22369, 20378, 22623, 29916, 36300] },
  { kg: 25.0, zones: [15287, 16715, 20831, 20931, 22944, 23202, 21204, 23462, 30722, 37624] },
  { kg: 26.0, zones: [15715, 17301, 21425, 21525, 23842, 24035, 22030, 24301, 31528, 38948] },
  { kg: 27.0, zones: [16143, 17887, 22019, 22119, 24740, 24868, 22856, 25140, 32334, 40272] },
  { kg: 28.0, zones: [16571, 18473, 22613, 22713, 25638, 25701, 23682, 25979, 33140, 41596] },
  { kg: 29.0, zones: [16999, 19059, 23207, 23307, 26536, 26534, 24508, 26818, 33946, 42920] },
  { kg: 30.0, zones: [17427, 19645, 23801, 23901, 27434, 27367, 25334, 27657, 34752, 44244] },
];

// ─── Multiplier rates per 1 kg (for weights above 30 kg) ───────────────────────

export const importMultiplierRates: { from: number; to: number; zones: number[] }[] = [
  { from: 30.1, to: 70,    zones: [562, 637, 769, 772, 903, 908, 853, 916, 1121, 1434] },
  { from: 70.1, to: 300,   zones: [540, 605, 731, 743, 863, 864, 841, 924, 1094, 1396] },
  { from: 300.1, to: 99999, zones: [543, 610, 737, 748, 869, 871, 847, 947, 1114, 1408] },
];

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Fuel surcharge applied on top of base freight */
export const IMPORT_FUEL_SURCHARGE_PERCENT = 30;

/** Duty Tax Paid processing fee percentage */
export const IMPORT_DTP_PERCENT = 2.0;

/** Minimum DTP fee in INR (duty tax processing) */
export const IMPORT_DTP_MINIMUM_INR = 1100;

/** Clearance processing fee per shipment in INR */
export const IMPORT_CLEARANCE_PROCESSING_INR = 1000;

// ─── Utility functions ──────────────────────────────────────────────────────────

/**
 * Round a weight UP to the nearest 0.5 kg.
 * e.g. 2.1 → 2.5, 3.0 → 3.0, 7.3 → 7.5
 */
function ceilToHalfKg(kg: number): number {
  return Math.ceil(kg * 2) / 2;
}

/**
 * Get the base DHL import freight charge (before fuel surcharge) for a given
 * chargeable weight and zone.
 *
 * @param chargeableWeightKg - Already-computed chargeable weight in kg
 * @param zone - DHL zone number (1–10)
 * @returns Base freight in INR
 */
export function getImportDHLFreight(chargeableWeightKg: number, zone: number): number {
  if (zone < 1 || zone > 10) {
    throw new Error(`Invalid DHL zone: ${zone}. Must be 1–10.`);
  }
  if (chargeableWeightKg <= 0) {
    throw new Error(`Weight must be positive, got ${chargeableWeightKg}`);
  }

  const zoneIndex = zone - 1;
  const roundedKg = ceilToHalfKg(chargeableWeightKg);

  // ── Weight ≤ 30 kg: look up directly in the rate table ──
  if (roundedKg <= 30) {
    const row = importRateTable.find((r) => r.kg >= roundedKg);
    if (!row) {
      // Fallback to last row (should not happen for ≤ 30 kg)
      return importRateTable[importRateTable.length - 1].zones[zoneIndex];
    }
    return row.zones[zoneIndex];
  }

  // ── Weight > 30 kg: 30 kg base + (extra kg × multiplier) ──
  const base30 = importRateTable[importRateTable.length - 1].zones[zoneIndex]; // 30 kg rate
  const extraKg = roundedKg - 30;

  // Find the correct multiplier slab
  const slab = importMultiplierRates.find(
    (s) => roundedKg >= s.from && roundedKg <= s.to
  );
  if (!slab) {
    // Use the highest slab as fallback
    const fallback = importMultiplierRates[importMultiplierRates.length - 1];
    return base30 + extraKg * fallback.zones[zoneIndex];
  }

  return base30 + extraKg * slab.zones[zoneIndex];
}
