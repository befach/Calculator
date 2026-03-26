// ─── Inland Shipping / Last-Mile Delivery Rate Engine ──────────────────
// Slab-based pricing modeled on Delhivery/DTDC/BlueDart averages (2026)
// Zones are relative to the customs clearance port

// ─── Types ─────────────────────────────────────────────────────────────

export type InlandZone = 'A' | 'B' | 'C' | 'D' | 'E';

export type ClearancePort = 'Mumbai' | 'Delhi' | 'Chennai' | 'Bangalore' | 'Hyderabad' | 'Kolkata';

export interface InlandZoneInfo {
  label: string;
  description: string;
  distanceRange: string;
  odaSurchargeINR: number;
}

export interface ClearancePortInfo {
  name: ClearancePort;
  code: string;          // airport/port code
  zoneExamples: Record<InlandZone, string>;
}

export interface InlandCostResult {
  baseFreightINR: number;
  fuelSurchargeINR: number;
  odaSurchargeINR: number;
  subtotalINR: number;
  gstINR: number;
  totalINR: number;
  weightSlab: string;
  perKgEffective: number; // effective per-kg rate for display
  zone: InlandZone;
  clearancePort: ClearancePort;
  chargeableWeight: number;
}

// ─── Constants ─────────────────────────────────────────────────────────

export const INLAND_FUEL_SURCHARGE_PERCENT = 18;
export const INLAND_GST_PERCENT = 18;
const MARGIN_INLAND = 0.08; // 8% hidden broker margin on base rate

export const ODA_SURCHARGE_ZONE_E = 100; // flat ₹100 for remote/NE/special

export const MIN_CHARGE: Record<InlandZone, number> = {
  A: 50,
  B: 70,
  C: 85,
  D: 110,
  E: 150,
};

// ─── Zone Definitions ──────────────────────────────────────────────────

export const INLAND_ZONES: Record<InlandZone, InlandZoneInfo> = {
  A: {
    label: 'Local / Same City',
    description: 'Same city as clearance port',
    distanceRange: '0–50 km',
    odaSurchargeINR: 0,
  },
  B: {
    label: 'Intra-State',
    description: 'Same state or nearby',
    distanceRange: '50–500 km',
    odaSurchargeINR: 0,
  },
  C: {
    label: 'Metro-to-Metro',
    description: 'Another metro city',
    distanceRange: '500–1,400 km',
    odaSurchargeINR: 0,
  },
  D: {
    label: 'Rest of India',
    description: 'Non-metro interstate',
    distanceRange: '1,400–2,500 km',
    odaSurchargeINR: 0,
  },
  E: {
    label: 'Remote / NE / Special',
    description: 'NE states, J&K, islands',
    distanceRange: '2,500+ km',
    odaSurchargeINR: ODA_SURCHARGE_ZONE_E,
  },
};

// ─── Clearance Port Definitions ────────────────────────────────────────

export const CLEARANCE_PORTS: ClearancePortInfo[] = [
  {
    name: 'Mumbai',
    code: 'BOM',
    zoneExamples: {
      A: 'Mumbai, Navi Mumbai, Thane',
      B: 'Pune, Nashik, Goa, rest of Maharashtra',
      C: 'Delhi, Bangalore, Chennai, Hyderabad, Kolkata',
      D: 'Jaipur, Lucknow, Patna, Bhopal',
      E: 'Guwahati, Imphal, Srinagar, Andaman',
    },
  },
  {
    name: 'Delhi',
    code: 'DEL',
    zoneExamples: {
      A: 'Delhi NCR, Gurgaon, Noida, Faridabad',
      B: 'Jaipur, Chandigarh, Lucknow, Agra',
      C: 'Mumbai, Bangalore, Chennai, Hyderabad, Kolkata',
      D: 'Kochi, Coimbatore, Vizag, Bhubaneswar',
      E: 'Guwahati, Imphal, Srinagar, Andaman',
    },
  },
  {
    name: 'Chennai',
    code: 'MAA',
    zoneExamples: {
      A: 'Chennai, Kanchipuram, Chengalpattu',
      B: 'Coimbatore, Madurai, Pondicherry, Bangalore',
      C: 'Mumbai, Delhi, Hyderabad, Kolkata',
      D: 'Jaipur, Lucknow, Patna, Chandigarh',
      E: 'Guwahati, Imphal, Srinagar, Andaman',
    },
  },
  {
    name: 'Bangalore',
    code: 'BLR',
    zoneExamples: {
      A: 'Bangalore, Electronic City, Whitefield',
      B: 'Mysore, Mangalore, Coimbatore, Chennai',
      C: 'Mumbai, Delhi, Hyderabad, Kolkata',
      D: 'Jaipur, Lucknow, Patna, Bhopal',
      E: 'Guwahati, Imphal, Srinagar, Andaman',
    },
  },
  {
    name: 'Hyderabad',
    code: 'HYD',
    zoneExamples: {
      A: 'Hyderabad, Secunderabad, Shamshabad',
      B: 'Vijayawada, Vizag, Warangal, Bangalore',
      C: 'Mumbai, Delhi, Chennai, Kolkata',
      D: 'Jaipur, Lucknow, Patna, Chandigarh',
      E: 'Guwahati, Imphal, Srinagar, Andaman',
    },
  },
  {
    name: 'Kolkata',
    code: 'CCU',
    zoneExamples: {
      A: 'Kolkata, Howrah, Salt Lake',
      B: 'Durgapur, Siliguri, Bhubaneswar, Patna',
      C: 'Mumbai, Delhi, Chennai, Hyderabad, Bangalore',
      D: 'Jaipur, Kochi, Coimbatore, Chandigarh',
      E: 'Imphal, Aizawl, Srinagar, Andaman',
    },
  },
];

// ─── Slab Rate Table (INR, before margin) ──────────────────────────────
// Each row: maxKg → zone rates. Weight is matched to the first slab where
// chargeable weight ≤ maxKg. For >10 kg, use 10 kg base + per-additional-kg.

interface SlabRow {
  maxKg: number;
  zones: Record<InlandZone, number>;
}

const slabRateTable: SlabRow[] = [
  { maxKg: 0.5, zones: { A: 35, B: 55, C: 70, D: 90, E: 120 } },
  { maxKg: 1,   zones: { A: 55, B: 80, C: 100, D: 130, E: 170 } },
  { maxKg: 2,   zones: { A: 90, B: 130, C: 170, D: 220, E: 300 } },
  { maxKg: 5,   zones: { A: 180, B: 270, C: 360, D: 480, E: 660 } },
  { maxKg: 10,  zones: { A: 330, B: 500, C: 680, D: 920, E: 1280 } },
];

// Per-additional-kg rate for shipments >10 kg (each extra 1 kg or part thereof)
const perAdditionalKg: Record<InlandZone, number> = {
  A: 28, B: 42, C: 58, D: 78, E: 110,
};

// ─── Calculation Function ──────────────────────────────────────────────

export function getInlandShippingCost(
  chargeableWeightKg: number,
  zone: InlandZone,
  clearancePort: ClearancePort,
): InlandCostResult {
  let rawBase: number;
  let weightSlab: string;

  if (chargeableWeightKg <= 10) {
    // Find the matching slab (first slab where weight ≤ maxKg)
    const row = slabRateTable.find(r => chargeableWeightKg <= r.maxKg)!;
    rawBase = row.zones[zone];
    weightSlab = `${row.maxKg} kg`;
  } else {
    // >10 kg: base 10kg rate + per-additional-kg for each extra kg (rounded up)
    const base10 = slabRateTable[slabRateTable.length - 1].zones[zone];
    const extraKg = Math.ceil(chargeableWeightKg - 10);
    rawBase = base10 + extraKg * perAdditionalKg[zone];
    weightSlab = `10 kg + ${extraKg} kg`;
  }

  // Apply minimum charge floor
  const minCharge = MIN_CHARGE[zone];
  if (rawBase < minCharge) {
    rawBase = minCharge;
  }

  // Apply hidden margin
  const baseFreightINR = rawBase * (1 + MARGIN_INLAND);

  // Fuel surcharge
  const fuelSurchargeINR = baseFreightINR * (INLAND_FUEL_SURCHARGE_PERCENT / 100);

  // ODA surcharge (Zone E only)
  const odaSurchargeINR = INLAND_ZONES[zone].odaSurchargeINR;

  // Subtotal
  const subtotalINR = baseFreightINR + fuelSurchargeINR + odaSurchargeINR;

  // GST
  const gstINR = subtotalINR * (INLAND_GST_PERCENT / 100);

  // Total
  const totalINR = subtotalINR + gstINR;

  // Effective per-kg rate (for display purposes)
  const perKgEffective = chargeableWeightKg > 0
    ? totalINR / chargeableWeightKg
    : 0;

  return {
    baseFreightINR: Math.round(baseFreightINR * 100) / 100,
    fuelSurchargeINR: Math.round(fuelSurchargeINR * 100) / 100,
    odaSurchargeINR,
    subtotalINR: Math.round(subtotalINR * 100) / 100,
    gstINR: Math.round(gstINR * 100) / 100,
    totalINR: Math.round(totalINR * 100) / 100,
    weightSlab,
    perKgEffective: Math.round(perKgEffective * 100) / 100,
    zone,
    clearancePort,
    chargeableWeight: chargeableWeightKg,
  };
}

// ─── Indian City → Zone Mapping ────────────────────────────────────────
// Each city has a zone per clearance port. Zone is determined by distance
// and connectivity from that port, not just straight-line km.

export interface IndianCity {
  name: string;
  state: string;
  zones: Record<ClearancePort, InlandZone>;
}

export const INDIAN_CITIES: IndianCity[] = [
  // ── Metros & Tier-1 ──
  { name: 'Mumbai',       state: 'Maharashtra',     zones: { Mumbai: 'A', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Navi Mumbai',  state: 'Maharashtra',     zones: { Mumbai: 'A', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Thane',        state: 'Maharashtra',     zones: { Mumbai: 'A', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Delhi',        state: 'Delhi',           zones: { Mumbai: 'C', Delhi: 'A', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Gurgaon',      state: 'Haryana',         zones: { Mumbai: 'C', Delhi: 'A', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Noida',        state: 'Uttar Pradesh',   zones: { Mumbai: 'C', Delhi: 'A', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Faridabad',    state: 'Haryana',         zones: { Mumbai: 'C', Delhi: 'A', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Ghaziabad',    state: 'Uttar Pradesh',   zones: { Mumbai: 'C', Delhi: 'A', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'C' } },
  { name: 'Chennai',      state: 'Tamil Nadu',      zones: { Mumbai: 'C', Delhi: 'C', Chennai: 'A', Bangalore: 'B', Hyderabad: 'B', Kolkata: 'C' } },
  { name: 'Bangalore',    state: 'Karnataka',       zones: { Mumbai: 'C', Delhi: 'C', Chennai: 'B', Bangalore: 'A', Hyderabad: 'B', Kolkata: 'C' } },
  { name: 'Hyderabad',    state: 'Telangana',       zones: { Mumbai: 'C', Delhi: 'C', Chennai: 'B', Bangalore: 'B', Hyderabad: 'A', Kolkata: 'C' } },
  { name: 'Kolkata',      state: 'West Bengal',     zones: { Mumbai: 'C', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'A' } },
  { name: 'Howrah',       state: 'West Bengal',     zones: { Mumbai: 'C', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'A' } },
  { name: 'Pune',         state: 'Maharashtra',     zones: { Mumbai: 'B', Delhi: 'C', Chennai: 'C', Bangalore: 'C', Hyderabad: 'C', Kolkata: 'D' } },
  { name: 'Ahmedabad',    state: 'Gujarat',         zones: { Mumbai: 'B', Delhi: 'C', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },

  // ── Tier-2 Cities ──
  { name: 'Jaipur',       state: 'Rajasthan',       zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Lucknow',      state: 'Uttar Pradesh',   zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Kanpur',       state: 'Uttar Pradesh',   zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Chandigarh',   state: 'Chandigarh',      zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Agra',         state: 'Uttar Pradesh',   zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Varanasi',     state: 'Uttar Pradesh',   zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Patna',        state: 'Bihar',           zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Indore',       state: 'Madhya Pradesh',  zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Bhopal',       state: 'Madhya Pradesh',  zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Nagpur',       state: 'Maharashtra',     zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'B', Kolkata: 'D' } },
  { name: 'Nashik',       state: 'Maharashtra',     zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Surat',        state: 'Gujarat',         zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Vadodara',     state: 'Gujarat',         zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Rajkot',       state: 'Gujarat',         zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Coimbatore',   state: 'Tamil Nadu',      zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Madurai',      state: 'Tamil Nadu',      zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Kochi',        state: 'Kerala',          zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Thiruvananthapuram', state: 'Kerala',    zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Mysore',       state: 'Karnataka',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Mangalore',    state: 'Karnataka',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Vijayawada',   state: 'Andhra Pradesh',  zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'D', Hyderabad: 'B', Kolkata: 'D' } },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'B', Kolkata: 'D' } },
  { name: 'Bhubaneswar',  state: 'Odisha',          zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Ranchi',       state: 'Jharkhand',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Raipur',       state: 'Chhattisgarh',    zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Dehradun',     state: 'Uttarakhand',     zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Amritsar',     state: 'Punjab',          zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Ludhiana',     state: 'Punjab',          zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Jodhpur',      state: 'Rajasthan',       zones: { Mumbai: 'D', Delhi: 'B', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Udaipur',      state: 'Rajasthan',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Goa',          state: 'Goa',             zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Pondicherry',  state: 'Puducherry',      zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Aurangabad',   state: 'Maharashtra',     zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Jabalpur',     state: 'Madhya Pradesh',  zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Allahabad',    state: 'Uttar Pradesh',   zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Siliguri',     state: 'West Bengal',     zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Durgapur',     state: 'West Bengal',     zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'D', Hyderabad: 'D', Kolkata: 'B' } },
  { name: 'Warangal',     state: 'Telangana',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'D', Hyderabad: 'B', Kolkata: 'D' } },
  { name: 'Tirupati',     state: 'Andhra Pradesh',  zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'B', Kolkata: 'D' } },
  { name: 'Hubli',        state: 'Karnataka',       zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'D', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Belgaum',      state: 'Karnataka',       zones: { Mumbai: 'B', Delhi: 'D', Chennai: 'D', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Salem',        state: 'Tamil Nadu',      zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },
  { name: 'Trichy',       state: 'Tamil Nadu',      zones: { Mumbai: 'D', Delhi: 'D', Chennai: 'B', Bangalore: 'B', Hyderabad: 'D', Kolkata: 'D' } },

  // ── NE / Remote / Special (Zone E) ──
  { name: 'Guwahati',     state: 'Assam',           zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'D' } },
  { name: 'Imphal',       state: 'Manipur',         zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Shillong',     state: 'Meghalaya',       zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Aizawl',       state: 'Mizoram',         zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Agartala',     state: 'Tripura',         zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Dibrugarh',    state: 'Assam',           zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Itanagar',     state: 'Arunachal Pradesh', zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Kohima',       state: 'Nagaland',        zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Gangtok',      state: 'Sikkim',          zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Srinagar',     state: 'Jammu & Kashmir', zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Jammu',        state: 'Jammu & Kashmir', zones: { Mumbai: 'E', Delhi: 'D', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Leh',          state: 'Ladakh',          zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
  { name: 'Port Blair',   state: 'Andaman & Nicobar', zones: { Mumbai: 'E', Delhi: 'E', Chennai: 'E', Bangalore: 'E', Hyderabad: 'E', Kolkata: 'E' } },
];

// ─── City Search & Zone Lookup ─────────────────────────────────────────

/** Search cities by name (case-insensitive), returns top 8 matches */
export function searchIndianCities(query: string): IndianCity[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return INDIAN_CITIES
    .filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q))
    .slice(0, 8);
}

/** Get zone for a city from a given clearance port */
export function getCityZone(cityName: string, port: ClearancePort): InlandZone | null {
  const city = INDIAN_CITIES.find(c => c.name === cityName);
  return city ? city.zones[port] : null;
}
