import { useEngine } from '@/hooks/useEngine';
import { generateMarketResearch } from '@/lib/ai';
import { formatINR } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Step2Market() {
  const { state, dispatch } = useEngine();
  const market = state.marketResearch;

  const runResearch = async () => {
    dispatch({ type: 'SET_LOADING', key: 'isLoadingMarket', value: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const result = await generateMarketResearch(state.propertyInput);
      dispatch({ type: 'SET_MARKET_RESEARCH', data: result });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: `Market research failed: ${err}` });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'isLoadingMarket', value: false });
    }
  };

  if (!market && !state.isLoadingMarket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="text-6xl">📊</div>
        <h2 className="text-2xl font-bold">Market Research</h2>
        <p className="text-muted-foreground text-center max-w-md">
          AI will analyze the hospitality market around {state.propertyInput.location || 'your property'},
          including competitors, pricing, demand, and seasonality.
        </p>
        <button onClick={runResearch}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition">
          Run AI Market Research
        </button>
        {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      </div>
    );
  }

  if (state.isLoadingMarket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Analyzing {state.propertyInput.city} market...</p>
        <p className="text-xs text-muted-foreground">Researching competitors, pricing, demand drivers</p>
      </div>
    );
  }

  if (!market) return null;

  const seasonData = market.seasonality.map((occ, i) => ({ month: MONTHS[i], occupancy: occ }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Research</h2>
          <p className="text-muted-foreground text-sm mt-1">{state.propertyInput.city}, {state.propertyInput.state}</p>
        </div>
        <button onClick={runResearch} className="px-4 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition">
          Re-run Research
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <p className="text-sm leading-relaxed">{market.summary}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg ADR', value: formatINR(market.avgADR), color: 'text-emerald' },
          { label: 'Avg Occupancy', value: `${market.avgOccupancy}%`, color: 'text-cyan' },
          { label: 'Land Rate', value: `${formatINR(market.avgLandRate)}/sqft`, color: 'text-amber' },
          { label: 'Rental Yield', value: market.rentalYieldRange, color: 'text-violet' },
        ].map(m => (
          <div key={m.label} className="glass-card p-4 metric-card">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Competitors */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Competitive Landscape</h3>
        <div className="space-y-3">
          {market.competitors.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{c.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.distanceKm} km away · {c.reviewCount} reviews</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald">{formatINR(c.adr)}</p>
                <p className="text-xs text-amber">★ {c.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonality Chart */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Seasonal Occupancy Pattern</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonData}>
              <defs>
                <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f15824" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f15824" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a8578' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8578' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E2D8', color: '#2b2b2a', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="occupancy" stroke="#f15824" fill="url(#occGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Drivers & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-emerald uppercase tracking-wider">Demand Drivers</h3>
          {market.demandDrivers.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-emerald mt-0.5">▸</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-cyan uppercase tracking-wider">Opportunities</h3>
          {market.opportunities.map((o, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-cyan mt-0.5">▸</span>
              <span>{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Target & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Tourist Footfall</p>
          <p className="text-sm font-medium mt-1">{market.touristFootfall}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Target Demographic</p>
          <p className="text-sm font-medium mt-1">{market.targetDemographic}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Growth Trend</p>
          <p className="text-sm font-medium mt-1">{market.growthTrend}</p>
        </div>
      </div>

      {/* Demand-Supply Gap */}
      {market.demandSupplyGap && (
        <div className="glass-card p-6 space-y-3 border border-amber/30">
          <h3 className="text-sm font-semibold text-amber uppercase tracking-wider">Demand-Supply Gap</h3>
          <p className="text-sm leading-relaxed">{market.demandSupplyGap}</p>
        </div>
      )}

      {/* Segment Demand */}
      {market.segmentDemand && market.segmentDemand.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Segment Demand Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {market.segmentDemand.map((seg, i) => (
              <div key={i} className="bg-secondary/50 rounded-lg p-3">
                <p className="font-medium text-sm">{seg.segment}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-primary">{seg.share}%</span>
                  <span className={`text-xs ${seg.trend === 'growing' ? 'text-emerald' : seg.trend === 'declining' ? 'text-rose' : 'text-muted-foreground'}`}>
                    {seg.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Use Cases & Micro Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {market.alternativeUseCases && market.alternativeUseCases.length > 0 && (
          <div className="glass-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-violet uppercase tracking-wider">Alternative Use Cases</h3>
            {market.alternativeUseCases.map((u, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-violet mt-0.5">+</span>
                <span>{u}</span>
              </div>
            ))}
          </div>
        )}
        {market.microMarketTrends && market.microMarketTrends.length > 0 && (
          <div className="glass-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-cyan uppercase tracking-wider">Micro-Market Trends</h3>
            {market.microMarketTrends.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-cyan mt-0.5">~</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparable Transactions */}
      {market.comparableTransactions && market.comparableTransactions.length > 0 && (
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Comparable Transactions</h3>
          <div className="space-y-2">
            {market.comparableTransactions.map((txn, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{txn.description}</p>
                  {txn.date && <p className="text-xs text-muted-foreground mt-0.5">{txn.date}</p>}
                </div>
                <span className="font-bold text-emerald">{formatINR(txn.pricePerSqft)}/sqft</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Notes */}
      {market.regulatoryNotes && (
        <div className="glass-card p-6 space-y-3 border border-amber/20 bg-amber/5">
          <h3 className="text-sm font-semibold text-amber uppercase tracking-wider">Regulatory Notes</h3>
          <p className="text-sm leading-relaxed">{market.regulatoryNotes}</p>
        </div>
      )}
    </div>
  );
}
