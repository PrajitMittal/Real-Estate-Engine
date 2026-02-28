// ============================================
// Zo Real Estate Engine — Product Catalog & Benchmarks
// ============================================

import type { ZoProductType, LocationTier, BuildStyle, RoomTypeConfig } from './types';

export const PRODUCT_CATALOG: Record<ZoProductType, {
  label: string;
  description: string;
  icon: string;
  defaultSqftPerUnit: number;
  minUnits: number;
  maxUnits: number;
  constructionCost: Record<BuildStyle, number>; // per sqft
  defaultADR: Record<LocationTier, number>;
  defaultOccupancy: number; // target steady-state %
  opexRatio: number; // % of revenue
  fnbRevenueRatio: number; // % of room revenue
  commission: number; // Zostel/Zo commission %
  canSell: boolean;
  sellingPriceMultiplier: number; // of construction cost
  minSqftRequired: number; // minimum total sqft for this product
}> = {
  zostel: {
    label: 'Zostel',
    description: 'Backpacker hostel with dorms and private rooms',
    icon: '🏠',
    defaultSqftPerUnit: 120,
    minUnits: 10,
    maxUnits: 100,
    constructionCost: { prefab: 1800, traditional: 2800, renovation: 1200 },
    defaultADR: { metro: 800, beach: 1200, mountain: 1000, heritage: 900, offbeat: 700, pilgrimage: 600, suburban: 650 },
    defaultOccupancy: 72,
    opexRatio: 0.42,
    fnbRevenueRatio: 0.25,
    commission: 0.12,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 1500,
  },
  zostel_plus: {
    label: 'Zostel Plus',
    description: 'Boutique hostel with premium rooms and social spaces',
    icon: '✨',
    defaultSqftPerUnit: 200,
    minUnits: 8,
    maxUnits: 50,
    constructionCost: { prefab: 2500, traditional: 3800, renovation: 1800 },
    defaultADR: { metro: 2000, beach: 2500, mountain: 2200, heritage: 1800, offbeat: 1500, pilgrimage: 1200, suburban: 1400 },
    defaultOccupancy: 68,
    opexRatio: 0.45,
    fnbRevenueRatio: 0.30,
    commission: 0.12,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 2000,
  },
  zostel_home: {
    label: 'Zostel Home',
    description: 'Curated homestay experience — entire home or rooms',
    icon: '🏡',
    defaultSqftPerUnit: 350,
    minUnits: 1,
    maxUnits: 10,
    constructionCost: { prefab: 2200, traditional: 3200, renovation: 1500 },
    defaultADR: { metro: 3000, beach: 3500, mountain: 2800, heritage: 2500, offbeat: 2000, pilgrimage: 1500, suburban: 2000 },
    defaultOccupancy: 55,
    opexRatio: 0.35,
    fnbRevenueRatio: 0.15,
    commission: 0.15,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 500,
  },
  zo_house: {
    label: 'Zo House',
    description: 'Co-living space for digital nomads and long-stay guests',
    icon: '🏢',
    defaultSqftPerUnit: 180,
    minUnits: 10,
    maxUnits: 80,
    constructionCost: { prefab: 2000, traditional: 3200, renovation: 1400 },
    defaultADR: { metro: 1200, beach: 1500, mountain: 1200, heritage: 1000, offbeat: 800, pilgrimage: 700, suburban: 900 },
    defaultOccupancy: 78,
    opexRatio: 0.40,
    fnbRevenueRatio: 0.20,
    commission: 0.10,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 2500,
  },
  zo_villa: {
    label: 'Zo Villa',
    description: 'Luxury villa — sell or retain for premium hospitality',
    icon: '🏰',
    defaultSqftPerUnit: 2000,
    minUnits: 1,
    maxUnits: 20,
    constructionCost: { prefab: 3500, traditional: 5500, renovation: 2500 },
    defaultADR: { metro: 15000, beach: 18000, mountain: 12000, heritage: 10000, offbeat: 8000, pilgrimage: 6000, suburban: 8000 },
    defaultOccupancy: 45,
    opexRatio: 0.50,
    fnbRevenueRatio: 0.10,
    commission: 0.08,
    canSell: true,
    sellingPriceMultiplier: 2.5,
    minSqftRequired: 2000,
  },
  zo_selections: {
    label: 'Zo Selections',
    description: 'Boutique hotel — premium full-service hospitality',
    icon: '🌟',
    defaultSqftPerUnit: 300,
    minUnits: 8,
    maxUnits: 60,
    constructionCost: { prefab: 3000, traditional: 4800, renovation: 2200 },
    defaultADR: { metro: 5000, beach: 6000, mountain: 4500, heritage: 4000, offbeat: 3000, pilgrimage: 2500, suburban: 3500 },
    defaultOccupancy: 62,
    opexRatio: 0.55,
    fnbRevenueRatio: 0.35,
    commission: 0.10,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 3000,
  },
  event_space: {
    label: 'Event Space',
    description: 'Weddings, conferences, corporate retreats',
    icon: '🎪',
    defaultSqftPerUnit: 3000,
    minUnits: 1,
    maxUnits: 5,
    constructionCost: { prefab: 1500, traditional: 2500, renovation: 1000 },
    defaultADR: { metro: 50000, beach: 75000, mountain: 40000, heritage: 60000, offbeat: 30000, pilgrimage: 25000, suburban: 35000 },
    defaultOccupancy: 35,
    opexRatio: 0.30,
    fnbRevenueRatio: 0.50,
    commission: 0.05,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 2000,
  },
  coworking: {
    label: 'Co-working Space',
    description: 'Flexible workspace for remote workers and teams',
    icon: '💻',
    defaultSqftPerUnit: 50,
    minUnits: 10,
    maxUnits: 200,
    constructionCost: { prefab: 1200, traditional: 2000, renovation: 800 },
    defaultADR: { metro: 500, beach: 400, mountain: 350, heritage: 300, offbeat: 250, pilgrimage: 200, suburban: 400 },
    defaultOccupancy: 65,
    opexRatio: 0.30,
    fnbRevenueRatio: 0.15,
    commission: 0.05,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 500,
  },
  restaurant_bar: {
    label: 'Restaurant / Bar / Cafe',
    description: 'F&B outlet — standalone or integrated',
    icon: '🍽️',
    defaultSqftPerUnit: 1500,
    minUnits: 1,
    maxUnits: 3,
    constructionCost: { prefab: 2000, traditional: 3500, renovation: 1500 },
    defaultADR: { metro: 25000, beach: 30000, mountain: 18000, heritage: 20000, offbeat: 12000, pilgrimage: 10000, suburban: 15000 },
    defaultOccupancy: 70,
    opexRatio: 0.60,
    fnbRevenueRatio: 1.0,
    commission: 0.0,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 500,
  },
  farm_agritourism: {
    label: 'Farm / Agri-tourism',
    description: 'Farm stays, organic experiences, rural tourism',
    icon: '🌾',
    defaultSqftPerUnit: 500,
    minUnits: 2,
    maxUnits: 20,
    constructionCost: { prefab: 1500, traditional: 2200, renovation: 1000 },
    defaultADR: { metro: 3000, beach: 3500, mountain: 2500, heritage: 2000, offbeat: 1800, pilgrimage: 1200, suburban: 2500 },
    defaultOccupancy: 40,
    opexRatio: 0.38,
    fnbRevenueRatio: 0.40,
    commission: 0.10,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 2000,
  },
  glamping: {
    label: 'Glamping / Camping',
    description: 'Luxury camping — domes, tents, treehouses',
    icon: '⛺',
    defaultSqftPerUnit: 250,
    minUnits: 4,
    maxUnits: 30,
    constructionCost: { prefab: 1200, traditional: 1800, renovation: 800 },
    defaultADR: { metro: 4000, beach: 5000, mountain: 4500, heritage: 3000, offbeat: 3500, pilgrimage: 2000, suburban: 2500 },
    defaultOccupancy: 42,
    opexRatio: 0.35,
    fnbRevenueRatio: 0.30,
    commission: 0.10,
    canSell: false,
    sellingPriceMultiplier: 0,
    minSqftRequired: 1000,
  },
};

// Occupancy curves by month (Jan=0, Dec=11) for each location tier
// Values are multipliers of the base occupancy (e.g., 1.1 = 110% of base)
export const SEASONALITY: Record<LocationTier, number[]> = {
  metro:       [0.85, 0.88, 0.92, 0.90, 0.82, 0.75, 0.70, 0.72, 0.80, 0.95, 1.05, 1.10],
  beach:       [1.15, 1.10, 1.05, 0.85, 0.65, 0.50, 0.45, 0.50, 0.70, 0.95, 1.15, 1.20],
  mountain:    [0.60, 0.65, 0.80, 1.00, 1.15, 1.20, 1.10, 0.95, 0.90, 1.05, 0.75, 0.65],
  heritage:    [1.10, 1.05, 0.95, 0.80, 0.70, 0.60, 0.65, 0.70, 0.85, 1.10, 1.20, 1.15],
  offbeat:     [0.70, 0.75, 0.85, 0.95, 1.00, 0.90, 0.85, 0.80, 0.95, 1.10, 1.05, 0.80],
  pilgrimage:  [0.90, 0.95, 1.10, 1.15, 0.80, 0.70, 0.75, 0.80, 0.95, 1.10, 1.05, 1.00],
  suburban:    [0.85, 0.88, 0.90, 0.88, 0.85, 0.80, 0.78, 0.80, 0.85, 0.92, 0.98, 1.00],
};

// Ramp-up multipliers for new properties (year 1 to 5+)
export const OCCUPANCY_RAMPUP = [0.55, 0.70, 0.82, 0.90, 0.95];

// INR formatting
export const formatINR = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
export const formatYears = (years: number): string => years < 1 ? `${Math.round(years * 12)} months` : `${years.toFixed(1)} years`;

export const APPROVAL_COST_PERCENT = 0.04; // 4% of construction cost
export const INTERIOR_COST_PERCENT = 0.15; // 15% of construction cost
export const LANDSCAPING_PERCENT = 0.05; // 5% of construction cost
export const WORKING_CAPITAL_PERCENT = 0.08; // 8% of total
export const CONTINGENCY_PERCENT = 0.07; // 7% of total

export const ADR_GROWTH_RATE = 0.05; // 5% annual
export const OPEX_INFLATION = 0.04; // 4% annual
export const DISCOUNT_RATE = 0.12; // 12% for NPV

export const LOCATION_TIERS: { value: LocationTier; label: string }[] = [
  { value: 'metro', label: 'Metro / Tier-1 City' },
  { value: 'beach', label: 'Beach / Coastal' },
  { value: 'mountain', label: 'Mountain / Hill Station' },
  { value: 'heritage', label: 'Heritage / Cultural' },
  { value: 'offbeat', label: 'Offbeat / Emerging' },
  { value: 'pilgrimage', label: 'Pilgrimage / Religious' },
  { value: 'suburban', label: 'Suburban / Tier-2 City' },
];

export const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'land', label: 'Vacant Land / Plot' },
  { value: 'building', label: 'Existing Building' },
  { value: 'brownfield', label: 'Brownfield (Abandoned / Underused)' },
  { value: 'greenfield', label: 'Greenfield (Undeveloped)' },
  { value: 'plot', label: 'Residential Plot' },
];

export const TERRAIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'hilly', label: 'Hilly / Sloped' },
  { value: 'coastal', label: 'Coastal' },
  { value: 'forest', label: 'Forest / Wooded' },
  { value: 'desert', label: 'Desert / Arid' },
  { value: 'riverside', label: 'Riverside / Waterfront' },
];

// OpEx sub-ratios per product type — each sums to the product's opexRatio
export const OPEX_BREAKDOWN: Record<ZoProductType, {
  staffSalaries: number;
  utilities: number;
  maintenance: number;
  marketing: number;
  insurance: number;
  propertyTax: number;
  consumables: number;
  technology: number;
  miscellaneous: number;
}> = {
  zostel:          { staffSalaries: 0.14, utilities: 0.05, maintenance: 0.04, marketing: 0.06, insurance: 0.02, propertyTax: 0.02, consumables: 0.04, technology: 0.02, miscellaneous: 0.03 }, // 0.42
  zostel_plus:     { staffSalaries: 0.15, utilities: 0.06, maintenance: 0.05, marketing: 0.06, insurance: 0.02, propertyTax: 0.02, consumables: 0.04, technology: 0.02, miscellaneous: 0.03 }, // 0.45
  zostel_home:     { staffSalaries: 0.10, utilities: 0.04, maintenance: 0.04, marketing: 0.05, insurance: 0.02, propertyTax: 0.02, consumables: 0.03, technology: 0.02, miscellaneous: 0.03 }, // 0.35
  zo_house:        { staffSalaries: 0.13, utilities: 0.05, maintenance: 0.04, marketing: 0.05, insurance: 0.02, propertyTax: 0.02, consumables: 0.04, technology: 0.02, miscellaneous: 0.03 }, // 0.40
  zo_villa:        { staffSalaries: 0.16, utilities: 0.06, maintenance: 0.06, marketing: 0.06, insurance: 0.03, propertyTax: 0.03, consumables: 0.04, technology: 0.02, miscellaneous: 0.04 }, // 0.50
  zo_selections:   { staffSalaries: 0.18, utilities: 0.07, maintenance: 0.06, marketing: 0.07, insurance: 0.03, propertyTax: 0.03, consumables: 0.05, technology: 0.02, miscellaneous: 0.04 }, // 0.55
  event_space:     { staffSalaries: 0.10, utilities: 0.04, maintenance: 0.03, marketing: 0.04, insurance: 0.02, propertyTax: 0.02, consumables: 0.02, technology: 0.01, miscellaneous: 0.02 }, // 0.30
  coworking:       { staffSalaries: 0.08, utilities: 0.05, maintenance: 0.03, marketing: 0.04, insurance: 0.02, propertyTax: 0.02, consumables: 0.02, technology: 0.02, miscellaneous: 0.02 }, // 0.30
  restaurant_bar:  { staffSalaries: 0.20, utilities: 0.06, maintenance: 0.05, marketing: 0.06, insurance: 0.03, propertyTax: 0.02, consumables: 0.10, technology: 0.02, miscellaneous: 0.06 }, // 0.60
  farm_agritourism:{ staffSalaries: 0.12, utilities: 0.04, maintenance: 0.04, marketing: 0.05, insurance: 0.02, propertyTax: 0.02, consumables: 0.04, technology: 0.02, miscellaneous: 0.03 }, // 0.38
  glamping:        { staffSalaries: 0.10, utilities: 0.04, maintenance: 0.05, marketing: 0.05, insurance: 0.02, propertyTax: 0.02, consumables: 0.03, technology: 0.01, miscellaneous: 0.03 }, // 0.35
};

// Default room types for hostel/hospitality products
export const DEFAULT_ROOM_TYPES: Partial<Record<ZoProductType, RoomTypeConfig[]>> = {
  zostel: [
    { name: '8-Bed Dorm', count: 6, sqftPerUnit: 80, adr: 600, occupancy: 75 },
    { name: '4-Bed Dorm', count: 3, sqftPerUnit: 100, adr: 900, occupancy: 70 },
    { name: 'Private Double', count: 2, sqftPerUnit: 200, adr: 1800, occupancy: 65 },
  ],
  zostel_plus: [
    { name: '4-Bed Dorm', count: 4, sqftPerUnit: 120, adr: 1200, occupancy: 70 },
    { name: 'Private Double', count: 5, sqftPerUnit: 200, adr: 2500, occupancy: 68 },
    { name: 'Suite', count: 3, sqftPerUnit: 350, adr: 4000, occupancy: 60 },
  ],
  zo_house: [
    { name: 'Shared Bunk', count: 5, sqftPerUnit: 80, adr: 800, occupancy: 80 },
    { name: 'Private Room', count: 4, sqftPerUnit: 180, adr: 1500, occupancy: 75 },
    { name: 'Studio', count: 2, sqftPerUnit: 300, adr: 2500, occupancy: 70 },
  ],
  zo_selections: [
    { name: 'Deluxe Room', count: 6, sqftPerUnit: 250, adr: 4000, occupancy: 65 },
    { name: 'Premium Suite', count: 3, sqftPerUnit: 400, adr: 6000, occupancy: 58 },
    { name: 'Grand Suite', count: 1, sqftPerUnit: 600, adr: 10000, occupancy: 45 },
  ],
  zostel_home: [
    { name: 'Standard Room', count: 2, sqftPerUnit: 300, adr: 2500, occupancy: 58 },
    { name: 'Family Room', count: 1, sqftPerUnit: 500, adr: 4000, occupancy: 50 },
  ],
  glamping: [
    { name: 'Bell Tent', count: 4, sqftPerUnit: 200, adr: 3500, occupancy: 45 },
    { name: 'Dome', count: 3, sqftPerUnit: 250, adr: 5000, occupancy: 40 },
    { name: 'Treehouse', count: 1, sqftPerUnit: 350, adr: 7000, occupancy: 35 },
  ],
};

export const WIZARD_STEPS = [
  { id: 1, label: 'Property', icon: '📍' },
  { id: 2, label: 'Market Research', icon: '📊' },
  { id: 3, label: 'Product Mix', icon: '🏗️' },
  { id: 4, label: 'Financials', icon: '💰' },
  { id: 5, label: 'Risk Assessment', icon: '⚠️' },
  { id: 6, label: 'Vision', icon: '🎨' },
  { id: 7, label: 'Decision', icon: '✅' },
];
