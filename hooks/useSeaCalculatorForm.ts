'use client';

import { useCallback, useEffect, useReducer } from 'react';
import { fetchExchangeRate } from '@/core/calculatorUtils';
import { getChargeableWeight, getVolumetricWeight } from '@/core/dhlRates';
import { type PackingResult } from '@/core/packingCalculator';
import {
  getSeaDestinationPorts,
  getSeaOriginCountries,
  getSeaOriginPortsByCountry,
  type SeaIncoterm,
  type SeaShipmentPreference,
} from '@/core/seaFreightRates';
import {
  calculateSeaMultiProductLandedCost,
  exchangeRates,
  getDutyRates,
  type ClearancePort,
  type SeaMultiProductInput,
  type SeaMultiProductResult,
} from '@/lib/calculateSea';

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
  dimensionMode: 'box' | 'product';
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  numPackages: number;
  volumetricWeight: number;
  grossWeight: number;
  chargeableWeight: number;
  cbm: number;
  packingResult: PackingResult | null;
  packingError: string | null;
}

export interface SeaCalculatorFormState {
  currentStep: number;
  incoterm: SeaIncoterm;
  shipmentPreference: SeaShipmentPreference;
  originCountry: string;
  seaZone: 1 | 2 | 3 | 4 | '';
  originPort: string;
  destinationPort: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource: 'static' | 'live' | 'loading';
  products: SeaProductItem[];
  dimensionMode: 'box' | 'product';
  includeInlandDelivery: boolean;
  clearancePort: ClearancePort | '';
  destinationCity: string;
  inlandZone: 'A' | 'B' | 'C' | 'D' | 'E' | '';
  result: SeaMultiProductResult | null;
  isCalculating: boolean;
  error: string | null;
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

const initialState: SeaCalculatorFormState = {
  currentStep: 0,
  incoterm: 'FOB',
  shipmentPreference: 'LCL',
  originCountry: '',
  seaZone: '',
  originPort: '',
  destinationPort: '',
  currency: '',
  exchangeRate: 0,
  exchangeRateSource: 'static',
  products: [createDefaultProduct()],
  dimensionMode: 'box',
  includeInlandDelivery: false,
  clearancePort: '',
  destinationCity: '',
  inlandZone: '',
  result: null,
  isCalculating: false,
  error: null,
};

type Action =
  | { type: 'SET_FIELD'; field: string; value: unknown }
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'CALCULATE_START' }
  | { type: 'CALCULATE_SUCCESS'; result: SeaMultiProductResult }
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

function computeProductDerived(product: SeaProductItem): SeaProductItem {
  const p = { ...product };
  if (p.unitPrice > 0 && p.quantity > 0) {
    p.fobValue = Math.round(p.unitPrice * p.quantity * 100) / 100;
  }

  if (p.dimensionMode === 'product') {
    p.packingResult = null;
    p.packingError = null;
    if (p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0 && p.quantity > 0) {
      const singleVol = getVolumetricWeight(p.lengthCm, p.widthCm, p.heightCm);
      p.numPackages = p.quantity;
      p.volumetricWeight = Math.round(singleVol * p.quantity * 100) / 100;
      p.cbm = Math.round((p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.quantity * 1_000_000) / 1_000_000;
      p.grossWeight = Math.round(p.actualWeightKg * p.quantity * 100) / 100;
      p.chargeableWeight = getChargeableWeight(p.grossWeight, p.volumetricWeight);
    } else {
      p.numPackages = p.quantity > 0 ? p.quantity : 0;
      p.volumetricWeight = 0;
      p.cbm = 0;
      p.grossWeight = 0;
      p.chargeableWeight = 0;
    }
  } else {
    p.packingResult = null;
    p.packingError = null;
    if (p.lengthCm > 0 && p.widthCm > 0 && p.heightCm > 0) {
      const singleVol = getVolumetricWeight(p.lengthCm, p.widthCm, p.heightCm);
      p.volumetricWeight = Math.round(singleVol * p.numPackages * 100) / 100;
      p.cbm = Math.round((p.lengthCm * p.widthCm * p.heightCm / 1_000_000) * p.numPackages * 1_000_000) / 1_000_000;
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

function reducer(state: SeaCalculatorFormState, action: Action): SeaCalculatorFormState {
  switch (action.type) {
    case 'SET_FIELD': {
      const newState = { ...state, [action.field]: action.value, error: null, result: null };
      if (action.field === 'currency') {
        const currency = action.value as string;
        if (exchangeRates[currency]) newState.exchangeRate = exchangeRates[currency];
        newState.exchangeRateSource = 'loading';
      }
      if (action.field === 'incoterm' && action.value === 'CIF') {
        newState.originPort = '';
        newState.seaZone = '';
        newState.shipmentPreference = 'LCL';
      }
      if (action.field === 'originCountry' || action.field === 'seaZone') {
        newState.originPort = '';
        newState.destinationPort = '';
      }
      if (action.field === 'originPort') {
        newState.destinationPort = '';
      }
      if (action.field === 'dimensionMode') {
        const mode = action.value as 'box' | 'product';
        newState.products = newState.products.map((product) => computeProductDerived({ ...product, dimensionMode: mode }));
      }
      return newState;
    }
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products.map((p) => ({ ...p, isExpanded: false })), createDefaultProduct()],
        error: null,
        result: null,
      };
    case 'REMOVE_PRODUCT': {
      if (state.products.length <= 1) return state;
      const products = state.products.filter((product) => product.id !== action.productId);
      if (!products.some((product) => product.isExpanded) && products.length > 0) {
        products[products.length - 1] = { ...products[products.length - 1], isExpanded: true };
      }
      return { ...state, products, error: null, result: null };
    }
    case 'DUPLICATE_PRODUCT': {
      const source = state.products.find((product) => product.id === action.productId);
      if (!source) return state;
      const clone = {
        ...source,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        isExpanded: true,
        productName: source.productName ? `${source.productName} (copy)` : '',
      };
      const products = state.products.map((product) => ({ ...product, isExpanded: false }));
      products.push(clone);
      return { ...state, products, error: null, result: null };
    }
    case 'SET_PRODUCT_FIELD': {
      const products = state.products.map((product) => {
        if (product.id !== action.productId) return product;
        const updated = { ...product, [action.field]: action.value };
        if (action.field === 'hsnCode') {
          const rates = getDutyRates(action.value as string);
          updated.bcdRate = rates.bcd;
          updated.igstRate = rates.igst;
        }
        return computeProductDerived(updated);
      });
      return { ...state, products, error: null, result: null };
    }
    case 'TOGGLE_PRODUCT_EXPANDED':
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          isExpanded: product.id === action.productId ? !product.isExpanded : false,
        })),
      };
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
    case 'SET_RATE_LIVE':
      return { ...state, exchangeRate: action.rate, exchangeRateSource: 'live' };
    case 'SET_RATE_FALLBACK':
      return { ...state, exchangeRateSource: 'static' };
    case 'RESET':
      return { ...initialState, products: [createDefaultProduct()] };
    default:
      return state;
  }
}

export function validateSeaStep(state: SeaCalculatorFormState, step: number): string | null {
  switch (step) {
    case 0:
      if (!state.incoterm) return 'Please select FOB or CIF';
      if (!state.originCountry) return 'Please select an origin country';
      if (state.incoterm === 'FOB') {
        if (!state.originPort) return 'Please select an origin port';
      }
      if (!state.destinationPort) return 'Please select an India destination port';
      if (!state.currency) return 'Please select a currency';
      if (state.exchangeRate <= 0) return 'Exchange rate must be greater than 0';
      return null;
    case 1:
      for (let i = 0; i < state.products.length; i++) {
        const p = state.products[i];
        const label = state.products.length > 1 ? `Product ${i + 1}: ` : '';
        if (!p.hsnCode) return `${label}Please enter an HSN code`;
        if (p.quantity <= 0) return `${label}Please enter the quantity`;
        if (p.unitPrice <= 0) return `${label}Please enter ${state.incoterm} price per unit`;
        if (p.lengthCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} length`;
        if (p.widthCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} width`;
        if (p.heightCm <= 0) return `${label}Please enter ${p.dimensionMode === 'product' ? 'product' : 'package'} height`;
        if (p.actualWeightKg <= 0) return `${label}Please enter actual weight`;
        if (p.dimensionMode === 'box' && p.numPackages <= 0) return `${label}Please enter number of packages`;
        if (p.dimensionMode === 'product' && p.packingError) return `${label}${p.packingError}`;
      }
      return null;
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

const VALID_PORTS: ClearancePort[] = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata'];
const VALID_ZONES = ['A', 'B', 'C', 'D', 'E'] as const;

function buildSeaInput(state: SeaCalculatorFormState): SeaMultiProductInput {
  return {
    incoterm: state.incoterm,
    shipmentPreference: state.shipmentPreference,
    originCountry: state.originCountry || undefined,
    originPort: state.incoterm === 'FOB' ? state.originPort : undefined,
    destinationPort: state.destinationPort,
    currency: state.currency,
    exchangeRateOverride: state.exchangeRate,
    products: state.products.map((product) => ({
      productName: product.productName,
      hsnCode: product.hsnCode,
      bcdRateOverride: product.bcdRate,
      igstRateOverride: product.igstRate,
      unitPrice: product.unitPrice,
      quantity: product.quantity,
      invoiceValue: product.fobValue > 0 ? product.fobValue : product.unitPrice * product.quantity,
      lengthCm: product.lengthCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      actualWeightKg: product.actualWeightKg,
      numPackages: product.numPackages,
      dimensionMode: product.dimensionMode,
    })),
    includeInlandDelivery: state.includeInlandDelivery,
    destinationCity: state.destinationCity || undefined,
    clearancePort: VALID_PORTS.includes(state.clearancePort as ClearancePort) ? state.clearancePort as ClearancePort : undefined,
    inlandZone: VALID_ZONES.includes(state.inlandZone as typeof VALID_ZONES[number]) ? state.inlandZone as 'A' | 'B' | 'C' | 'D' | 'E' : undefined,
  };
}

export function useSeaCalculatorForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const addProduct = useCallback(() => dispatch({ type: 'ADD_PRODUCT' }), []);
  const removeProduct = useCallback((productId: string) => dispatch({ type: 'REMOVE_PRODUCT', productId }), []);
  const duplicateProduct = useCallback((productId: string) => dispatch({ type: 'DUPLICATE_PRODUCT', productId }), []);
  const setProductField = useCallback((productId: string, field: string, value: unknown) => {
    dispatch({ type: 'SET_PRODUCT_FIELD', productId, field, value });
  }, []);
  const toggleProductExpanded = useCallback((productId: string) => dispatch({ type: 'TOGGLE_PRODUCT_EXPANDED', productId }), []);

  const nextStep = useCallback(() => {
    const error = validateSeaStep(state, state.currentStep);
    if (error) {
      dispatch({ type: 'VALIDATION_ERROR', error });
      return false;
    }
    dispatch({ type: 'NEXT_STEP' });
    return true;
  }, [state]);

  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const goToStep = useCallback((step: number) => dispatch({ type: 'SET_STEP', step }), []);

  const calculate = useCallback(() => {
    for (let i = 0; i <= 2; i++) {
      const error = validateSeaStep(state, i);
      if (error) {
        dispatch({ type: 'VALIDATION_ERROR', error });
        return;
      }
    }
    dispatch({ type: 'CALCULATE_START' });
    try {
      const result = calculateSeaMultiProductLandedCost(buildSeaInput(state));
      dispatch({ type: 'CALCULATE_SUCCESS', result });
    } catch (error) {
      dispatch({ type: 'CALCULATE_ERROR', error: error instanceof Error ? error.message : 'Calculation failed' });
    }
  }, [state]);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    originCountries: getSeaOriginCountries(),
    originPorts: getSeaOriginPortsByCountry(state.originCountry || undefined),
    destinationPorts: getSeaDestinationPorts(state.originPort || undefined),
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
