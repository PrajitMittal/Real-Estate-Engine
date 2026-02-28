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
  "growthTrend": "growing/stable/declining with context"
}

Include at least 5 real competitors with realistic ADR, ratings, and review counts for the area.
Base seasonality on actual tourism patterns for this specific location.
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

export function buildRenderPrompt(
  productType: ZoProductType,
  location: string,
  viewType: 'exterior' | 'interior' | 'aerial',
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

  return `Professional architectural visualization render of a ${catalog?.label || productType} in ${location}, India.
${styleMap[productType]}.
${viewDesc}.
Photorealistic, golden hour lighting, warm tones, inviting atmosphere, architectural photography style.
Modern Indian hospitality design that blends contemporary style with local cultural elements.
High quality, 8K, detailed, professional real estate marketing photography.`;
}
