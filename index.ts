// ═══════════════════════════════════════════════════════════════════
// Befach Calculator Kit — Standalone Calculation Engine
// ═══════════════════════════════════════════════════════════════════
//
// This folder is a self-contained package. You can copy it into any
// React/Next.js project and import what you need:
//
//   import { getDHLFreight, searchHSNCodes, calculateLandedCost } from '@/calculator-kit';
//
// Core functions (calculatorUtils, dhlRates, inlandRates) have ZERO
// npm dependencies — they work in any JavaScript environment.
//
// Optional: PackageDimensions component needs framer-motion + lucide-react.
// Optional: Storage layer needs a browser environment (localStorage).
// ═══════════════════════════════════════════════════════════════════

// ─── Core Calculation Functions ──────────────────────────────────
export {
  getDutyRates,
  calculateFreight,
  calculateInsurance,
  calculateCIF,
  calculateBasicCustomsDuty,
  calculateSocialWelfareSurcharge,
  calculateIGST,
  calculateLandedCost,
  calculateQuote,
  getAvailableCurrencies,
  getShippingMethods,
  saveCalculation,
  getSavedCalculations,
  clearCalculationHistory,
  searchHSNCodes,
} from './core/calculatorUtils';

// ─── DHL Express Rates ───────────────────────────────────────────
export {
  countryZones,
  dhlRateTable,
  dhlMultiplierRates,
  DHL_FUEL_SURCHARGE_PERCENT,
  DHL_DTP_PERCENT,
  DHL_DTP_MINIMUM_INR,
  getDHLFreight,
  getVolumetricWeight,
  getChargeableWeight,
} from './core/dhlRates';

// ─── Inland / Last-Mile Delivery ─────────────────────────────────
export {
  INLAND_FUEL_SURCHARGE_PERCENT,
  INLAND_GST_PERCENT,
  ODA_SURCHARGE_ZONE_E,
  MIN_CHARGE,
  INLAND_ZONES,
  CLEARANCE_PORTS,
  INDIAN_CITIES,
  getInlandShippingCost,
  searchIndianCities,
  getCityZone,
} from './core/inlandRates';

// ─── Storage (optional — only needed for history/persistence) ────
export { safeStorage, safeSessionStorage } from './storage/safeStorage';
export { historyStorage } from './storage/historyStorage';

// ─── Types ───────────────────────────────────────────────────────
export type {
  CalculationInput,
  CalculationResult,
  QuoteProductInput,
  QuoteShippingInput,
  QuoteServiceInput,
  QuoteInput,
  QuoteProductResult,
  QuoteServiceResult,
  QuoteFinalBreakup,
  QuoteResult,
} from './core/calculatorUtils';

export type {
  InlandZone,
  ClearancePort,
  InlandZoneInfo,
  ClearancePortInfo,
  InlandCostResult,
  IndianCity,
} from './core/inlandRates';

export type {
  CalculationMetadata,
  CalculationRecord,
  QueryOptions,
  FilterCriteria,
  HistoryStats,
} from './storage/historyStorage';

// ─── UI Components (optional — needs framer-motion + lucide-react) ─
export { default as PackageDimensions } from './components/PackageDimensions';
