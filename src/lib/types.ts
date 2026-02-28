// ============================================
// Zo Real Estate Engine — Type Definitions
// ============================================

export type PropertyType = 'land' | 'building' | 'brownfield' | 'greenfield' | 'plot';
export type Terrain = 'flat' | 'hilly' | 'coastal' | 'forest' | 'desert' | 'riverside';
export type RoadAccess = 'highway' | 'state_road' | 'city_road' | 'village_road' | 'no_road';
export type ZoningType = 'residential' | 'commercial' | 'mixed_use' | 'hospitality' | 'agricultural' | 'industrial' | 'special_zone';
export type LocationTier = 'metro' | 'beach' | 'mountain' | 'heritage' | 'offbeat' | 'pilgrimage' | 'suburban';
export type BuildStyle = 'prefab' | 'traditional' | 'renovation';

export interface PropertyInput {
  // Required (minimum)
  location: string;
  city: string;
  state: string;
  country: string;
  areaSqft: number;

  // Optional — AI fills gaps
  coordinates?: string;
  mapLink?: string;
  propertyType?: PropertyType;
  terrain?: Terrain;
  roadAccess?: RoadAccess;
  zoning?: ZoningType;
  existingStructure?: boolean;
  existingStructureDetails?: string;
  existingSqftBuiltUp?: number;
  numberOfFloors?: number;
  landCostPerSqft?: number;
  totalLandCost?: number;
  distanceToCity?: number;
  distanceToAirport?: number;
  distanceToRailway?: number;
  nearestTouristAttraction?: string;
  description?: string;
  photos?: string[]; // base64 or URLs
  photoAnalysis?: string; // GPT-4V description of uploaded photos
  locationTier?: LocationTier;
}

export interface Competitor {
  name: string;
  type: string;
  distanceKm: number;
  adr: number;
  rating: number;
  reviewCount: number;
  strengths?: string;
}

export interface MarketResearch {
  summary: string;
  competitors: Competitor[];
  avgADR: number;
  avgOccupancy: number;
  demandDrivers: string[];
  seasonality: number[]; // 12 months, occupancy %
  touristFootfall: string;
  rentalYieldRange: string;
  avgLandRate: number;
  opportunities: string[];
  risks: string[];
  targetDemographic: string;
  growthTrend: string;

  // Extended analysis (optional — AI may or may not return these)
  demandSupplyGap?: string;
  alternativeUseCases?: string[];
  microMarketTrends?: string[];
  regulatoryNotes?: string;
  segmentDemand?: { segment: string; share: number; trend: string }[];
  comparableTransactions?: { description: string; pricePerSqft: number; date: string }[];
}

export type ZoProductType =
  | 'zostel'
  | 'zostel_plus'
  | 'zostel_home'
  | 'zo_house'
  | 'zo_villa'
  | 'zo_selections'
  | 'event_space'
  | 'coworking'
  | 'restaurant_bar'
  | 'farm_agritourism'
  | 'glamping';

export interface RoomTypeConfig {
  name: string;
  count: number;
  sqftPerUnit: number;
  adr: number;
  occupancy: number;
}

export interface ProductRecommendation {
  id: string;
  productType: ZoProductType;
  label: string;
  unitCount: number;
  avgSqftPerUnit: number;
  totalSqft: number;
  adr: number;
  targetOccupancy: number;
  sellingPricePerSqft?: number;
  retainOrSell: 'retain' | 'sell';
  constructionCostPerSqft: number;
  reasoning: string;
  buildStyle: BuildStyle;
  roomTypes?: RoomTypeConfig[];
}

export interface CapexBreakdown {
  landCost: number;
  constructionCost: number;
  approvalsCost: number;
  interiorsFurniture: number;
  landscaping: number;
  workingCapital: number;
  contingency: number;
  totalCapex: number;
}

export interface AnnualRevenue {
  hospitalityRevenue: number;
  fnbRevenue: number;
  eventRevenue: number;
  coworkingRevenue: number;
  saleRevenue: number;
  totalRevenue: number;
}

export interface OpExBreakdown {
  staffSalaries: number;
  utilities: number;
  maintenance: number;
  marketing: number;
  insurance: number;
  propertyTax: number;
  consumables: number;
  technology: number;
  miscellaneous: number;
  totalOpex: number;
}

export interface FinancialProjection {
  year: number;
  revenue: AnnualRevenue;
  totalRevenue: number;
  opex: number;
  opexBreakdown: OpExBreakdown;
  zostelCommission: number;
  ebitda: number;
  debtService: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

export interface DebtScenario {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  emi: number;
  annualDebtService: number;
  totalInterest: number;
  leveragedIRR: number;
  dscr: number;
}

export interface ScenarioResult {
  label: string;
  irr: number;
  npv: number;
  moic: number;
  paybackYears: number;
  projections: FinancialProjection[];
  capex: CapexBreakdown;
}

export interface ScenarioAnalysis {
  base: ScenarioResult;
  bull: ScenarioResult;
  bear: ScenarioResult;
}

export interface SaleLeasebackModel {
  type: 'guaranteed_return' | 'revenue_share' | 'hybrid';
  label: string;
  description: string;
  investorYield: number;
  managementFee: number;
  revenueShareInvestor?: number;
  revenueShareZo?: number;
  guaranteedReturn?: number;
  investorAnnualCashflow: number;
  zoAnnualCashflow: number;
  investorIRR: number;
  zoIRR: number;
}

export interface RiskItem {
  id: string;
  category: 'regulatory' | 'market' | 'construction' | 'financial' | 'operational' | 'environmental' | 'political';
  title: string;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  riskScore: number; // severity × likelihood
  mitigation: string;
}

export interface RiskAssessment {
  items: RiskItem[];
  overallScore: number; // 0-100
  rating: 'low' | 'moderate' | 'high' | 'critical';
}

export interface ConceptRender {
  productType: ZoProductType;
  imageUrl: string;
  prompt: string;
  viewType: 'exterior' | 'interior' | 'aerial';
}

export type ViabilityRating = 'excellent' | 'good' | 'moderate' | 'poor';

export interface ViabilityAssessment {
  rating: ViabilityRating;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  nextSteps: string[];
}

export interface EngineState {
  currentStep: number;
  propertyInput: Partial<PropertyInput>;
  marketResearch: MarketResearch | null;
  recommendations: ProductRecommendation[];
  buildStyle: BuildStyle;
  budgetCapex: number | null;
  capex: CapexBreakdown | null;
  financials: ScenarioAnalysis | null;
  debt: DebtScenario | null;
  saleLeasebackModels: SaleLeasebackModel[];
  risks: RiskAssessment | null;
  renders: ConceptRender[];
  viability: ViabilityAssessment | null;

  // Financial assumption overrides
  overrides?: {
    adrGrowthRate?: number;
    opexInflation?: number;
    discountRate?: number;
  };

  // UI state
  isLoadingMarket: boolean;
  isLoadingRecommendations: boolean;
  isLoadingRisks: boolean;
  isLoadingRender: boolean;
  error: string | null;
}

export type EngineAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_PROPERTY'; data: Partial<PropertyInput> }
  | { type: 'SET_MARKET_RESEARCH'; data: MarketResearch }
  | { type: 'SET_RECOMMENDATIONS'; data: ProductRecommendation[] }
  | { type: 'UPDATE_PRODUCT'; index: number; data: Partial<ProductRecommendation> }
  | { type: 'ADD_PRODUCT'; data: ProductRecommendation }
  | { type: 'REMOVE_PRODUCT'; index: number }
  | { type: 'SET_BUILD_STYLE'; style: BuildStyle }
  | { type: 'SET_BUDGET'; budget: number }
  | { type: 'SET_CAPEX'; data: CapexBreakdown }
  | { type: 'SET_FINANCIALS'; data: ScenarioAnalysis }
  | { type: 'SET_DEBT'; data: DebtScenario | null }
  | { type: 'SET_SALE_LEASEBACK'; data: SaleLeasebackModel[] }
  | { type: 'SET_RISKS'; data: RiskAssessment }
  | { type: 'ADD_RENDER'; data: ConceptRender }
  | { type: 'SET_VIABILITY'; data: ViabilityAssessment }
  | { type: 'SET_LOADING'; key: 'isLoadingMarket' | 'isLoadingRecommendations' | 'isLoadingRisks' | 'isLoadingRender'; value: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_OVERRIDES'; data: EngineState['overrides'] }
  | { type: 'LOAD_STATE'; state: EngineState }
  | { type: 'RESET' };
