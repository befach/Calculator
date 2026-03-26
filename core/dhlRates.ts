// DHL Express Rate Card — Non-Documents, from India
// Source: Import_2026_E.pdf (effective 2026)
// All rates in INR

// ─── Country → Zone mapping ────────────────────────────────────────────────────

export const countryZones: Record<string, { name: string; zone: number }> = {
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

export const dhlRateTable: { kg: number; zones: number[] }[] = [
  { kg: 0.5,  zones: [2728, 3601, 3793, 3949, 4052, 4177, 3879, 3990, 4879, 5649] },
  { kg: 1.0,  zones: [3551, 4453, 4736, 4869, 5068, 5143, 4483, 4610, 6440, 7006] },
  { kg: 1.5,  zones: [4087, 5135, 5464, 5610, 5826, 5911, 5087, 5231, 7307, 8093] },
  { kg: 2.0,  zones: [4623, 5817, 6192, 6351, 6584, 6679, 5691, 5852, 8174, 9180] },
  { kg: 2.5,  zones: [5158, 6499, 6929, 7092, 7343, 7447, 6295, 6473, 9042, 10267] },
  { kg: 3.0,  zones: [5570, 7014, 7533, 7696, 7964, 8103, 6852, 7055, 9836, 11287] },
  { kg: 3.5,  zones: [5982, 7529, 8137, 8300, 8585, 8759, 7409, 7637, 10630, 12307] },
  { kg: 4.0,  zones: [6394, 8044, 8741, 8904, 9206, 9415, 7966, 8219, 11424, 13327] },
  { kg: 4.5,  zones: [6806, 8559, 9345, 9508, 9827, 10071, 8523, 8801, 12218, 14347] },
  { kg: 5.0,  zones: [7218, 9074, 9949, 10112, 10448, 10727, 9080, 9383, 13012, 15367] },
  { kg: 5.5,  zones: [7464, 9370, 10377, 10547, 10898, 11168, 9530, 9870, 13694, 16228] },
  { kg: 6.0,  zones: [7710, 9666, 10805, 10982, 11348, 11609, 9980, 10357, 14376, 17089] },
  { kg: 6.5,  zones: [7956, 9962, 11233, 11417, 11798, 12050, 10430, 10844, 15058, 17950] },
  { kg: 7.0,  zones: [8202, 10258, 11661, 11852, 12248, 12491, 10880, 11331, 15740, 18811] },
  { kg: 7.5,  zones: [8448, 10554, 12089, 12287, 12698, 12932, 11330, 11818, 16422, 19672] },
  { kg: 8.0,  zones: [8694, 10850, 12517, 12722, 13148, 13373, 11780, 12305, 17104, 20533] },
  { kg: 8.5,  zones: [8940, 11146, 12945, 13157, 13598, 13814, 12230, 12792, 17786, 21394] },
  { kg: 9.0,  zones: [9186, 11442, 13373, 13592, 14048, 14255, 12680, 13279, 18468, 22255] },
  { kg: 9.5,  zones: [9432, 11738, 13801, 14027, 14498, 14696, 13130, 13766, 19150, 23116] },
  { kg: 10.0, zones: [9678, 12034, 14229, 14462, 14948, 15137, 13580, 14253, 19832, 23977] },
  { kg: 10.5, zones: [9963, 12239, 14564, 14789, 15280, 15493, 13899, 14667, 20403, 24593] },
  { kg: 11.0, zones: [10248, 12444, 14899, 15116, 15612, 15849, 14218, 15081, 20974, 25209] },
  { kg: 11.5, zones: [10533, 12649, 15234, 15443, 15944, 16205, 14537, 15495, 21545, 25825] },
  { kg: 12.0, zones: [10818, 12854, 15569, 15770, 16276, 16561, 14856, 15909, 22116, 26441] },
  { kg: 12.5, zones: [11103, 13059, 15904, 16097, 16608, 16917, 15175, 16323, 22687, 27057] },
  { kg: 13.0, zones: [11388, 13264, 16239, 16424, 16940, 17273, 15494, 16737, 23258, 27673] },
  { kg: 13.5, zones: [11673, 13469, 16574, 16751, 17272, 17629, 15813, 17151, 23829, 28289] },
  { kg: 14.0, zones: [11958, 13674, 16909, 17078, 17604, 17985, 16132, 17565, 24400, 28905] },
  { kg: 14.5, zones: [12243, 13879, 17244, 17405, 17936, 18341, 16451, 17979, 24971, 29521] },
  { kg: 15.0, zones: [12528, 14084, 17579, 17732, 18268, 18697, 16770, 18393, 25542, 30137] },
  { kg: 15.5, zones: [12813, 14289, 17914, 18059, 18600, 19053, 17089, 18807, 26113, 30753] },
  { kg: 16.0, zones: [13098, 14494, 18249, 18386, 18932, 19409, 17408, 19221, 26684, 31369] },
  { kg: 16.5, zones: [13383, 14699, 18584, 18713, 19264, 19765, 17727, 19635, 27255, 31985] },
  { kg: 17.0, zones: [13668, 14904, 18919, 19040, 19596, 20121, 18046, 20049, 27826, 32601] },
  { kg: 17.5, zones: [13953, 15109, 19254, 19367, 19928, 20477, 18365, 20463, 28397, 33217] },
  { kg: 18.0, zones: [14238, 15314, 19589, 19694, 20260, 20833, 18684, 20877, 28968, 33833] },
  { kg: 18.5, zones: [14523, 15519, 19924, 20021, 20592, 21189, 19003, 21291, 29539, 34449] },
  { kg: 19.0, zones: [14808, 15724, 20259, 20348, 20924, 21545, 19322, 21705, 30110, 35065] },
  { kg: 19.5, zones: [15093, 15929, 20594, 20675, 21256, 21901, 19641, 22119, 30681, 35681] },
  { kg: 20.0, zones: [15378, 16134, 20929, 21002, 21588, 22257, 19960, 22533, 31252, 36297] },
  { kg: 21.0, zones: [15878, 16820, 21624, 21698, 22639, 23231, 20926, 23515, 32195, 37846] },
  { kg: 22.0, zones: [16378, 17506, 22319, 22394, 23690, 24205, 21892, 24497, 33138, 39395] },
  { kg: 23.0, zones: [16878, 18192, 23014, 23090, 24741, 25179, 22858, 25479, 34081, 40944] },
  { kg: 24.0, zones: [17378, 18878, 23709, 23786, 25792, 26153, 23824, 26461, 35024, 42493] },
  { kg: 25.0, zones: [17878, 19564, 24404, 24482, 26843, 27127, 24790, 27443, 35967, 44042] },
  { kg: 26.0, zones: [18378, 20250, 25099, 25178, 27894, 28101, 25756, 28425, 36910, 45591] },
  { kg: 27.0, zones: [18878, 20936, 25794, 25874, 28945, 29075, 26722, 29407, 37853, 47140] },
  { kg: 28.0, zones: [19378, 21622, 26489, 26570, 29996, 30049, 27688, 30389, 38796, 48689] },
  { kg: 29.0, zones: [19878, 22308, 27184, 27266, 31047, 31023, 28654, 31371, 39739, 50238] },
  { kg: 30.0, zones: [20378, 22994, 27879, 27962, 32098, 31997, 29620, 32353, 40682, 51787] },
];

// ─── Multiplier rates per 1 kg (for weights above 30 kg) ───────────────────────

export const dhlMultiplierRates: { from: number; to: number; zones: number[] }[] = [
  { from: 30.1, to: 70,    zones: [659, 745, 900, 903, 1057, 1062, 998, 1072, 1313, 1677] },
  { from: 70.1, to: 300,   zones: [632, 708, 855, 869, 1009, 1010, 985, 1081, 1280, 1635] },
  { from: 300.1, to: 99999, zones: [636, 714, 862, 877, 1017, 1020, 991, 1109, 1303, 1647] },
];

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Fuel surcharge applied on top of base freight */
export const DHL_FUEL_SURCHARGE_PERCENT = 30.5;

/** Duty Tax Paid processing fee percentage */
export const DHL_DTP_PERCENT = 2.0;

/** Minimum DTP fee in INR (duty tax processing) */
export const DHL_DTP_MINIMUM_INR = 1100;

// ─── Utility functions ──────────────────────────────────────────────────────────

/**
 * Round a weight UP to the nearest 0.5 kg.
 * e.g. 2.1 → 2.5, 3.0 → 3.0, 7.3 → 7.5
 */
function ceilToHalfKg(kg: number): number {
  return Math.ceil(kg * 2) / 2;
}

/**
 * Get the base DHL freight charge (before fuel surcharge) for a given
 * chargeable weight and zone.
 *
 * @param chargeableWeightKg - Already-computed chargeable weight in kg
 * @param zone - DHL zone number (1–10)
 * @returns Base freight in INR
 */
export function getDHLFreight(chargeableWeightKg: number, zone: number): number {
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
    const row = dhlRateTable.find((r) => r.kg >= roundedKg);
    if (!row) {
      // Fallback to last row (should not happen for ≤ 30 kg)
      return dhlRateTable[dhlRateTable.length - 1].zones[zoneIndex];
    }
    return row.zones[zoneIndex];
  }

  // ── Weight > 30 kg: 30 kg base + (extra kg × multiplier) ──
  const base30 = dhlRateTable[dhlRateTable.length - 1].zones[zoneIndex]; // 30 kg rate
  const extraKg = roundedKg - 30;

  // Find the correct multiplier slab
  const slab = dhlMultiplierRates.find(
    (s) => roundedKg >= s.from && roundedKg <= s.to
  );
  if (!slab) {
    // Use the highest slab as fallback
    const fallback = dhlMultiplierRates[dhlMultiplierRates.length - 1];
    return base30 + extraKg * fallback.zones[zoneIndex];
  }

  return base30 + extraKg * slab.zones[zoneIndex];
}

/**
 * Calculate volumetric weight from box dimensions.
 * DHL divisor = 5000.
 */
export function getVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  return (lengthCm * widthCm * heightCm) / 5000;
}

/**
 * Determine the chargeable weight: the greater of actual vs volumetric,
 * rounded up to the nearest 0.5 kg.
 */
export function getChargeableWeight(
  actualKg: number,
  volumetricKg: number
): number {
  return ceilToHalfKg(Math.max(actualKg, volumetricKg));
}
