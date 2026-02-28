import { useState } from 'react';
import { useEngine } from '@/hooks/useEngine';
import { PRODUCT_CATALOG, DEFAULT_ROOM_TYPES, formatINR } from '@/lib/constants';
import { generateProductRecommendations } from '@/lib/ai';
import type { ProductRecommendation, ZoProductType, BuildStyle, RoomTypeConfig } from '@/lib/types';

export default function Step3Product() {
  const { state, dispatch, recalculate } = useEngine();
  const products = state.recommendations;
  const [expandedRoomTypes, setExpandedRoomTypes] = useState<Record<number, boolean>>({});

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
  const isOverAllocated = availableSqft > 0 && totalSqft > availableSqft;
  const utilizationPercent = Math.round((totalSqft / (availableSqft || 1)) * 100);

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
            <button onClick={runRecommendation} className="px-4 py-2 rounded-lg gradient-brand text-white text-sm hover:opacity-90 transition zo-btn">
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
      <div className={`glass-card p-4 ${isOverAllocated ? 'border border-rose/50' : ''}`}>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">Area Utilization</span>
          <span className={isOverAllocated ? 'text-rose font-medium' : 'text-muted-foreground'}>
            {utilizationPercent}%{isOverAllocated ? ' — Over-allocated!' : ''}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${isOverAllocated ? 'bg-rose' : 'bg-gradient-to-r from-primary to-cyan'}`}
            style={{ width: `${Math.min(100, utilizationPercent)}%` }} />
        </div>
        {isOverAllocated && (
          <p className="text-xs text-rose mt-2">
            Total product area ({totalSqft.toLocaleString()} sqft) exceeds available area ({availableSqft.toLocaleString()} sqft). Consider reducing units or sqft per unit.
          </p>
        )}
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
                <label className="block text-xs text-muted-foreground mb-1">Units ({catalog?.minUnits}-{catalog?.maxUnits})</label>
                <input type="number" value={product.unitCount}
                  min={catalog?.minUnits || 1} max={catalog?.maxUnits || 200}
                  onChange={e => {
                    const val = Math.max(1, Number(e.target.value) || 0);
                    updateProduct(index, { unitCount: val, totalSqft: val * product.avgSqftPerUnit });
                  }}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Sqft / Unit</label>
                <input type="number" value={product.avgSqftPerUnit} min={10}
                  onChange={e => {
                    const val = Math.max(10, Number(e.target.value) || 0);
                    updateProduct(index, { avgSqftPerUnit: val, totalSqft: product.unitCount * val });
                  }}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">ADR (INR)</label>
                <input type="number" value={product.adr} min={0}
                  onChange={e => updateProduct(index, { adr: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Occupancy %</label>
                <input type="number" value={product.targetOccupancy} min={5} max={100}
                  onChange={e => updateProduct(index, { targetOccupancy: Math.min(100, Math.max(5, Number(e.target.value) || 0)) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            {/* Room Types */}
            {DEFAULT_ROOM_TYPES[product.productType] && (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedRoomTypes(prev => ({ ...prev, [index]: !prev[index] }))}
                  className="w-full flex items-center justify-between px-4 py-2 bg-secondary/30 text-sm hover:bg-secondary/50 transition">
                  <span className="font-medium text-muted-foreground">Room Types ({product.roomTypes?.length || DEFAULT_ROOM_TYPES[product.productType]!.length})</span>
                  <span className="text-xs text-primary">{expandedRoomTypes[index] ? 'Collapse' : 'Expand'}</span>
                </button>
                {expandedRoomTypes[index] && (() => {
                  const roomTypes = product.roomTypes || DEFAULT_ROOM_TYPES[product.productType]!;
                  // Initialize room types on first expand if not set
                  if (!product.roomTypes) {
                    updateProduct(index, { roomTypes: [...DEFAULT_ROOM_TYPES[product.productType]!] });
                  }
                  return (
                    <div className="p-4 space-y-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground border-b border-border">
                            <th className="text-left py-1 pr-2">Room Type</th>
                            <th className="text-right py-1 px-2">Count</th>
                            <th className="text-right py-1 px-2">Sqft</th>
                            <th className="text-right py-1 px-2">ADR</th>
                            <th className="text-right py-1 px-2">Occ %</th>
                            <th className="text-right py-1 pl-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomTypes.map((rt, ri) => (
                            <tr key={ri} className="border-b border-border/30">
                              <td className="py-1.5 pr-2">
                                <input value={rt.name} onChange={e => {
                                  const updated = [...roomTypes];
                                  updated[ri] = { ...updated[ri], name: e.target.value };
                                  const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                  const weightedADR = Math.round(updated.reduce((s, r) => s + r.adr * r.count, 0) / (totalUnits || 1));
                                  const weightedOcc = Math.round(updated.reduce((s, r) => s + r.occupancy * r.count, 0) / (totalUnits || 1));
                                  updateProduct(index, { roomTypes: updated, unitCount: totalUnits, adr: weightedADR, targetOccupancy: weightedOcc });
                                }}
                                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                              </td>
                              <td className="py-1.5 px-2">
                                <input type="number" value={rt.count} min={0} onChange={e => {
                                  const updated = [...roomTypes];
                                  updated[ri] = { ...updated[ri], count: Math.max(0, Number(e.target.value) || 0) };
                                  const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                  const weightedADR = Math.round(updated.reduce((s, r) => s + r.adr * r.count, 0) / (totalUnits || 1));
                                  const weightedOcc = Math.round(updated.reduce((s, r) => s + r.occupancy * r.count, 0) / (totalUnits || 1));
                                  const avgSqft = Math.round(updated.reduce((s, r) => s + r.sqftPerUnit * r.count, 0) / (totalUnits || 1));
                                  updateProduct(index, { roomTypes: updated, unitCount: totalUnits, adr: weightedADR, targetOccupancy: weightedOcc, avgSqftPerUnit: avgSqft, totalSqft: totalUnits * avgSqft });
                                }}
                                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary" />
                              </td>
                              <td className="py-1.5 px-2">
                                <input type="number" value={rt.sqftPerUnit} min={10} onChange={e => {
                                  const updated = [...roomTypes];
                                  updated[ri] = { ...updated[ri], sqftPerUnit: Math.max(10, Number(e.target.value) || 0) };
                                  const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                  const avgSqft = Math.round(updated.reduce((s, r) => s + r.sqftPerUnit * r.count, 0) / (totalUnits || 1));
                                  updateProduct(index, { roomTypes: updated, avgSqftPerUnit: avgSqft, totalSqft: totalUnits * avgSqft });
                                }}
                                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary" />
                              </td>
                              <td className="py-1.5 px-2">
                                <input type="number" value={rt.adr} min={0} onChange={e => {
                                  const updated = [...roomTypes];
                                  updated[ri] = { ...updated[ri], adr: Math.max(0, Number(e.target.value) || 0) };
                                  const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                  const weightedADR = Math.round(updated.reduce((s, r) => s + r.adr * r.count, 0) / (totalUnits || 1));
                                  updateProduct(index, { roomTypes: updated, adr: weightedADR });
                                }}
                                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary" />
                              </td>
                              <td className="py-1.5 px-2">
                                <input type="number" value={rt.occupancy} min={5} max={100} onChange={e => {
                                  const updated = [...roomTypes];
                                  updated[ri] = { ...updated[ri], occupancy: Math.min(100, Math.max(5, Number(e.target.value) || 0)) };
                                  const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                  const weightedOcc = Math.round(updated.reduce((s, r) => s + r.occupancy * r.count, 0) / (totalUnits || 1));
                                  updateProduct(index, { roomTypes: updated, targetOccupancy: weightedOcc });
                                }}
                                  className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary" />
                              </td>
                              <td className="py-1.5 pl-2 text-center">
                                {roomTypes.length > 1 && (
                                  <button onClick={() => {
                                    const updated = roomTypes.filter((_, j) => j !== ri);
                                    const totalUnits = updated.reduce((s, r) => s + r.count, 0);
                                    const weightedADR = Math.round(updated.reduce((s, r) => s + r.adr * r.count, 0) / (totalUnits || 1));
                                    const weightedOcc = Math.round(updated.reduce((s, r) => s + r.occupancy * r.count, 0) / (totalUnits || 1));
                                    const avgSqft = Math.round(updated.reduce((s, r) => s + r.sqftPerUnit * r.count, 0) / (totalUnits || 1));
                                    updateProduct(index, { roomTypes: updated, unitCount: totalUnits, adr: weightedADR, targetOccupancy: weightedOcc, avgSqftPerUnit: avgSqft, totalSqft: totalUnits * avgSqft });
                                  }}
                                    className="text-destructive hover:underline">×</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button onClick={() => {
                        const updated = [...roomTypes, { name: 'New Room', count: 1, sqftPerUnit: 150, adr: 1000, occupancy: 60 }];
                        updateProduct(index, { roomTypes: updated });
                      }}
                        className="px-3 py-1 rounded bg-secondary text-xs hover:bg-secondary/80 transition">
                        + Add Room Type
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

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
