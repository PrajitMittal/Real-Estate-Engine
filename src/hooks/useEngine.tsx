import { useReducer, createContext, useContext, useEffect, useRef, type ReactNode, useCallback } from 'react';
import type { EngineState, EngineAction, LocationTier } from '@/lib/types';
import { buildScenarios, buildCapex, buildSaleLeasebackModels, assessViability, buildDebtScenario } from '@/lib/engine';

const initialState: EngineState = {
  currentStep: 1,
  propertyInput: {},
  marketResearch: null,
  recommendations: [],
  buildStyle: 'traditional',
  budgetCapex: null,
  capex: null,
  financials: null,
  debt: null,
  saleLeasebackModels: [],
  risks: null,
  renders: [],
  viability: null,
  isLoadingMarket: false,
  isLoadingRecommendations: false,
  isLoadingRisks: false,
  isLoadingRender: false,
  error: null,
};

function reducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'SET_PROPERTY':
      return { ...state, propertyInput: { ...state.propertyInput, ...action.data } };
    case 'SET_MARKET_RESEARCH':
      return { ...state, marketResearch: action.data };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.data };
    case 'UPDATE_PRODUCT': {
      const recs = [...state.recommendations];
      recs[action.index] = { ...recs[action.index], ...action.data };
      // Recalculate totalSqft
      if (action.data.unitCount !== undefined || action.data.avgSqftPerUnit !== undefined) {
        recs[action.index].totalSqft = recs[action.index].unitCount * recs[action.index].avgSqftPerUnit;
      }
      return { ...state, recommendations: recs };
    }
    case 'ADD_PRODUCT':
      return { ...state, recommendations: [...state.recommendations, action.data] };
    case 'REMOVE_PRODUCT':
      return { ...state, recommendations: state.recommendations.filter((_, i) => i !== action.index) };
    case 'SET_BUILD_STYLE':
      return { ...state, buildStyle: action.style };
    case 'SET_BUDGET':
      return { ...state, budgetCapex: action.budget };
    case 'SET_CAPEX':
      return { ...state, capex: action.data };
    case 'SET_FINANCIALS':
      return { ...state, financials: action.data };
    case 'SET_DEBT':
      return { ...state, debt: action.data };
    case 'SET_SALE_LEASEBACK':
      return { ...state, saleLeasebackModels: action.data };
    case 'SET_RISKS':
      return { ...state, risks: action.data };
    case 'ADD_RENDER':
      return { ...state, renders: [...state.renders, action.data] };
    case 'SET_VIABILITY':
      return { ...state, viability: action.data };
    case 'SET_LOADING':
      return { ...state, [action.key]: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_OVERRIDES':
      return { ...state, overrides: { ...state.overrides, ...action.data } };
    case 'LOAD_STATE':
      return { ...action.state };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

function runRecalculation(state: EngineState, dispatch: React.Dispatch<EngineAction>) {
  if (state.recommendations.length === 0) return;
  const locationTier: LocationTier = state.propertyInput.locationTier || 'metro';

  const capex = buildCapex(state.propertyInput, state.recommendations, state.buildStyle);
  dispatch({ type: 'SET_CAPEX', data: capex });

  const scenarios = buildScenarios(state.propertyInput, state.recommendations, state.buildStyle, locationTier);
  dispatch({ type: 'SET_FINANCIALS', data: scenarios });

  const stabilizedYear = scenarios.base.projections[4];
  if (stabilizedYear) {
    const slModels = buildSaleLeasebackModels(capex.totalCapex, stabilizedYear.totalRevenue, stabilizedYear.ebitda);
    dispatch({ type: 'SET_SALE_LEASEBACK', data: slModels });
  }

  const viability = assessViability(scenarios, state.risks);
  dispatch({ type: 'SET_VIABILITY', data: viability });
}

interface EngineContextType {
  state: EngineState;
  dispatch: React.Dispatch<EngineAction>;
  recalculate: () => void;
  calculateDebt: (ltvRatio: number, interestRate: number, tenureYears: number) => void;
}

const EngineContext = createContext<EngineContextType | null>(null);

export function EngineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const recalculate = useCallback(() => {
    runRecalculation(state, dispatch);
  }, [state.propertyInput, state.recommendations, state.buildStyle, state.risks]);

  // Auto-recalculate when recommendations or build style changes (debounced, deep comparison)
  const prevHashRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.recommendations.length === 0) return;
    // Deep-compare relevant fields to avoid infinite loops from reference changes
    const hash = JSON.stringify({
      recs: state.recommendations.map(r => ({
        id: r.id, unitCount: r.unitCount, avgSqftPerUnit: r.avgSqftPerUnit,
        adr: r.adr, targetOccupancy: r.targetOccupancy, retainOrSell: r.retainOrSell,
        constructionCostPerSqft: r.constructionCostPerSqft, buildStyle: r.buildStyle,
        productType: r.productType,
      })),
      style: state.buildStyle,
      area: state.propertyInput.areaSqft,
      landCost: state.propertyInput.totalLandCost,
      tier: state.propertyInput.locationTier,
    });
    if (hash === prevHashRef.current) return;
    prevHashRef.current = hash;

    // Debounce to prevent rapid cascading recalculations
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runRecalculation(state, dispatch);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [state.recommendations, state.buildStyle, state.propertyInput, state.risks]);

  const calculateDebt = useCallback((ltvRatio: number, interestRate: number, tenureYears: number) => {
    if (!state.capex || !state.financials) return;
    const noi = state.financials.base.projections[2]?.ebitda || 0;
    const debt = buildDebtScenario(state.capex.totalCapex, ltvRatio, interestRate, tenureYears, noi);
    dispatch({ type: 'SET_DEBT', data: debt });
  }, [state.capex, state.financials]);

  return (
    <EngineContext.Provider value={{ state, dispatch, recalculate, calculateDebt }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used within EngineProvider');
  return ctx;
}
