// ============================================
// Zo Real Estate Engine — AI Prompt Templates
// ============================================

import type { PropertyInput, MarketResearch, ProductRecommendation } from './types';
import { PRODUCT_CATALOG } from './constants';
import type { ZoProductType } from './types';

export function buildMarketResearchPrompt(property: Partial<PropertyInput>): string {
  return `Conduct a detailed real estate and hospitality market research for this property location. Research real market data.

PROPERTY DETAILS:
- Location: ${property.location || 'Unknown'}, ${property.city || ''}, ${property.state || ''}, ${property.country || 'India'}
- Area: ${property.areaSqft || 'Unknown'} sqft
- Property Type: ${property.propertyType || 'Unknown'}
- Terrain: ${property.terrain || 'Unknown'}
- Distance to City: ${property.distanceToCity || 'Unknown'} km
- Distance to Airport: ${property.distanceToAirport || 'Unknown'} km
- Description: ${property.description || 'None provided'}

Think broadly and creatively. Don't limit to obvious hospitality uses — consider co-working, F&B, wellness, student housing, corporate retreats, farm stays, event spaces, and any alternative use cases the property could support.

RESEARCH AND RETURN JSON in this exact format (no markdown, no extra text):
{
  "summary": "2-3 sentence market overview",
  "competitors": [
    {"name": "Hotel/Hostel Name", "type": "hotel/hostel/resort/homestay", "distanceKm": 2, "adr": 3500, "rating": 4.2, "reviewCount": 500, "strengths": "key strength"}
  ],
  "avgADR": 3000,
  "avgOccupancy": 65,
  "demandDrivers": ["driver1", "driver2", "driver3"],
  "seasonality": [65, 60, 55, 50, 45, 40, 42, 48, 55, 65, 72, 75],
  "touristFootfall": "X lakh visitors annually",
  "rentalYieldRange": "4-8%",
  "avgLandRate": 15000,
  "opportunities": ["opportunity1", "opportunity2"],
  "risks": ["risk1", "risk2"],
  "targetDemographic": "description of target customers",
  "growthTrend": "growing/stable/declining with context",
  "demandSupplyGap": "Analysis of demand vs supply in this micro-market",
  "alternativeUseCases": ["co-working space", "wellness retreat", "student housing"],
  "microMarketTrends": ["trend with 2-5 year outlook"],
  "regulatoryNotes": "Key regulatory considerations for this location",
  "segmentDemand": [
    {"segment": "Backpackers", "share": 30, "trend": "growing"},
    {"segment": "Business travelers", "share": 25, "trend": "stable"}
  ],
  "comparableTransactions": [
    {"description": "Similar property transaction nearby", "pricePerSqft": 25000, "date": "2024-06"}
  ]
}

Include at least 5 real competitors with realistic ADR, ratings, and review counts for the area.
Base seasonality on actual tourism patterns for this specific location.
Include 3-5 alternative use cases beyond obvious hospitality.
Include demand-supply gap analysis for the micro-market.
Include 2-4 segment demand breakdowns with growth trends.
Include any relevant regulatory notes for this specific city/state.
All monetary values in INR.`;
}

export function buildProductRecommendationPrompt(
  property: Partial<PropertyInput>,
  market: MarketResearch,
): string {
  const catalogDesc = Object.entries(PRODUCT_CATALOG)
    .map(([key, val]) => `- ${key}: ${val.label} — ${val.description} (min ${val.minSqftRequired} sqft)`)
    .join('\n');

  return `You are a hospitality product strategist for Zo World. Based on the property and market research, recommend the optimal product mix.

PROPERTY:
- Location: ${property.location}, ${property.city}, ${property.state}
- Area: ${property.areaSqft} sqft
- Type: ${property.propertyType || 'land'}
- Terrain: ${property.terrain || 'flat'}
- Existing Structure: ${property.existingStructure ? 'Yes' : 'No'}
${property.existingStructureDetails ? `- Structure Details: ${property.existingStructureDetails}` : ''}

MARKET RESEARCH:
- Avg ADR in area: ₹${market.avgADR}
- Avg Occupancy: ${market.avgOccupancy}%
- Demand Drivers: ${market.demandDrivers.join(', ')}
- Target Demographic: ${market.targetDemographic}
- Growth Trend: ${market.growthTrend}

AVAILABLE PRODUCT TYPES:
${catalogDesc}

CONSTRAINTS:
- Total built-up area cannot exceed ${property.areaSqft || 3000} sqft (can use FSI if applicable)
- Multi-product sites are allowed and encouraged if land permits
- Consider the market demand, competition, and location characteristics
- Include reasoning for each product recommendation

RETURN JSON array (no markdown, no extra text):
[
  {
    "productType": "zostel_plus",
    "unitCount": 10,
    "avgSqftPerUnit": 200,
    "adr": 2500,
    "targetOccupancy": 68,
    "retainOrSell": "retain",
    "reasoning": "Why this product fits",
    "buildStyle": "traditional"
  }
]

Recommend 1-4 products that best utilize the available area.`;
}

export function buildRiskAssessmentPrompt(
  property: Partial<PropertyInput>,
  products: ProductRecommendation[],
  irr: number,
  totalCapex: number,
): string {
  const productList = products.map(p => `${p.label} (${p.unitCount} units)`).join(', ');

  return `Assess risks for this real estate hospitality project. Be specific to the location and product mix.

PROJECT:
- Location: ${property.location}, ${property.city}, ${property.state}, ${property.country}
- Property Type: ${property.propertyType || 'land'}
- Area: ${property.areaSqft} sqft
- Products: ${productList}
- Total Capex: ₹${totalCapex?.toLocaleString('en-IN')}
- Projected IRR: ${irr.toFixed(1)}%
- Zoning: ${property.zoning || 'Unknown'}
- Terrain: ${property.terrain || 'Unknown'}

RETURN JSON array of risk items (no markdown, no extra text):
[
  {
    "category": "regulatory|market|construction|financial|operational|environmental|political",
    "title": "Short risk title",
    "description": "Detailed risk description specific to this project",
    "severity": 1-5,
    "likelihood": 1-5,
    "mitigation": "Specific mitigation strategy"
  }
]

Include 6-10 risks covering different categories. Be specific to ${property.city || 'the location'}, not generic.`;
}

export interface RenderContext {
  areaSqft?: number;
  unitCount?: number;
  avgSqftPerUnit?: number;
  buildStyle?: string;
  terrain?: string;
  numberOfFloors?: number;
  photoAnalysis?: string;
}

export function buildRenderPrompt(
  productType: ZoProductType,
  location: string,
  viewType: 'exterior' | 'interior' | 'aerial',
  context?: RenderContext,
): string {
  const catalog = PRODUCT_CATALOG[productType];
  const styleMap: Record<ZoProductType, string> = {
    zostel: 'vibrant backpacker hostel with colorful murals, common areas, hammocks, and rooftop gathering space',
    zostel_plus: 'boutique hostel with modern minimalist design, wooden accents, green plants, cozy reading nooks',
    zostel_home: 'charming curated homestay with local architecture, warm interiors, courtyard, traditional elements',
    zo_house: 'modern co-living space with open workspaces, communal kitchen, rooftop garden, shared living areas',
    zo_villa: 'luxury villa with private pool, floor-to-ceiling windows, premium furnishings, landscaped gardens',
    zo_selections: 'boutique hotel with elegant lobby, designer rooms, infinity pool, spa, rooftop restaurant',
    event_space: 'stunning event venue with open-air pavilion, fairy lights, stage area, manicured lawns',
    coworking: 'creative coworking space with standing desks, phone booths, meeting rooms, cafe area, fast wifi',
    restaurant_bar: 'trendy restaurant and bar with open kitchen, craft cocktail bar, outdoor seating, ambient lighting',
    farm_agritourism: 'rustic farm stay with organic gardens, animal pens, outdoor dining, bonfire area, nature trails',
    glamping: 'luxury glamping site with geodesic domes, safari tents, stargazing decks, campfire circles',
  };

  const viewDesc = viewType === 'aerial'
    ? 'aerial drone view showing the full property layout and surroundings'
    : viewType === 'interior'
    ? 'interior view showing the designed spaces, furniture, and ambiance'
    : 'exterior architectural view showing the building facade, entrance, and landscaping';

  // Size-appropriate description
  const area = context?.areaSqft || 0;
  const sizeDesc = area <= 2000 ? 'small, intimate'
    : area <= 5000 ? 'medium-sized, compact'
    : area <= 15000 ? 'sizeable'
    : 'large, expansive';

  // Build style guidance
  const buildStyleDesc: Record<string, string> = {
    prefab: 'modern industrial-chic prefabricated construction, clean lines, metal and glass',
    traditional: 'local masonry and traditional construction, regional materials, cultural architecture',
    renovation: 'blend of restored heritage structure with contemporary additions',
  };

  // Terrain context
  const terrainDesc: Record<string, string> = {
    flat: 'flat terrain',
    hilly: 'hillside with terraced levels and mountain views',
    coastal: 'beachfront with sea views and tropical landscaping',
    forest: 'forest setting with trees and natural surroundings',
    desert: 'arid desert landscape with earth-tone palette',
    riverside: 'waterfront property along a river',
  };

  let prompt = `Professional architectural visualization render of a ${catalog?.label || productType} in ${location}, India.
${styleMap[productType]}.
${viewDesc}.`;

  if (context) {
    prompt += `\n\nIMPORTANT SCALE CONSTRAINT: This is a ${sizeDesc} property on ${area.toLocaleString()} sqft of land. Do NOT render a palace, grand resort, or massive complex.`;
    if (context.unitCount) {
      prompt += ` It has ${context.unitCount} rooms/units, each approximately ${context.avgSqftPerUnit || 150} sqft.`;
    }
    if (context.numberOfFloors) {
      prompt += ` The building is ${context.numberOfFloors} floors tall.`;
    }
    if (context.buildStyle && buildStyleDesc[context.buildStyle]) {
      prompt += `\nBuild style: ${buildStyleDesc[context.buildStyle]}.`;
    }
    if (context.terrain && terrainDesc[context.terrain]) {
      prompt += `\nSetting: ${terrainDesc[context.terrain]}.`;
    }
    if (context.photoAnalysis) {
      prompt += `\nBased on actual site photos: ${context.photoAnalysis}. Match the existing surroundings and architectural context.`;
    }
  }

  prompt += `\nPhotorealistic, golden hour lighting, warm tones, inviting atmosphere, architectural photography style.
Modern Indian hospitality design that blends contemporary style with local cultural elements.
High quality, 8K, detailed, professional real estate marketing photography.`;

  return prompt;
}
