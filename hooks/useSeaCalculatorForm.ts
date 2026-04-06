'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  calculateSeaFreightLandedCost,
  type SeaFreightInput,
  type SeaFreightResult,
  type ClearancePort,
  type ShippingMode,
  type ContainerType,
  type SeaPort,
  exchangeRates,
  getDutyRates,
} from '@/lib/calculateSea';
import { fetchExchangeRate } from '@/core/calculatorUtils';
import { importCountryZones } from '@/core/dhlImportRates';
import { SEA_PORT_TO_CLEARANCE_PORT } from '@/core/seaFreightRates';

// ─── Product Item (same as air) ─────────────────────────────────────────

export interface SeaProductItem {
  id: string;
  isExpanded: boolean;

  productName: string;
  hsnCode: string;
  bcdRate: number;
  igstRate: number;

  unitPrice: number;
  quantity: number;
  fobValue: number;

  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;

  // Derived
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
}

function createDefaultProduct(): SeaProductItem {
  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    isExpanded: true,
    productName: '',
    hsnCode: '',
    bcdRate: 0,
    igstRate: 18,
    unitPrice: 0,
    quantity: 1,
    fobValue: 0,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    actualWeightKg: 0,
    numPackages: 1,
    volumetricWeight: 0,
    grossWeight: 0,
    chargeableWeight: 0,
    cbm: 0,
  };
}

// ─── State ──────────────────────────────────────────────────────────────

export interface SeaCalculatorFormState {
  currentStep: number; // 0, 1, 2, 3

  // Step 0: Route & Currency
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource: 'static' | 'live' | 'loading';

  // Step 1: Shipping Mode & Port
  shippingMode: ShippingMode | '';
  containerType: ContainerType | '';
  numberOfContainers: number;
  destinationSeaPort: SeaPort | '';

  // Step 2: Products
  products: SeaProductItem[];

  // Step 3: Charges & Delivery
  userFreightCostINR: number;
  thcOrigin: number;
  thcDestination: number;
  blFee: number;
  doCharges: number;
  cfsCharges: number;
  customExamination: number;
  demurrageDays: number;
  detentionDays: number;

  includeInlandDelivery: boolean;
  clearancePort: ClearancePort | '';
  destinationCity: string;
  inlandZone: 'A' | 'B' | 'C' | 'D' | 'E' | '';

  // Results
  result: SeaFreightResult | null;
  isCalculating: boolean;
  error: string | null;
}

const initialState: SeaCalculatorFormState = {
  currentStep: 0,

  originCountryCode: '',
  currency: '',
  exchangeRate: 0,
  exchangeRateSource: 'static' as const,

  shippingMode: '',
  containerType: '',
  numberOfContainers: 1,
  destinationSeaPort: '',

  products: [createDefaultProduct()],

  userFreightCostINR: 0,
  thcOrigin: -1, // -1 means use default
  thcDestination: -1,
  blFee: -1,
  doCharges: -1,
  cfsCharges: -1,
  customExamination: -1,
  demurrageDays: 0,
  detentionDays: 0,

  includeInlandDelivery: false,
  clearancePort: '',
  destinationCity: '',
  inlandZone: '',

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
  | { type: 'CALCULATE_SUCCESS'; result: SeaFreightResult }
  | { type: 'CALCULATE_ERROR'; error: string }
  | { type: 'VALIDATION_ERROR'; error: string }
  | { type: 'SET_RATE_LOADING' }
  | { type: 'SET_RATE_LIVE'; rate: number }
  | { type: 'SET_RATE_FALLBACK' }
  | { type: 'ADD_PRODUCT' }
  | { type: 'REMOVE_PRODUCT'; productId: string }
  | { type: 'DUPLICATE_PRODUCT'; productId: string }
  | { type: 'SET_PRODUCT_FIELD'; productId: string; field: string; value: unknown }
  | { type: 'TOGGLE_PRODUCT_EXPANDED'; productId: string }
  | { type: 'RESET' };

// ─── Derived calculations ───────────────────────────────────────────────

function computeProductDerived(product: SeaProductItem): SeaProductItem {
  const p = { ...product };

  if (p.unitPrice > 0 && p.quantity > 0) {
    p.fobValue = Math.round(p.unitPrice * p.quantity * 100) / 100;
  }

  if (p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0) {
    p.cbm = Math.round((p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.numPackages * 1000000) / 1000000;
    p.volumetricWeight = Math.round((p.lengthCm * p.widthCm * p.heightCm / 6000) * p.numPackages * 100) / 100;
  } else {
    p.cbm = 0;
    p.volumetricWeight = 0;
  }

  p.grossWeight = Math.round(p.actualWeightKg * p.numPackages * 100) / 100;
  p.chargeableWeight = Math.max(p.grossWeight, p.volumetricWeight);

  return p;
}

// ─── Reducer ────────────────────────────────────────────────────────────

function reducer(state: SeaCalculatorFormState, action: Action): SeaCalculatorFormState {
  switch (action.type) {
    case 'SET_FIELD': {
      const newState = { ...state, [action.field]: action.value, error: null };

      // Auto-fill exchange rate when currency changes
      if (action.field === 'currency') {
        const curr = action.value as string;
        if (exchangeRates[curr]) {
          newState.exchangeRate = exchangeRates[curr];
        }
        newState.exchangeRateSource = 'loading';
      }

      // Auto-suggest clearance port when sea port changes
      if (action.field === 'destinationSeaPort') {
        const seaPort = action.value as SeaPort;
        if (seaPort && SEA_PORT_TO_CLEARANCE_PORT[seaPort]) {
          newState.clearancePort = SEA_PORT_TO_CLEARANCE_PORT[seaPort];
        }
      }

      return newState;
    }

    case 'ADD_PRODUCT': {
      const newProduct = createDefaultProduct();
      const products = state.products.map(p => ({ ...p, isExpanded: false }));
      products.push(newProduct);
      return { ...state, products, error: null };
    }

    case 'REMOVE_PRODUCT': {
      if (state.products.length <= 1) return state;
      const products = state.products.filter(p => p.id !== action.productId);
      if (!products.some(p => p.isExpanded) && products.length > 0) {
        products[products.length - 1] = { ...products[products.length - 1], isExpanded: true };
      }
      return { ...state, products, error: null };
    }

    case 'DUPLICATE_PRODUCT': {
      const sourceIdx = state.products.findIndex(p => p.id === action.productId);
      if (sourceIdx === -1) return state;
      const source = state.products[sourceIdx];
      const clone: SeaProductItem = {
        ...source,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        isExpanded: true,
        productName: source.productName ? `${source.productName} (copy)` : '',
      };
      const products = state.products.map(p => ({ ...p, isExpanded: false }));
      products.splice(sourceIdx + 1, 0, clone);
      return { ...state, products, error: null };
    }

    case 'SET_PRODUCT_FIELD': {
      const products = state.products.map(p => {
        if (p.id !== action.productId) return p;

        const updated = { ...p, [action.field]: action.value };

        if (action.field === 'hsnCode') {
          const hsn = action.value as string;
          if (hsn && hsn.length >= 2) {
            const rates = getDutyRates(hsn);
            if (rates) {
              updated.bcdRate = rates.bcd;
              updated.igstRate = rates.igst;
            }
          }
        }

        return computeProductDerived(updated);
      });
      return { ...state, products, error: null };
    }

    case 'TOGGLE_PRODUCT_EXPANDED': {
      const products = state.products.map(p => ({
        ...p,
        isExpanded: p.id === action.productId ? !p.isExpanded : false,
      }));
      return { ...state, products };
    }

    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 3) };
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
      return { ...initialState, products: [createDefaultProduct()] };
    default:
      return state;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────

export function validateSeaStep(state: SeaCalculatorFormState, step: number): string | null {
  switch (step) {
    case 0:
      if (!state.originCountryCode) return 'Please select an origin country';
      if (!state.currency) return 'Please select a currency';
      if (state.exchangeRate <= 0) return 'Exchange rate must be greater than 0';
      return null;
    case 1:
      if (!state.shippingMode) return 'Please select a shipping mode (FCL or LCL)';
      if (state.shippingMode === 'FCL' && !state.containerType) return 'Please select a container type';
      if (!state.destinationSeaPort) return 'Please select a destination sea port';
      return null;
    case 2: {
      if (state.products.length === 0) return 'Please add at least one product';
      for (let i = 0; i < state.products.length; i++) {
        const p = state.products[i];
        const label = state.products.length > 1 ? `Product ${i + 1}: ` : '';
        if (!p.hsnCode) return `${label}Please enter an HSN code`;
        if (p.bcdRate < 0) return `${label}BCD rate cannot be negative`;
        if (p.igstRate < 0) return `${label}IGST rate cannot be negative`;
        if (p.quantity <= 0) return `${label}Please enter the quantity`;
        if (p.lengthCm <= 0) return `${label}Please enter package length`;
        if (p.widthCm <= 0) return `${label}Please enter package width`;
        if (p.heightCm <= 0) return `${label}Please enter package height`;
        if (p.actualWeightKg <= 0) return `${label}Please enter actual weight`;
        if (p.numPackages <= 0) return `${label}Please enter number of packages`;
      }
      return null;
    }
    case 3:
      if (state.includeInlandDelivery) {
        if (!state.clearancePort) return 'Please select a clearance port';
        if (!state.inlandZone) return 'Please select a delivery region';
      }
      return null;
    default:
      return null;
  }
}

// ─── Build Input Helper ────────────────────────────────────────────────

const VALID_PORTS: ClearancePort[] = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata'];
const VALID_ZONES = ['A', 'B', 'C', 'D', 'E'] as const;

function buildSeaFreightInput(state: SeaCalculatorFormState): SeaFreightInput {
  return {
    originCountryCode: state.originCountryCode,
    currency: state.currency,
    exchangeRateOverride: state.exchangeRate,

    shippingMode: state.shippingMode as ShippingMode,
    containerType: state.containerType as ContainerType || undefined,
    numberOfContainers: state.numberOfContainers || 1,
    destinationSeaPort: state.destinationSeaPort as SeaPort,

    products: state.products.map(p => ({
      productName: p.productName,
      hsnCode: p.hsnCode,
      bcdRateOverride: p.bcdRate,
      igstRateOverride: p.igstRate,
      unitPrice: p.unitPrice,
      quantity: p.quantity,
      fobValue: p.fobValue > 0 ? p.fobValue : p.unitPrice * p.quantity,
      lengthCm: p.lengthCm,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      actualWeightKg: p.actualWeightKg,
      numPackages: p.numPackages,
    })),

    userFreightCostINR: state.userFreightCostINR > 0 ? state.userFreightCostINR : undefined,

    thcOriginOverride: state.thcOrigin >= 0 ? state.thcOrigin : undefined,
    thcDestinationOverride: state.thcDestination >= 0 ? state.thcDestination : undefined,
    blFeeOverride: state.blFee >= 0 ? state.blFee : undefined,
    doChargesOverride: state.doCharges >= 0 ? state.doCharges : undefined,
    cfsChargesOverride: state.cfsCharges >= 0 ? state.cfsCharges : undefined,
    customExaminationOverride: state.customExamination >= 0 ? state.customExamination : undefined,
    demurrageDays: state.demurrageDays > 0 ? state.demurrageDays : undefined,
    detentionDays: state.detentionDays > 0 ? state.detentionDays : undefined,

    includeInlandDelivery: state.includeInlandDelivery,
    destinationCity: state.destinationCity || undefined,
    clearancePort: VALID_PORTS.includes(state.clearancePort as ClearancePort) ? (state.clearancePort as ClearancePort) : undefined,
    inlandZone: VALID_ZONES.includes(state.inlandZone as typeof VALID_ZONES[number]) ? (state.inlandZone as 'A' | 'B' | 'C' | 'D' | 'E') : undefined,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────

export function useSeaCalculatorForm() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Auto-calculate when all required fields are valid (debounced)
  useEffect(() => {
    const step0Error = validateSeaStep(state, 0);
    const step1Error = validateSeaStep(state, 1);
    const step2Error = validateSeaStep(state, 2);
    const step3Error = validateSeaStep(state, 3);

    if (step0Error || step1Error || step2Error || step3Error) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      try {
        const input = buildSeaFreightInput(state);
        const result = calculateSeaFreightLandedCost(input);
        dispatch({ type: 'CALCULATE_SUCCESS', result });
      } catch {
        // Silently ignore auto-calc errors
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.originCountryCode, state.currency, state.exchangeRate,
    state.shippingMode, state.containerType, state.numberOfContainers,
    state.destinationSeaPort, state.products,
    state.userFreightCostINR, state.thcOrigin, state.thcDestination,
    state.blFee, state.doCharges, state.cfsCharges, state.customExamination,
    state.demurrageDays, state.detentionDays,
    state.includeInlandDelivery, state.clearancePort,
    state.destinationCity, state.inlandZone,
  ]);

  const setField = useCallback((field: string, value: unknown) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const addProduct = useCallback(() => {
    dispatch({ type: 'ADD_PRODUCT' });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', productId });
  }, []);

  const duplicateProduct = useCallback((productId: string) => {
    dispatch({ type: 'DUPLICATE_PRODUCT', productId });
  }, []);

  const setProductField = useCallback((productId: string, field: string, value: unknown) => {
    dispatch({ type: 'SET_PRODUCT_FIELD', productId, field, value });
  }, []);

  const toggleProductExpanded = useCallback((productId: string) => {
    dispatch({ type: 'TOGGLE_PRODUCT_EXPANDED', productId });
  }, []);

  const nextStep = useCallback(() => {
    const error = validateSeaStep(state, state.currentStep);
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
    for (let i = 0; i <= 3; i++) {
      const error = validateSeaStep(state, i);
      if (error) {
        dispatch({ type: 'VALIDATION_ERROR', error });
        return;
      }
    }

    dispatch({ type: 'CALCULATE_START' });

    try {
      const input = buildSeaFreightInput(state);
      const result = calculateSeaFreightLandedCost(input);
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
    addProduct,
    removeProduct,
    duplicateProduct,
    setProductField,
    toggleProductExpanded,
    nextStep,
    prevStep,
    goToStep,
    calculate,
    reset,
    validateStep: (step: number) => validateSeaStep(state, step),
  };
}
