import { useEngine } from '@/hooks/useEngine';
import { PRODUCT_CATALOG, formatINR } from '@/lib/constants';
import { generateProductRecommendations } from '@/lib/ai';
import type { ProductRecommendation, ZoProductType, BuildStyle } from '@/lib/types';

export default function Step3Product() {
  const { state, dispatch, recalculate } = useEngine();
  const products = state.recommendations;

  const runRecommendation = async () => {
    if (!state.marketResearch) return;
    dispatch({ type: 'SET_LOADING', key: 'isLoadingRecommendations', value: true });
    try {
      const result = await generateProductRecommendations(state.propertyInput, state.marketResearch);
      dispatch({ type: 'SET_RECOMMENDATIONS', data: result });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: `Recommendation failed: ${err}` });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'isLoadingRecommendations', value: false });
    }
  };

  const updateProduct = (index: number, data: Partial<ProductRecommendation>) => {
    dispatch({ type: 'UPDATE_PRODUCT', index, data });
  };

  const addProduct = (productType: ZoProductType) => {
    const catalog = PRODUCT_CATALOG[productType];
    const tier = state.propertyInput.locationTier || 'metro';
    const newProduct: ProductRecommendation = {
      id: `product-${Date.now()}`,
      productType,
      label: catalog.label,
      unitCount: catalog.minUnits,
      avgSqftPerUnit: catalog.defaultSqftPerUnit,
      totalSqft: catalog.minUnits * catalog.defaultSqftPerUnit,
      adr: catalog.defaultADR[tier],
      targetOccupancy: catalog.defaultOccupancy,
      retainOrSell: 'retain',
      constructionCostPerSqft: catalog.constructionCost[state.buildStyle],
      reasoning: 'Manually added',
      buildStyle: state.buildStyle,
    };
    dispatch({ type: 'ADD_PRODUCT', data: newProduct });
  };

  const totalSqft = products.reduce((s, p) => s + p.totalSqft, 0);
  const availableSqft = state.propertyInput.existingSqftBuiltUp || state.propertyInput.areaSqft || 0;

  if (state.isLoadingRecommendations) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">AI is designing your product mix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Mix</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {totalSqft.toLocaleString()} / {availableSqft.toLocaleString()} sqft utilized
          </p>
        </div>
        <div className="flex gap-2">
          {state.marketResearch && (
            <button onClick={runRecommendation} className="px-4 py-2 rounded-lg bg-violet text-white text-sm hover:opacity-90 transition">
              AI Recommend
            </button>
          )}
          <button onClick={recalculate} className="px-4 py-2 rounded-lg bg-emerald text-white text-sm hover:opacity-90 transition">
            Calculate
          </button>
        </div>
      </div>

      {/* Build Style */}
      <div className="glass-card p-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Build Style:</span>
        {(['prefab', 'traditional', 'renovation'] as BuildStyle[]).map(style => (
          <button key={style} onClick={() => {
            dispatch({ type: 'SET_BUILD_STYLE', style });
            // Update all products' construction cost
            products.forEach((p, i) => {
              const catalog = PRODUCT_CATALOG[p.productType];
              if (catalog) updateProduct(i, { constructionCostPerSqft: catalog.constructionCost[style], buildStyle: style });
            });
          }}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${state.buildStyle === style ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </button>
        ))}
      </div>

      {/* Utilization Bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Area Utilization</span>
          <span>{Math.round((totalSqft / (availableSqft || 1)) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-cyan rounded-full transition-all"
            style={{ width: `${Math.min(100, (totalSqft / (availableSqft || 1)) * 100)}%` }} />
        </div>
      </div>

      {/* Product Cards */}
      {products.map((product, index) => {
        const catalog = PRODUCT_CATALOG[product.productType];
        return (
          <div key={product.id} className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{catalog?.icon}</span>
                <div>
                  <h3 className="font-semibold">{product.label}</h3>
                  <p className="text-xs text-muted-foreground">{catalog?.description}</p>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'REMOVE_PRODUCT', index })}
                className="text-destructive text-sm hover:underline">Remove</button>
            </div>

            <p className="text-xs text-cyan bg-cyan/10 px-3 py-2 rounded-lg">{product.reasoning}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Units</label>
                <input type="number" value={product.unitCount} onChange={e => updateProduct(index, {
                  unitCount: Number(e.target.value),
                  totalSqft: Number(e.target.value) * product.avgSqftPerUnit,
                })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Sqft / Unit</label>
                <input type="number" value={product.avgSqftPerUnit} onChange={e => updateProduct(index, {
                  avgSqftPerUnit: Number(e.target.value),
                  totalSqft: product.unitCount * Number(e.target.value),
                })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">ADR (INR)</label>
                <input type="number" value={product.adr} onChange={e => updateProduct(index, { adr: Number(e.target.value) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Occupancy %</label>
                <input type="number" value={product.targetOccupancy} onChange={e => updateProduct(index, { targetOccupancy: Number(e.target.value) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Total: {product.totalSqft.toLocaleString()} sqft</span>
                <span>Construction: {formatINR(product.constructionCostPerSqft)}/sqft</span>
                <span>Total Build: {formatINR(product.totalSqft * product.constructionCostPerSqft)}</span>
              </div>
              {catalog?.canSell && (
                <div className="flex items-center gap-2">
                  <button onClick={() => updateProduct(index, { retainOrSell: 'retain' })}
                    className={`px-3 py-1 rounded text-xs ${product.retainOrSell === 'retain' ? 'bg-emerald text-white' : 'bg-secondary'}`}>
                    Retain
                  </button>
                  <button onClick={() => updateProduct(index, { retainOrSell: 'sell' })}
                    className={`px-3 py-1 rounded text-xs ${product.retainOrSell === 'sell' ? 'bg-amber text-black' : 'bg-secondary'}`}>
                    Sell
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Product */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Add Product</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(PRODUCT_CATALOG) as [ZoProductType, typeof PRODUCT_CATALOG[ZoProductType]][]).map(([key, cat]) => (
            <button key={key} onClick={() => addProduct(key)}
              className="px-3 py-2 rounded-lg bg-secondary text-sm hover:bg-primary hover:text-white transition flex items-center gap-2">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
