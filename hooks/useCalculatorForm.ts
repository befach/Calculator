'use client';

import { useReducer, useCallback, useEffect } from 'react';
import {
  calculateAirFreightLandedCost,
  type AirFreightInput,
  type AirFreightResult,
  type ClearancePort,
  exchangeRates,
  getDutyRates,
} from '@/lib/calculate';
import { fetchExchangeRate } from '@/core/calculatorUtils';
import { getVolumetricWeight, getChargeableWeight } from '@/core/dhlRates';
import { importCountryZones } from '@/core/dhlImportRates';

// ─── State ──────────────────────────────────────────────────────────────

export interface CalculatorFormState {
  currentStep: number; // 0, 1, 2

  // Step 1: Route & Currency
  originCountryCode: string;
  currency: string;
  exchangeRate: number;

  // Step 2: HSN & Duties
  hsnCode: string;
  bcdRate: number;
  igstRate: number;

  // Step 3: Package Details
  productName: string;
  unitPrice: number;
  quantity: number;
  fobValue: number; // auto-calc: unitPrice * quantity
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;

  // Inland Delivery (optional, part of Step 3)
  includeInlandDelivery: boolean;
  clearancePort: ClearancePort | '';
  destinationCity: string;
  inlandZone: 'A' | 'B' | 'C' | 'D' | 'E' | '';

  // Derived
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  dhlZone: number | null;

  // Exchange rate source
  exchangeRateSource: 'static' | 'live' | 'loading';

  // Results
  result: AirFreightResult | null;
  isCalculating: boolean;
  error: string | null;
}

const initialState: CalculatorFormState = {
  currentStep: 0,

  // Step 1
  originCountryCode: '',
  currency: '',
  exchangeRate: 0,

  // Step 2
  hsnCode: '',
  bcdRate: 0,
  igstRate: 18,

  // Step 3
  productName: '',
  unitPrice: 0,
  quantity: 1,
  fobValue: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  actualWeightKg: 0,
  numPackages: 1,

  // Inland
  includeInlandDelivery: false,
  clearancePort: '',
  destinationCity: '',
  inlandZone: '',

  // Derived
  volumetricWeight: 0,
  grossWeight: 0,
  chargeableWeight: 0,
  cbm: 0,
  dhlZone: null,

  // Exchange rate source
  exchangeRateSource: 'static' as const,

  // Results
  result: null,
  isCalculating: false,
  error: null,
};

// ─── Actions ────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'CALCULATE_START' }
  | { type: 'CALCULATE_SUCCESS'; result: AirFreightResult }
  | { type: 'CALCULATE_ERROR'; error: string }
  | { type: 'VALIDATION_ERROR'; error: string }
  | { type: 'SET_RATE_LOADING' }
  | { type: 'SET_RATE_LIVE'; rate: number }
  | { type: 'SET_RATE_FALLBACK' }
  | { type: 'RESET' };

// ─── Derived calculations ───────────────────────────────────────────────

function computeDerived(state: CalculatorFormState): Partial<CalculatorFormState> {
  const derived: Partial<CalculatorFormState> = {};

  // FOB = unitPrice * quantity
  if (state.unitPrice > 0 && state.quantity > 0) {
    derived.fobValue = Math.round(state.unitPrice * state.quantity * 100) / 100;
  } else {
    derived.fobValue = state.fobValue; // keep manual entry if unitPrice is 0
  }

  // Weight calculations
  if (state.lengthCm > 0 && state.widthCm > 0 && state.heightCm > 0) {
    const singleVol = getVolumetricWeight(state.lengthCm, state.widthCm, state.heightCm);
    derived.volumetricWeight = Math.round(singleVol * state.numPackages * 100) / 100;
    derived.cbm = Math.round((state.lengthCm * state.widthCm * state.heightCm / 1_000_000) * state.numPackages * 1000000) / 1000000;
  } else {
    derived.volumetricWeight = 0;
    derived.cbm = 0;
  }

  derived.grossWeight = Math.round(state.actualWeightKg * state.numPackages * 100) / 100;
  derived.chargeableWeight = derived.volumetricWeight > 0 || derived.grossWeight > 0
    ? getChargeableWeight(derived.grossWeight, derived.volumetricWeight)
    : 0;

  // DHL Zone
  if (state.originCountryCode && importCountryZones[state.originCountryCode]) {
    derived.dhlZone = importCountryZones[state.originCountryCode].zone;
  } else {
    derived.dhlZone = null;
  }

  // Auto-fill exchange rate when currency changes
  // (only if the field being set IS currency — handled in reducer)

  return derived;
}

// ─── Reducer ────────────────────────────────────────────────────────────

function reducer(state: CalculatorFormState, action: Action): CalculatorFormState {
  switch (action.type) {
    case 'SET_FIELD': {
      const newState = { ...state, [action.field]: action.value, error: null };

      // Auto-fill exchange rate when currency changes (use static as immediate fallback)
      if (action.field === 'currency') {
        const curr = action.value as string;
        if (exchangeRates[curr]) {
          newState.exchangeRate = exchangeRates[curr];
        }
        newState.exchangeRateSource = 'loading';
      }

      // Auto-fill duty rates when HSN changes
      if (action.field === 'hsnCode') {
        const hsn = action.value as string;
        if (hsn && hsn.length >= 2) {
          const rates = getDutyRates(hsn);
          if (rates) {
            newState.bcdRate = rates.bcd;
            newState.igstRate = rates.igst;
          }
        }
      }

      return { ...newState, ...computeDerived(newState) };
    }
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 2) };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case 'CALCULATE_START':
      return { ...state, isCalculating: true, error: null };
    case 'CALCULATE_SUCCESS':
      return { ...state, isCalculating: false, result: action.result };
    case 'CALCULATE_ERROR':
      return { ...state, isCalculating: false, error: action.error };
    case 'VALIDATION_ERROR':
      return { ...state, error: action.error };
    case 'SET_RATE_LOADING':
      return { ...state, exchangeRateSource: 'loading' as const };
    case 'SET_RATE_LIVE':
      return { ...state, exchangeRate: action.rate, exchangeRateSource: 'live' as const };
    case 'SET_RATE_FALLBACK':
      return { ...state, exchangeRateSource: 'static' as const };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────

export function validateStep(state: CalculatorFormState, step: number): string | null {
  switch (step) {
    case 0: // Route & Currency
      if (!state.originCountryCode) return 'Please select an origin country';
      if (!state.currency) return 'Please select a currency';
      if (state.exchangeRate <= 0) return 'Exchange rate must be greater than 0';
      return null;
    case 1: // HSN & Duties
      if (!state.hsnCode) return 'Please enter an HSN code';
      if (state.bcdRate < 0) return 'BCD rate cannot be negative';
      if (state.igstRate < 0) return 'IGST rate cannot be negative';
      return null;
    case 2: // Package Details
      if (state.quantity <= 0) return 'Please enter the quantity';
      if (state.lengthCm <= 0) return 'Please enter package length';
      if (state.widthCm <= 0) return 'Please enter package width';
      if (state.heightCm <= 0) return 'Please enter package height';
      if (state.actualWeightKg <= 0) return 'Please enter actual weight';
      if (state.numPackages <= 0) return 'Please enter number of packages';
      if (state.includeInlandDelivery) {
        if (!state.clearancePort) return 'Please select a clearance port';
        if (!state.inlandZone) return 'Please select a delivery region';
      }
      return null;
    default:
      return null;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useCalculatorForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch live exchange rate when currency changes
  useEffect(() => {
    if (state.exchangeRateSource !== 'loading') return;
    let cancelled = false;

    fetchExchangeRate(state.currency).then((rate) => {
      if (cancelled) return;
      if (rate !== null) {
        dispatch({ type: 'SET_RATE_LIVE', rate });
      } else {
        dispatch({ type: 'SET_RATE_FALLBACK' });
      }
    });

    return () => { cancelled = true; };
  }, [state.currency, state.exchangeRateSource]);

  const setField = useCallback((field: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const nextStep = useCallback(() => {
    const error = validateStep(state, state.currentStep);
    if (error) {
      dispatch({ type: 'VALIDATION_ERROR', error });
      return false;
    }
    dispatch({ type: 'NEXT_STEP' });
    return true;
  }, [state]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const calculate = useCallback(() => {
    // Validate all steps
    for (let i = 0; i <= 2; i++) {
      const error = validateStep(state, i);
      if (error) {
        dispatch({ type: 'VALIDATION_ERROR', error });
        return;
      }
    }

    dispatch({ type: 'CALCULATE_START' });

    const validPorts: ClearancePort[] = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata'];
    const validZones = ['A', 'B', 'C', 'D', 'E'] as const;

    try {
      const input: AirFreightInput = {
        originCountryCode: state.originCountryCode,
        lengthCm: state.lengthCm,
        widthCm: state.widthCm,
        heightCm: state.heightCm,
        actualWeightKg: state.actualWeightKg,
        numPackages: state.numPackages,
        hsnCode: state.hsnCode,
        fobValue: state.fobValue > 0 ? state.fobValue : state.unitPrice * state.quantity,
        currency: state.currency,
        quantity: state.quantity,
        unitPrice: state.unitPrice,
        productName: state.productName,

        // Overrides
        exchangeRateOverride: state.exchangeRate,
        bcdRateOverride: state.bcdRate,
        igstRateOverride: state.igstRate,

        // Inland (validated before casting)
        includeInlandDelivery: state.includeInlandDelivery,
        destinationCity: state.destinationCity || undefined,
        clearancePort: validPorts.includes(state.clearancePort as ClearancePort) ? (state.clearancePort as ClearancePort) : undefined,
        inlandZone: validZones.includes(state.inlandZone as typeof validZones[number]) ? (state.inlandZone as 'A' | 'B' | 'C' | 'D' | 'E') : undefined,
      };

      const result = calculateAirFreightLandedCost(input);
      dispatch({ type: 'CALCULATE_SUCCESS', result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation failed';
      dispatch({ type: 'CALCULATE_ERROR', error: message });
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setField,
    nextStep,
    prevStep,
    goToStep,
    calculate,
    reset,
    validateStep: (step: number) => validateStep(state, step),
  };
}
