'use client';

import { useReducer, useCallback, useEffect } from 'react';
import {
  calculateMultiProductLandedCost,
  type MultiProductInput,
  type MultiProductResult,
  type ClearancePort,
  exchangeRates,
  getDutyRates,
} from '@/lib/calculate';
import { fetchExchangeRate } from '@/core/calculatorUtils';
import { getVolumetricWeight, getChargeableWeight } from '@/core/dhlRates';
import { importCountryZones } from '@/core/dhlImportRates';
import { calculatePacking, type PackingResult } from '@/core/packingCalculator';

// ─── Product Item ────────────────────────────────────────────────────────

export interface ProductItem {
  id: string;
  isExpanded: boolean;

  // HSN & Duties
  productName: string;
  hsnCode: string;
  bcdRate: number;
  igstRate: number;

  // Product Info
  unitPrice: number;
  quantity: number;
  fobValue: number; // derived: unitPrice * quantity

  // Dimensions & Weight
  dimensionMode: 'box' | 'product';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;

  // Derived per-product
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;

  // Packing estimate (only when dimensionMode === 'product')
  packingResult: PackingResult | null;
  packingError: string | null;
}

function createDefaultProduct(): ProductItem {
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
    dimensionMode: 'box',
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    actualWeightKg: 0,
    numPackages: 1,
    volumetricWeight: 0,
    grossWeight: 0,
    chargeableWeight: 0,
    cbm: 0,
    packingResult: null,
    packingError: null,
  };
}

// ─── State ──────────────────────────────────────────────────────────────

export interface CalculatorFormState {
  currentStep: number; // 0, 1, 2

  // Step 0: Route & Currency (shared)
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource: 'static' | 'live' | 'loading';
  dhlZone: number | null;

  // Step 1: Products
  products: ProductItem[];

  // Step 2: Inland Delivery (shared)
  includeInlandDelivery: boolean;
  clearancePort: ClearancePort | '';
  destinationCity: string;
  inlandZone: 'A' | 'B' | 'C' | 'D' | 'E' | '';

  // Optional user-provided air freight cost (INR, before GST)
  userFreightCostINR: number;

  // Results
  result: MultiProductResult | null;
  isCalculating: boolean;
  error: string | null;
}

const initialState: CalculatorFormState = {
  currentStep: 0,

  // Step 0
  originCountryCode: '',
  currency: '',
  exchangeRate: 0,
  exchangeRateSource: 'static' as const,
  dhlZone: null,

  // Step 1: Products
  products: [createDefaultProduct()],

  // Step 2: Inland
  includeInlandDelivery: false,
  clearancePort: '',
  destinationCity: '',
  inlandZone: '',
  userFreightCostINR: 0,

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
  | { type: 'CALCULATE_SUCCESS'; result: MultiProductResult }
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

function computeProductDerived(product: ProductItem): ProductItem {
  const p = { ...product };

  // FOB = unitPrice * quantity
  if (p.unitPrice > 0 && p.quantity > 0) {
    p.fobValue = Math.round(p.unitPrice * p.quantity * 100) / 100;
  }

  // Weight calculations — depends on dimension mode
  if (p.dimensionMode === 'product') {
    // Product dimensions mode: auto-calculate packing
    p.packingResult = null;
    p.packingError = null;

    if (p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0 && p.quantity > 0) {
      const result = calculatePacking(p.lengthCm, p.widthCm, p.heightCm, p.actualWeightKg, p.quantity);
      if (result) {
        p.packingResult = result;
        p.numPackages = result.totalBoxes;
        const boxL = result.box.lengthCm;
        const boxW = result.box.widthCm;
        const boxH = result.box.heightCm;
        const singleVol = getVolumetricWeight(boxL, boxW, boxH);
        p.volumetricWeight = Math.round(singleVol * result.totalBoxes * 100) / 100;
        p.cbm = Math.round((boxL * boxW * boxH / 1_000_000) * result.totalBoxes * 1000000) / 1000000;
        p.grossWeight = Math.round(result.totalEstimatedWeightKg * 100) / 100;
        p.chargeableWeight = getChargeableWeight(p.grossWeight, p.volumetricWeight);
      } else {
        p.packingError = 'Product is too large for standard boxes. Please use package dimensions mode.';
        p.numPackages = 0;
        p.volumetricWeight = 0;
        p.cbm = 0;
        p.grossWeight = 0;
        p.chargeableWeight = 0;
      }
    } else {
      p.volumetricWeight = 0;
      p.cbm = 0;
      p.grossWeight = 0;
      p.chargeableWeight = 0;
    }
  } else {
    // Box dimensions mode: existing logic
    p.packingResult = null;
    p.packingError = null;

    if (p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0) {
      const singleVol = getVolumetricWeight(p.lengthCm, p.widthCm, p.heightCm);
      p.volumetricWeight = Math.round(singleVol * p.numPackages * 100) / 100;
      p.cbm = Math.round((p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.numPackages * 1000000) / 1000000;
    } else {
      p.volumetricWeight = 0;
      p.cbm = 0;
    }

    p.grossWeight = Math.round(p.actualWeightKg * p.numPackages * 100) / 100;
    p.chargeableWeight = p.volumetricWeight > 0 || p.grossWeight > 0
      ? getChargeableWeight(p.grossWeight, p.volumetricWeight)
      : 0;
  }

  return p;
}

function computeSharedDerived(state: CalculatorFormState): Partial<CalculatorFormState> {
  const derived: Partial<CalculatorFormState> = {};

  if (state.originCountryCode && importCountryZones[state.originCountryCode]) {
    derived.dhlZone = importCountryZones[state.originCountryCode].zone;
  } else {
    derived.dhlZone = null;
  }

  return derived;
}

// ─── Reducer ────────────────────────────────────────────────────────────

function reducer(state: CalculatorFormState, action: Action): CalculatorFormState {
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

      return { ...newState, ...computeSharedDerived(newState) };
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
      const clone: ProductItem = {
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

        // Auto-fill duty rates when HSN changes
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
      return { ...initialState, products: [createDefaultProduct()] };
    default:
      return state;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────

export function validateStep(state: CalculatorFormState, step: number): string | null {
  switch (step) {
    case 0:
      if (!state.originCountryCode) return 'Please select an origin country';
      if (!state.currency) return 'Please select a currency';
      if (state.exchangeRate <= 0) return 'Exchange rate must be greater than 0';
      return null;
    case 1: {
      if (state.products.length === 0) return 'Please add at least one product';
      for (let i = 0; i < state.products.length; i++) {
        const p = state.products[i];
        const label = state.products.length > 1 ? `Product ${i + 1}: ` : '';
        if (!p.hsnCode) return `${label}Please enter an HSN code`;
        if (p.bcdRate < 0) return `${label}BCD rate cannot be negative`;
        if (p.igstRate < 0) return `${label}IGST rate cannot be negative`;
        if (p.quantity <= 0) return `${label}Please enter the quantity`;
        if (p.lengthCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} length`;
        if (p.widthCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} width`;
        if (p.heightCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} height`;
        if (p.actualWeightKg <= 0) return `${label}Please enter actual weight`;
        if (p.dimensionMode === 'box' && p.numPackages <= 0) return `${label}Please enter number of packages`;
        if (p.dimensionMode === 'product' && p.packingError) return `${label}${p.packingError}`;
      }
      return null;
    }
    case 2:
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

function buildMultiProductInput(state: CalculatorFormState): MultiProductInput {
  return {
    originCountryCode: state.originCountryCode,
    currency: state.currency,
    exchangeRateOverride: state.exchangeRate,

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
      dimensionMode: p.dimensionMode,
    })),

    includeInlandDelivery: state.includeInlandDelivery,
    destinationCity: state.destinationCity || undefined,
    clearancePort: VALID_PORTS.includes(state.clearancePort as ClearancePort) ? (state.clearancePort as ClearancePort) : undefined,
    inlandZone: VALID_ZONES.includes(state.inlandZone as typeof VALID_ZONES[number]) ? (state.inlandZone as 'A' | 'B' | 'C' | 'D' | 'E') : undefined,

    userFreightCostINR: state.userFreightCostINR > 0 ? state.userFreightCostINR : undefined,
  };
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

  // Results are only calculated when user explicitly clicks "Calculate Landing Cost"
  // No auto-calculation — the right panel shows an input review until then

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
    for (let i = 0; i <= 2; i++) {
      const error = validateStep(state, i);
      if (error) {
        dispatch({ type: 'VALIDATION_ERROR', error });
        return;
      }
    }

    dispatch({ type: 'CALCULATE_START' });

    try {
      const input = buildMultiProductInput(state);
      const result = calculateMultiProductLandedCost(input);
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
    validateStep: (step: number) => validateStep(state, step),
  };
}
