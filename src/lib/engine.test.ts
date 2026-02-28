import { describe, it, expect } from 'vitest';
import {
  calculateIRR,
  calculateNPV,
  calculateMOIC,
  calculatePayback,
  calculateEMI,
  calculateDSCR,
  buildCapex,
  assessViability,
  buildSaleLeasebackModels,
} from './engine';
import type { ScenarioAnalysis, CapexBreakdown, FinancialProjection } from './types';

// ─── calculateIRR ───────────────────────────────────────────

describe('calculateIRR', () => {
  it('returns 0 for less than 2 cashflows', () => {
    expect(calculateIRR([])).toBe(0);
    expect(calculateIRR([-1000])).toBe(0);
  });

  it('returns -100 when no positive cashflows exist', () => {
    expect(calculateIRR([-1000, -200, -300])).toBe(-100);
  });

  it('calculates correct IRR for simple cashflows', () => {
    // -1000 invested, 1100 returned after 1 year = 10% IRR
    const irr = calculateIRR([-1000, 1100]);
    expect(irr).toBeCloseTo(10, 0);
  });

  it('calculates correct IRR for multi-year cashflows', () => {
    // -10000 upfront, 3000/year for 5 years
    const irr = calculateIRR([-10000, 3000, 3000, 3000, 3000, 3000]);
    expect(irr).toBeGreaterThan(10);
    expect(irr).toBeLessThan(20);
  });

  it('handles zero-return projects', () => {
    // -1000 invested, exact payback = 0% IRR
    const irr = calculateIRR([-1000, 500, 500]);
    expect(irr).toBeCloseTo(0, 0);
  });

  it('handles large positive returns', () => {
    const irr = calculateIRR([-100, 500]);
    expect(irr).toBeGreaterThan(100);
  });
});

// ─── calculateNPV ───────────────────────────────────────────

describe('calculateNPV', () => {
  it('returns 0 for empty cashflows', () => {
    expect(calculateNPV([])).toBe(0);
  });

  it('discounts future cashflows correctly', () => {
    // At 10%, 1100 next year = 1000 today
    const npv = calculateNPV([-1000, 1100], 0.10);
    expect(npv).toBeCloseTo(0, 0);
  });

  it('returns positive NPV for profitable projects', () => {
    const npv = calculateNPV([-1000, 600, 600, 600], 0.10);
    expect(npv).toBeGreaterThan(0);
  });

  it('returns negative NPV for unprofitable projects', () => {
    const npv = calculateNPV([-10000, 500, 500], 0.10);
    expect(npv).toBeLessThan(0);
  });
});

// ─── calculateMOIC ──────────────────────────────────────────

describe('calculateMOIC', () => {
  it('returns 0 when no investment', () => {
    expect(calculateMOIC(1000, 0)).toBe(0);
  });

  it('calculates correct MOIC', () => {
    expect(calculateMOIC(3000, 1000)).toBe(3);
    expect(calculateMOIC(500, 1000)).toBe(0.5);
  });

  it('returns 1x for break-even', () => {
    expect(calculateMOIC(1000, 1000)).toBe(1);
  });
});

// ─── calculatePayback ───────────────────────────────────────

describe('calculatePayback', () => {
  it('returns length when never pays back', () => {
    expect(calculatePayback([-1000, 100, 100])).toBe(3);
  });

  it('calculates payback with interpolation', () => {
    const payback = calculatePayback([-1000, 600, 600]);
    // After year 1: -400, after year 2: +200
    // Interpolation: 1 + 400/600 ≈ 1.67
    expect(payback).toBeGreaterThan(0);
    expect(payback).toBeLessThan(3);
  });

  it('handles immediate payback', () => {
    const payback = calculatePayback([1000, 500]);
    expect(payback).toBe(0);
  });
});

// ─── calculateEMI ───────────────────────────────────────────

describe('calculateEMI', () => {
  it('handles zero interest rate', () => {
    const emi = calculateEMI(120000, 0, 10);
    expect(emi).toBe(1000); // 120000 / 120 months
  });

  it('calculates EMI with interest', () => {
    const emi = calculateEMI(1000000, 0.10, 10);
    expect(emi).toBeGreaterThan(0);
    // Total repayment should be more than principal
    expect(emi * 120).toBeGreaterThan(1000000);
  });
});

// ─── calculateDSCR ──────────────────────────────────────────

describe('calculateDSCR', () => {
  it('returns Infinity when no debt service', () => {
    expect(calculateDSCR(500000, 0)).toBe(Infinity);
  });

  it('calculates correct DSCR', () => {
    expect(calculateDSCR(150000, 100000)).toBe(1.5);
    expect(calculateDSCR(80000, 100000)).toBe(0.8);
  });
});

// ─── buildCapex ─────────────────────────────────────────────

describe('buildCapex', () => {
  it('calculates total capex correctly', () => {
    const property = { totalLandCost: 5000000, areaSqft: 3000 };
    const products = [
      {
        id: 'test-1',
        productType: 'zostel' as const,
        label: 'Zostel',
        unitCount: 10,
        avgSqftPerUnit: 120,
        totalSqft: 1200,
        constructionCostPerSqft: 2800,
        adr: 1000,
        targetOccupancy: 72,
        retainOrSell: 'retain' as const,
        buildStyle: 'traditional' as const,
        reasoning: 'test',
      },
    ];

    const capex = buildCapex(property, products, 'traditional');

    expect(capex.landCost).toBe(5000000);
    expect(capex.constructionCost).toBe(1200 * 2800);
    expect(capex.totalCapex).toBeGreaterThan(capex.landCost + capex.constructionCost);
    expect(capex.approvalsCost).toBeGreaterThan(0);
    expect(capex.workingCapital).toBeGreaterThan(0);
    expect(capex.contingency).toBeGreaterThan(0);
  });

  it('uses landCostPerSqft when totalLandCost not provided', () => {
    const property = { areaSqft: 1000, landCostPerSqft: 5000 };
    const capex = buildCapex(property, [], 'prefab');
    expect(capex.landCost).toBe(5000000);
  });
});

// ─── buildSaleLeasebackModels ───────────────────────────────

describe('buildSaleLeasebackModels', () => {
  it('returns 3 models', () => {
    const models = buildSaleLeasebackModels(10000000, 3000000, 1500000);
    expect(models).toHaveLength(3);
    expect(models[0].type).toBe('guaranteed_return');
    expect(models[1].type).toBe('revenue_share');
    expect(models[2].type).toBe('hybrid');
  });

  it('investor + zo cashflows sum to EBITDA for guaranteed model', () => {
    const ebitda = 1500000;
    const models = buildSaleLeasebackModels(10000000, 3000000, ebitda);
    const guaranteed = models[0];
    expect(guaranteed.investorAnnualCashflow + guaranteed.zoAnnualCashflow).toBeCloseTo(ebitda, 0);
  });

  it('investor + zo cashflows sum to EBITDA for revenue share model', () => {
    const ebitda = 1500000;
    const models = buildSaleLeasebackModels(10000000, 3000000, ebitda);
    const revShare = models[1];
    expect(revShare.investorAnnualCashflow + revShare.zoAnnualCashflow).toBeCloseTo(ebitda, 0);
  });
});

// ─── assessViability ────────────────────────────────────────

describe('assessViability', () => {
  const makeScenario = (irr: number, payback: number, moic: number): ScenarioAnalysis => ({
    base: {
      label: 'Base',
      irr,
      npv: 1000000,
      moic,
      paybackYears: payback,
      projections: [] as FinancialProjection[],
      capex: {} as CapexBreakdown,
    },
    bull: {
      label: 'Bull',
      irr: irr * 1.3,
      npv: 2000000,
      moic: moic * 1.3,
      paybackYears: payback * 0.8,
      projections: [] as FinancialProjection[],
      capex: {} as CapexBreakdown,
    },
    bear: {
      label: 'Bear',
      irr: irr * 0.6,
      npv: -500000,
      moic: moic * 0.6,
      paybackYears: payback * 1.5,
      projections: [] as FinancialProjection[],
      capex: {} as CapexBreakdown,
    },
  });

  it('rates excellent for high IRR, quick payback, high MOIC, low risk', () => {
    const result = assessViability(makeScenario(25, 3, 3), { overallScore: 25, rating: 'low', items: [] });
    expect(result.rating).toBe('excellent');
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('rates good for moderate IRR', () => {
    const result = assessViability(makeScenario(17, 6, 2), null);
    expect(result.rating).toBe('good');
  });

  it('rates moderate for low IRR', () => {
    const result = assessViability(makeScenario(12, 8, 1.3), null);
    expect(result.rating).toBe('moderate');
  });

  it('rates poor for very low IRR', () => {
    const result = assessViability(makeScenario(5, 12, 0.8), null);
    expect(result.rating).toBe('poor');
  });

  it('includes strengths for strong metrics', () => {
    const result = assessViability(makeScenario(25, 3, 3), null);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('includes weaknesses for weak metrics', () => {
    const result = assessViability(makeScenario(5, 12, 0.8), null);
    expect(result.weaknesses.length).toBeGreaterThan(0);
  });

  it('penalizes score for high risk', () => {
    const lowRisk = assessViability(makeScenario(17, 6, 2), { overallScore: 20, rating: 'low', items: [] });
    const highRisk = assessViability(makeScenario(17, 6, 2), { overallScore: 70, rating: 'high', items: [] });
    expect(highRisk.score).toBeLessThan(lowRisk.score);
  });
});
