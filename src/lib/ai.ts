// ============================================
// Zo Real Estate Engine — AI Integration
// ============================================

import type { PropertyInput, MarketResearch, ProductRecommendation, RiskAssessment, ZoProductType } from './types';
import { PRODUCT_CATALOG } from './constants';
import { buildMarketResearchPrompt, buildProductRecommendationPrompt, buildRiskAssessmentPrompt, buildRenderPrompt } from './prompts';

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, temperature: 0.7, max_tokens: 4000 }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || data.error);
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.error('AI call failed:', err);
    throw err;
  }
}

function parseJSON<T>(text: string): T {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(raw);
}

// ─── Market Research ─────────────────────────────────────────
export async function generateMarketResearch(property: Partial<PropertyInput>): Promise<MarketResearch> {
  const prompt = buildMarketResearchPrompt(property);
  const response = await callOpenRouter([
    { role: 'system', content: 'You are a real estate market research analyst specializing in Indian hospitality markets. Always respond with valid JSON only.' },
    { role: 'user', content: prompt },
  ]);
  return parseJSON<MarketResearch>(response);
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

  // Enrich with catalog defaults
  return raw.map((r, i) => {
    const catalog = PRODUCT_CATALOG[r.productType];
    const avgSqft = r.avgSqftPerUnit || catalog?.defaultSqftPerUnit || 200;
    const tier = property.locationTier || 'metro';
    return {
      id: `product-${i}`,
      productType: r.productType,
      label: catalog?.label || r.productType,
      unitCount: r.unitCount,
      avgSqftPerUnit: avgSqft,
      totalSqft: avgSqft * r.unitCount,
      adr: r.adr || catalog?.defaultADR[tier] || 2000,
      targetOccupancy: r.targetOccupancy || catalog?.defaultOccupancy || 65,
      sellingPricePerSqft: catalog?.canSell ? (catalog.constructionCost.traditional * catalog.sellingPriceMultiplier) : undefined,
      retainOrSell: (r.retainOrSell as 'retain' | 'sell') || 'retain',
      constructionCostPerSqft: catalog?.constructionCost[r.buildStyle as 'prefab' | 'traditional' | 'renovation' || 'traditional'] || 3000,
      reasoning: r.reasoning,
      buildStyle: (r.buildStyle as 'prefab' | 'traditional' | 'renovation') || 'traditional',
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
  const scored = items.map((item, i) => ({
    ...item,
    id: `risk-${i}`,
    riskScore: item.severity * item.likelihood,
  }));
  const avgScore = scored.length > 0 ? scored.reduce((s, r) => s + r.riskScore, 0) / scored.length : 0;
  const overallScore = Math.round((avgScore / 25) * 100); // Normalize to 0-100
  return {
    items: scored,
    overallScore,
    rating: overallScore < 25 ? 'low' : overallScore < 50 ? 'moderate' : overallScore < 75 ? 'high' : 'critical',
  };
}

// ─── Conceptual Render ───────────────────────────────────────
export async function generateRender(
  productType: ZoProductType,
  location: string,
  viewType: 'exterior' | 'interior' | 'aerial' = 'exterior',
): Promise<string> {
  const prompt = buildRenderPrompt(productType, location, viewType);
  try {
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.data?.[0]?.url || '';
  } catch (err) {
    console.error('Render generation failed:', err);
    throw err;
  }
}
