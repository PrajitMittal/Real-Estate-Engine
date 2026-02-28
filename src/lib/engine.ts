// ============================================
// Zo Real Estate Engine — Financial Calculation Engine
// ============================================

import type {
  PropertyInput, ProductRecommendation, CapexBreakdown, AnnualRevenue,
  FinancialProjection, ScenarioResult, ScenarioAnalysis, DebtScenario,
  SaleLeasebackModel, ViabilityAssessment, ViabilityRating, BuildStyle,
  LocationTier, RiskAssessment,
} from './types';
import {
  PRODUCT_CATALOG, SEASONALITY, OCCUPANCY_RAMPUP,
  APPROVAL_COST_PERCENT, INTERIOR_COST_PERCENT, LANDSCAPING_PERCENT,
  WORKING_CAPITAL_PERCENT, CONTINGENCY_PERCENT,
  ADR_GROWTH_RATE, OPEX_INFLATION, DISCOUNT_RATE,
} from './constants';

// ─── IRR (Newton-Raphson) ────────────────────────────────────
export function calculateIRR(cashflows: number[]): number {
  let rate = 0.1;
  for (let i = 0; i < 200; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashflows[t] / factor;
      if (t > 0) dnpv -= (t * cashflows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1e-7) break;
    if (Math.abs(dnpv) < 1e-10) break;
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < 1e-7) break;
    rate = newRate;
    if (rate < -0.99) rate = -0.5;
    if (rate > 10) rate = 5;
  }
  return rate * 100; // return as percentage
}

// ─── NPV ─────────────────────────────────────────────────────
export function calculateNPV(cashflows: number[], rate: number = DISCOUNT_RATE): number {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

// ─── MOIC ────────────────────────────────────────────────────
export function calculateMOIC(totalInflows: number, totalInvested: number): number {
  if (totalInvested === 0) return 0;
  return totalInflows / totalInvested;
}

// ─── Payback Period ──────────────────────────────────────────
export function calculatePayback(cashflows: number[]): number {
  let cumulative = 0;
  for (let i = 0; i < cashflows.length; i++) {
    cumulative += cashflows[i];
    if (cumulative >= 0) {
      // Interpolate within the year
      const prev = cumulative - cashflows[i];
      const fraction = cashflows[i] !== 0 ? Math.abs(prev) / cashflows[i] : 0;
      return Math.max(0, i - 1 + fraction);
    }
  }
  return cashflows.length; // Never pays back
}

// ─── EMI Calculator ──────────────────────────────────────────
export function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  const r = annualRate / 12;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── DSCR ────────────────────────────────────────────────────
export function calculateDSCR(noi: number, annualDebtService: number): number {
  if (annualDebtService === 0) return Infinity;
  return noi / annualDebtService;
}

// ─── Build Capex ─────────────────────────────────────────────
export function buildCapex(
  property: Partial<PropertyInput>,
  products: ProductRecommendation[],
  _buildStyle: BuildStyle,
): CapexBreakdown {
  const landCost = property.totalLandCost ||
    (property.areaSqft || 0) * (property.landCostPerSqft || 0);

  let constructionCost = 0;
  for (const p of products) {
    constructionCost += p.totalSqft * p.constructionCostPerSqft;
  }

  const approvalsCost = constructionCost * APPROVAL_COST_PERCENT;
  const interiorsFurniture = constructionCost * INTERIOR_COST_PERCENT;
  const landscaping = constructionCost * LANDSCAPING_PERCENT;
  const subtotal = landCost + constructionCost + approvalsCost + interiorsFurniture + landscaping;
  const workingCapital = subtotal * WORKING_CAPITAL_PERCENT;
  const contingency = subtotal * CONTINGENCY_PERCENT;
  const totalCapex = subtotal + workingCapital + contingency;

  return {
    landCost,
    constructionCost,
    approvalsCost,
    interiorsFurniture,
    landscaping,
    workingCapital,
    contingency,
    totalCapex,
  };
}

// ─── Build Annual Revenue ────────────────────────────────────
export function buildAnnualRevenue(
  products: ProductRecommendation[],
  locationTier: LocationTier,
  year: number,
  adrMultiplier: number = 1,
  occupancyMultiplier: number = 1,
): AnnualRevenue {
  const rampup = year <= 5 ? OCCUPANCY_RAMPUP[year - 1] : 0.98;
  const seasonality = SEASONALITY[locationTier];
  const adrGrowth = Math.pow(1 + ADR_GROWTH_RATE, year - 1);

  let hospitalityRevenue = 0;
  let fnbRevenue = 0;
  let eventRevenue = 0;
  let coworkingRevenue = 0;
  let saleRevenue = 0;

  for (const product of products) {
    const catalog = PRODUCT_CATALOG[product.productType];
    if (!catalog) continue;

    const adjustedADR = product.adr * adrGrowth * adrMultiplier;
    const baseOccupancy = (product.targetOccupancy / 100) * rampup * occupancyMultiplier;

    if (product.retainOrSell === 'sell') {
      // Sale revenue only in year 1
      if (year === 1 && product.sellingPricePerSqft) {
        saleRevenue += product.totalSqft * product.sellingPricePerSqft;
      }
      continue;
    }

    if (product.productType === 'event_space') {
      // Event spaces: daily rate × utilization days
      let annualEvents = 0;
      for (const monthMult of seasonality) {
        const monthlyOccupancy = Math.min(baseOccupancy * monthMult, 1);
        annualEvents += monthlyOccupancy * 30; // ~30 days per month
      }
      eventRevenue += adjustedADR * annualEvents * product.unitCount;
      fnbRevenue += eventRevenue * catalog.fnbRevenueRatio;
    } else if (product.productType === 'coworking') {
      // Co-working: seats × daily rate × occupancy × working days
      const workingDays = 300;
      coworkingRevenue += adjustedADR * baseOccupancy * workingDays * product.unitCount;
      fnbRevenue += coworkingRevenue * catalog.fnbRevenueRatio;
    } else if (product.productType === 'restaurant_bar') {
      // Restaurant: daily revenue × days
      const avgCovers = 365;
      fnbRevenue += adjustedADR * baseOccupancy * avgCovers * product.unitCount;
    } else {
      // Standard hospitality: ADR × occupancy × 365 × units
      let yearRevenue = 0;
      for (const monthMult of seasonality) {
        const monthlyOccupancy = Math.min(baseOccupancy * monthMult, 1);
        yearRevenue += adjustedADR * monthlyOccupancy * 30 * product.unitCount;
      }
      hospitalityRevenue += yearRevenue;
      fnbRevenue += yearRevenue * catalog.fnbRevenueRatio;
    }
  }

  return {
    hospitalityRevenue,
    fnbRevenue,
    eventRevenue,
    coworkingRevenue,
    saleRevenue,
    totalRevenue: hospitalityRevenue + fnbRevenue + eventRevenue + coworkingRevenue + saleRevenue,
  };
}

// ─── Build 10-Year Projection ────────────────────────────────
export function buildProjection(
  capex: CapexBreakdown,
  products: ProductRecommendation[],
  locationTier: LocationTier,
  debtService: number = 0,
  years: number = 10,
  adrMultiplier: number = 1,
  occupancyMultiplier: number = 1,
): FinancialProjection[] {
  const projections: FinancialProjection[] = [];
  let cumulativeCashflow = -capex.totalCapex;

  for (let year = 1; year <= years; year++) {
    const revenue = buildAnnualRevenue(products, locationTier, year, adrMultiplier, occupancyMultiplier);

    // OpEx: weighted by product mix
    let totalOpex = 0;
    let totalCommission = 0;
    const opexInflation = Math.pow(1 + OPEX_INFLATION, year - 1);

    for (const product of products) {
      if (product.retainOrSell === 'sell') continue;
      const catalog = PRODUCT_CATALOG[product.productType];
      if (!catalog) continue;

      // Approximate this product's share of revenue
      const productRevShare = revenue.totalRevenue > 0
        ? (product.unitCount * product.adr) / products.reduce((s, p) => s + p.unitCount * p.adr, 0)
        : 0;

      const productRevenue = revenue.totalRevenue * productRevShare;
      totalOpex += productRevenue * catalog.opexRatio * opexInflation;
      totalCommission += (revenue.hospitalityRevenue * productRevShare) * catalog.commission;
    }

    const ebitda = revenue.totalRevenue - totalOpex - totalCommission;
    const netCashflow = ebitda - debtService;
    cumulativeCashflow += netCashflow;

    projections.push({
      year,
      revenue,
      totalRevenue: revenue.totalRevenue,
      opex: totalOpex,
      zostelCommission: totalCommission,
      ebitda,
      debtService,
      netCashflow,
      cumulativeCashflow,
    });
  }

  return projections;
}

// ─── Build Scenario Result ───────────────────────────────────
export function buildScenarioResult(
  label: string,
  property: Partial<PropertyInput>,
  products: ProductRecommendation[],
  buildStyle: BuildStyle,
  locationTier: LocationTier,
  adrMultiplier: number = 1,
  occupancyMultiplier: number = 1,
  costMultiplier: number = 1,
): ScenarioResult {
  // Adjust construction costs
  const adjustedProducts = products.map(p => ({
    ...p,
    constructionCostPerSqft: p.constructionCostPerSqft * costMultiplier,
  }));

  const capex = buildCapex(property, adjustedProducts, buildStyle);
  const projections = buildProjection(capex, products, locationTier, 0, 10, adrMultiplier, occupancyMultiplier);

  const cashflows = [-capex.totalCapex, ...projections.map(p => p.netCashflow)];
  const totalInflows = projections.reduce((s, p) => s + p.netCashflow, 0);

  return {
    label,
    irr: calculateIRR(cashflows),
    npv: calculateNPV(cashflows),
    moic: calculateMOIC(totalInflows, capex.totalCapex),
    paybackYears: calculatePayback(cashflows),
    projections,
    capex,
  };
}

// ─── Build All Scenarios ─────────────────────────────────────
export function buildScenarios(
  property: Partial<PropertyInput>,
  products: ProductRecommendation[],
  buildStyle: BuildStyle,
  locationTier: LocationTier,
): ScenarioAnalysis {
  return {
    base: buildScenarioResult('Base Case', property, products, buildStyle, locationTier),
    bull: buildScenarioResult('Bull Case', property, products, buildStyle, locationTier, 1.10, 1.15, 0.95),
    bear: buildScenarioResult('Bear Case', property, products, buildStyle, locationTier, 0.85, 0.80, 1.15),
  };
}

// ─── Build Debt Scenario ─────────────────────────────────────
export function buildDebtScenario(
  totalCapex: number,
  ltvRatio: number, // 0.6 = 60% debt
  interestRate: number, // 0.10 = 10%
  tenureYears: number,
  noi: number, // year 3 stabilized NOI
): DebtScenario {
  const loanAmount = totalCapex * ltvRatio;
  const emi = calculateEMI(loanAmount, interestRate, tenureYears);
  const annualDebtService = emi * 12;
  const totalInterest = (annualDebtService * tenureYears) - loanAmount;
  const dscr = calculateDSCR(noi, annualDebtService);

  // Calculate leveraged IRR (simplified)
  const equity = totalCapex - loanAmount;
  const leveragedCashflows = [-equity];
  for (let y = 1; y <= 10; y++) {
    const yearNoi = noi * Math.pow(1 + ADR_GROWTH_RATE, y - 3);
    const debt = y <= tenureYears ? annualDebtService : 0;
    leveragedCashflows.push(yearNoi - debt);
  }
  const leveragedIRR = calculateIRR(leveragedCashflows);

  return { loanAmount, interestRate, tenureYears, emi, annualDebtService, totalInterest, leveragedIRR, dscr };
}

// ─── Sale-Leaseback Models ───────────────────────────────────
export function buildSaleLeasebackModels(
  totalCapex: number,
  stabilizedRevenue: number,
  stabilizedEbitda: number,
): SaleLeasebackModel[] {
  // Guaranteed Return
  const guaranteedYield = 0.08;
  const guaranteedMgmtFee = 0.20;
  const guaranteedInvestorCashflow = totalCapex * guaranteedYield;
  const guaranteedZoCashflow = stabilizedEbitda - guaranteedInvestorCashflow;

  // Revenue Share
  const revShareInvestor = 0.60;
  const revShareMgmtFee = 0.15;
  const revShareInvestorCashflow = stabilizedEbitda * revShareInvestor;
  const revShareZoCashflow = stabilizedEbitda * (1 - revShareInvestor);

  // Hybrid
  const hybridGuaranteed = 0.06;
  const hybridRevShare = 0.40;
  const hybridMgmtFee = 0.18;
  const hybridGuaranteedPart = totalCapex * hybridGuaranteed;
  const hybridRevPart = Math.max(0, stabilizedEbitda - hybridGuaranteedPart) * hybridRevShare;
  const hybridInvestorCashflow = hybridGuaranteedPart + hybridRevPart;
  const hybridZoCashflow = stabilizedEbitda - hybridInvestorCashflow;

  return [
    {
      type: 'guaranteed_return',
      label: 'Guaranteed Return',
      description: '8% guaranteed yield on invested capital with 20% management fee to Zo',
      investorYield: guaranteedYield * 100,
      managementFee: guaranteedMgmtFee * 100,
      guaranteedReturn: guaranteedYield * 100,
      investorAnnualCashflow: guaranteedInvestorCashflow,
      zoAnnualCashflow: guaranteedZoCashflow,
      investorIRR: guaranteedYield * 100,
      zoIRR: totalCapex > 0 ? (guaranteedZoCashflow / totalCapex) * 100 : 0,
    },
    {
      type: 'revenue_share',
      label: 'Revenue Share',
      description: '60/40 revenue share (investor/Zo) with 15% management fee',
      investorYield: totalCapex > 0 ? (revShareInvestorCashflow / totalCapex) * 100 : 0,
      managementFee: revShareMgmtFee * 100,
      revenueShareInvestor: revShareInvestor * 100,
      revenueShareZo: (1 - revShareInvestor) * 100,
      investorAnnualCashflow: revShareInvestorCashflow,
      zoAnnualCashflow: revShareZoCashflow,
      investorIRR: totalCapex > 0 ? (revShareInvestorCashflow / totalCapex) * 100 : 0,
      zoIRR: totalCapex > 0 ? (revShareZoCashflow / totalCapex) * 100 : 0,
    },
    {
      type: 'hybrid',
      label: 'Hybrid Model',
      description: '6% guaranteed + 40% revenue share above guarantee, 18% management fee',
      investorYield: totalCapex > 0 ? (hybridInvestorCashflow / totalCapex) * 100 : 0,
      managementFee: hybridMgmtFee * 100,
      guaranteedReturn: hybridGuaranteed * 100,
      revenueShareInvestor: hybridRevShare * 100,
      revenueShareZo: (1 - hybridRevShare) * 100,
      investorAnnualCashflow: hybridInvestorCashflow,
      zoAnnualCashflow: hybridZoCashflow,
      investorIRR: totalCapex > 0 ? (hybridInvestorCashflow / totalCapex) * 100 : 0,
      zoIRR: totalCapex > 0 ? (hybridZoCashflow / totalCapex) * 100 : 0,
    },
  ];
}

// ─── Viability Assessment ────────────────────────────────────
export function assessViability(
  scenario: ScenarioAnalysis,
  risks: RiskAssessment | null,
): ViabilityAssessment {
  const { base } = scenario;
  const irr = base.irr;
  const payback = base.paybackYears;
  const moic = base.moic;
  const riskScore = risks?.overallScore ?? 50;

  let rating: ViabilityRating;
  let score: number;

  if (irr > 20 && payback < 5 && moic > 2.5 && riskScore < 40) {
    rating = 'excellent';
    score = 90 + Math.min(10, (irr - 20) / 2);
  } else if (irr > 15 && payback < 7 && moic > 1.8) {
    rating = 'good';
    score = 70 + Math.min(20, (irr - 15));
  } else if (irr > 10) {
    rating = 'moderate';
    score = 50 + Math.min(20, (irr - 10) * 2);
  } else {
    rating = 'poor';
    score = Math.max(10, 30 + irr);
  }

  // Adjust for risk
  score = Math.max(0, Math.min(100, score - (riskScore > 60 ? 15 : riskScore > 40 ? 5 : 0)));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (irr > 18) strengths.push(`Strong IRR of ${irr.toFixed(1)}% exceeds industry benchmarks`);
  if (payback < 5) strengths.push(`Quick payback period of ${payback.toFixed(1)} years`);
  if (moic > 2) strengths.push(`MOIC of ${moic.toFixed(2)}x indicates excellent capital multiplication`);
  if (scenario.bull.irr > 25) strengths.push(`Significant upside potential in bull case (${scenario.bull.irr.toFixed(1)}% IRR)`);

  if (irr < 12) weaknesses.push(`IRR of ${irr.toFixed(1)}% is below the 12% hurdle rate`);
  if (payback > 7) weaknesses.push(`Long payback period of ${payback.toFixed(1)} years increases risk`);
  if (scenario.bear.irr < 5) weaknesses.push(`Bear case IRR of ${scenario.bear.irr.toFixed(1)}% shows downside vulnerability`);
  if (riskScore > 60) weaknesses.push('High risk profile requires careful mitigation planning');

  const recommendation = rating === 'excellent'
    ? 'Strong GO — proceed with detailed feasibility study and site planning.'
    : rating === 'good'
    ? 'Conditional GO — viable project with manageable risks. Proceed with due diligence.'
    : rating === 'moderate'
    ? 'REVIEW — marginal returns. Consider optimizing product mix or negotiating land cost.'
    : 'NO-GO — insufficient returns. Explore alternative use or negotiate significantly lower acquisition cost.';

  const nextSteps = [
    'Conduct detailed site survey and soil testing',
    'Engage architect for preliminary design',
    'Obtain title search and legal due diligence',
    'Prepare detailed cost estimates with local contractors',
    'Apply for necessary permits and approvals',
  ];

  return { rating, score, strengths, weaknesses, recommendation, nextSteps };
}
