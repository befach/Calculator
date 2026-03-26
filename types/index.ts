// Re-export all types from their source files for easy access
// Usage: import type { CalculationInput, InlandZone, ... } from '@/calculator-kit/types'

// Core calculator types
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
} from '../core/calculatorUtils';

// DHL rate types
export type { countryZones } from '../core/dhlRates';

// Inland shipping types
export type {
  InlandZone,
  ClearancePort,
  InlandZoneInfo,
  ClearancePortInfo,
  InlandCostResult,
  IndianCity,
} from '../core/inlandRates';

// History & storage types
export type {
  CalculationInput as HistoryCalculationInput,
  CalculationResult as HistoryCalculationResult,
  CalculationMetadata,
  CalculationRecord,
  QueryOptions,
  FilterCriteria,
  HistoryStats,
} from '../storage/historyStorage';
