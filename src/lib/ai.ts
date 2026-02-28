// ============================================
// Zo Real Estate Engine — AI Integration
// ============================================

import type { PropertyInput, MarketResearch, ProductRecommendation, RiskAssessment, ZoProductType } from './types';
import { PRODUCT_CATALOG } from './constants';
import { buildMarketResearchPrompt, buildProductRecommendationPrompt, buildRiskAssessmentPrompt, buildRenderPrompt, type RenderContext } from './prompts';

// ─── Retry with exponential backoff ──────────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ─── Fetch with timeout ─────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 60000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  return withRetry(async () => {
    const res = await fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.7, max_tokens: 4000 }),
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
      const msg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
      throw new Error(msg);
    }
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');
    return content;
  });
}

function parseJSON<T>(text: string): T {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let raw = jsonMatch ? jsonMatch[1].trim() : text.trim();

  // Try to fix common AI JSON issues
  // Remove trailing commas before } or ]
  raw = raw.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract JSON array or object from surrounding text
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    const extracted = arrayMatch?.[0] || objectMatch?.[0];
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch { /* fall through */ }
    }
    throw new Error('Failed to parse AI response as JSON. The AI returned an invalid format.');
  }
}

// ─── Validation helpers ──────────────────────────────────────
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function validateMarketResearch(data: MarketResearch): MarketResearch {
  return {
    ...data,
    avgADR: Math.max(0, data.avgADR || 0),
    avgOccupancy: clamp(data.avgOccupancy || 60, 0, 100),
    competitors: Array.isArray(data.competitors) ? data.competitors.map(c => ({
      ...c,
      adr: Math.max(0, c.adr || 0),
      rating: clamp(c.rating || 3, 0, 5),
      distanceKm: Math.max(0, c.distanceKm || 0),
      reviewCount: Math.max(0, c.reviewCount || 0),
    })) : [],
    seasonality: Array.isArray(data.seasonality) && data.seasonality.length === 12
      ? data.seasonality.map(v => clamp(v || 50, 0, 100))
      : [65, 65, 70, 60, 50, 45, 40, 45, 55, 70, 75, 72],
    demandDrivers: Array.isArray(data.demandDrivers) ? data.demandDrivers : [],
    opportunities: Array.isArray(data.opportunities) ? data.opportunities : [],
    risks: Array.isArray(data.risks) ? data.risks : [],
    summary: data.summary || 'Market research completed.',
    touristFootfall: data.touristFootfall || 'Data unavailable',
    rentalYieldRange: data.rentalYieldRange || '3-6%',
    avgLandRate: Math.max(0, data.avgLandRate || 0),
    targetDemographic: data.targetDemographic || 'Mixed demographics',
    growthTrend: data.growthTrend || 'Stable',
    // Extended fields (optional)
    demandSupplyGap: data.demandSupplyGap || undefined,
    alternativeUseCases: Array.isArray(data.alternativeUseCases) ? data.alternativeUseCases : undefined,
    microMarketTrends: Array.isArray(data.microMarketTrends) ? data.microMarketTrends : undefined,
    regulatoryNotes: data.regulatoryNotes || undefined,
    segmentDemand: Array.isArray(data.segmentDemand) ? data.segmentDemand.map(s => ({
      segment: s.segment || 'Unknown',
      share: clamp(s.share || 0, 0, 100),
      trend: s.trend || 'stable',
    })) : undefined,
    comparableTransactions: Array.isArray(data.comparableTransactions) ? data.comparableTransactions.map(t => ({
      description: t.description || '',
      pricePerSqft: Math.max(0, t.pricePerSqft || 0),
      date: t.date || '',
    })) : undefined,
  };
}

// ─── Market Research ─────────────────────────────────────────
export async function generateMarketResearch(property: Partial<PropertyInput>): Promise<MarketResearch> {
  const prompt = buildMarketResearchPrompt(property);
  const response = await callOpenRouter([
    { role: 'system', content: 'You are a real estate market research analyst specializing in Indian hospitality markets. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ]);
  const raw = parseJSON<MarketResearch>(response);
  return validateMarketResearch(raw);
}

// ─── Product Recommendations ─────────────────────────────────
export async function generateProductRecommendations(
  property: Partial<PropertyInput>,
  market: MarketResearch,
): Promise<ProductRecommendation[]> {
  const prompt = buildProductRecommendationPrompt(property, market);
  const response = await callOpenRouter([
    { role: 'system', content: 'You are a hospitality product strategist for Zo World. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ]);
  const raw = parseJSON<Array<{
    productType: ZoProductType;
    unitCount: number;
    avgSqftPerUnit?: number;
    adr?: number;
    targetOccupancy?: number;
    retainOrSell?: string;
    reasoning: string;
    buildStyle?: string;
  }>>(response);

  // Validate and enrich with catalog defaults
  return raw
    .filter(r => PRODUCT_CATALOG[r.productType]) // Skip unknown product types
    .map((r, i) => {
      const catalog = PRODUCT_CATALOG[r.productType];
      const avgSqft = r.avgSqftPerUnit || catalog.defaultSqftPerUnit;
      const tier = property.locationTier || 'metro';
      const unitCount = clamp(r.unitCount || catalog.minUnits, catalog.minUnits, catalog.maxUnits);
      const buildStyle = (['prefab', 'traditional', 'renovation'].includes(r.buildStyle || '')
        ? r.buildStyle : 'traditional') as 'prefab' | 'traditional' | 'renovation';

      return {
        id: `product-${i}`,
        productType: r.productType,
        label: catalog.label,
        unitCount,
        avgSqftPerUnit: avgSqft,
        totalSqft: avgSqft * unitCount,
        adr: Math.max(0, r.adr || catalog.defaultADR[tier]),
        targetOccupancy: clamp(r.targetOccupancy || catalog.defaultOccupancy, 10, 100),
        sellingPricePerSqft: catalog.canSell ? (catalog.constructionCost.traditional * catalog.sellingPriceMultiplier) : undefined,
        retainOrSell: (r.retainOrSell === 'sell' ? 'sell' : 'retain') as 'retain' | 'sell',
        constructionCostPerSqft: catalog.constructionCost[buildStyle],
        reasoning: r.reasoning || 'AI recommended',
        buildStyle,
      };
    });
}

// ─── Risk Assessment ─────────────────────────────────────────
export async function generateRiskAssessment(
  property: Partial<PropertyInput>,
  products: ProductRecommendation[],
  irr: number,
  capex: number,
): Promise<RiskAssessment> {
  const prompt = buildRiskAssessmentPrompt(property, products, irr, capex);
  const response = await callOpenRouter([
    { role: 'system', content: 'You are a real estate risk analyst. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ]);
  const items = parseJSON<RiskAssessment['items']>(response);

  // Validate severity/likelihood are within 1-5 range
  const scored = (Array.isArray(items) ? items : []).map((item, i) => ({
    ...item,
    id: `risk-${i}`,
    severity: clamp(item.severity || 3, 1, 5) as 1 | 2 | 3 | 4 | 5,
    likelihood: clamp(item.likelihood || 3, 1, 5) as 1 | 2 | 3 | 4 | 5,
    riskScore: clamp(item.severity || 3, 1, 5) * clamp(item.likelihood || 3, 1, 5),
    category: item.category || 'operational',
    title: item.title || 'Risk item',
    description: item.description || '',
    mitigation: item.mitigation || 'Monitor and review regularly',
  }));

  const avgScore = scored.length > 0 ? scored.reduce((s, r) => s + r.riskScore, 0) / scored.length : 0;
  // Max possible risk score per item = 5*5 = 25; normalize to 0-100
  const overallScore = Math.round((avgScore / 25) * 100);
  return {
    items: scored,
    overallScore,
    rating: overallScore < 25 ? 'low' : overallScore < 50 ? 'moderate' : overallScore < 75 ? 'high' : 'critical',
  };
}

// ─── Photo Analysis (GPT-4o Vision) ─────────────────────────
export async function analyzePropertyPhotos(
  photos: string[],
  propertyContext: string,
): Promise<string> {
  return withRetry(async () => {
    const res = await fetchWithTimeout('/api/analyze-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: photos.slice(0, 5), propertyContext }),
    }, 90000);

    if (!res.ok) {
      throw new Error(`Photo analysis returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
    }
    return data.description || 'Unable to analyze photos.';
  }, 1);
}

// ─── Conceptual Render ───────────────────────────────────────
export async function generateRender(
  productType: ZoProductType,
  location: string,
  viewType: 'exterior' | 'interior' | 'aerial' = 'exterior',
  context?: RenderContext,
): Promise<string> {
  const prompt = buildRenderPrompt(productType, location, viewType, context);
  return withRetry(async () => {
    const res = await fetchWithTimeout('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }, 90000); // 90s timeout for image generation

    if (!res.ok) {
      throw new Error(`Render API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
      const msg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
      throw new Error(msg);
    }
    const url = data.data?.[0]?.url;
    if (!url) throw new Error('No image URL returned from render API');
    return url;
  }, 1); // 1 retry for renders (they're expensive)
}
