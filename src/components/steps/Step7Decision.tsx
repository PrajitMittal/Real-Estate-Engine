import { useEngine } from '@/hooks/useEngine';
import { formatINR, formatPercent, formatYears } from '@/lib/constants';
import { saveState } from '@/lib/storage';
import { useState } from 'react';

export default function Step7Decision() {
  const { state, recalculate } = useEngine();
  const [saved, setSaved] = useState(false);
  const [saveName, setSaveName] = useState('');

  const v = state.viability;
  const fin = state.financials;
  const capex = state.capex;

  if (!v || !fin || !capex) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold">Go / No-Go Decision</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Complete the financial analysis to see the viability assessment.
        </p>
        <button onClick={recalculate} className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition">
          Calculate Viability
        </button>
      </div>
    );
  }

  const handleSave = () => {
    const name = saveName || `${state.propertyInput.city}-${Date.now()}`;
    saveState(state, name);
    setSaved(true);
  };

  const ratingColors: Record<string, string> = {
    excellent: 'from-emerald to-cyan',
    good: 'from-primary to-amber',
    moderate: 'from-amber to-orange-500',
    poor: 'from-rose to-red-700',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Decision */}
      <div className={`glass-card p-8 bg-gradient-to-br ${ratingColors[v.rating]} bg-opacity-10 text-center space-y-4`}>
        <div className="text-6xl">
          {v.rating === 'excellent' ? '🚀' : v.rating === 'good' ? '✅' : v.rating === 'moderate' ? '⚠️' : '🚫'}
        </div>
        <div>
          <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold badge-${v.rating}`}>
            {v.rating.toUpperCase()}
          </span>
        </div>
        <p className="text-xl font-bold">{v.recommendation}</p>
        <div className="flex justify-center">
          <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${ratingColors[v.rating]}`}
              style={{ width: `${v.score}%` }} />
          </div>
          <span className="ml-3 text-sm font-medium">{Math.round(v.score)}/100</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-4 metric-card">
          <p className="text-xs text-muted-foreground">Total Investment</p>
          <p className="text-lg font-bold mt-1">{formatINR(capex.totalCapex)}</p>
        </div>
        <div className="glass-card p-4 metric-card">
          <p className="text-xs text-muted-foreground">Base IRR</p>
          <p className={`text-lg font-bold mt-1 ${fin.base.irr > 15 ? 'text-emerald' : 'text-amber'}`}>{formatPercent(fin.base.irr)}</p>
        </div>
        <div className="glass-card p-4 metric-card">
          <p className="text-xs text-muted-foreground">NPV</p>
          <p className={`text-lg font-bold mt-1 ${fin.base.npv > 0 ? 'text-emerald' : 'text-rose'}`}>{formatINR(fin.base.npv)}</p>
        </div>
        <div className="glass-card p-4 metric-card">
          <p className="text-xs text-muted-foreground">MOIC</p>
          <p className="text-lg font-bold mt-1">{fin.base.moic.toFixed(2)}x</p>
        </div>
        <div className="glass-card p-4 metric-card">
          <p className="text-xs text-muted-foreground">Payback</p>
          <p className="text-lg font-bold mt-1">{formatYears(fin.base.paybackYears)}</p>
        </div>
      </div>

      {/* Scenario Range */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">IRR Range</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Bear</p>
            <p className="text-lg font-bold text-rose">{formatPercent(fin.bear.irr)}</p>
          </div>
          <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-rose via-amber to-emerald relative">
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-primary shadow-lg"
              style={{ left: `${Math.min(100, Math.max(0, ((fin.base.irr - fin.bear.irr) / (fin.bull.irr - fin.bear.irr)) * 100))}%` }} />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Bull</p>
            <p className="text-lg font-bold text-emerald">{formatPercent(fin.bull.irr)}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-emerald uppercase tracking-wider">Strengths</h3>
          {v.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-emerald">✓</span>
              <span>{s}</span>
            </div>
          ))}
          {v.strengths.length === 0 && <p className="text-sm text-muted-foreground">No significant strengths identified</p>}
        </div>
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-rose uppercase tracking-wider">Weaknesses</h3>
          {v.weaknesses.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-rose">✗</span>
              <span>{w}</span>
            </div>
          ))}
          {v.weaknesses.length === 0 && <p className="text-sm text-muted-foreground">No significant weaknesses identified</p>}
        </div>
      </div>

      {/* Risk Score */}
      {state.risks && (
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground capitalize">Overall: {state.risks.rating}</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              state.risks.overallScore < 25 ? 'text-emerald' : state.risks.overallScore < 50 ? 'text-amber' : 'text-rose'
            }`}>{state.risks.overallScore}/100</p>
            <p className="text-xs text-muted-foreground">{state.risks.items.length} risks identified</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Recommended Next Steps</h3>
        {v.nextSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* Product Summary */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Product Mix Summary</h3>
        <div className="space-y-2">
          {state.recommendations.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
              <span className="text-sm font-medium">{p.label}</span>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{p.unitCount} units</span>
                <span>{p.totalSqft.toLocaleString()} sqft</span>
                <span>ADR: {formatINR(p.adr)}</span>
                <span className={`px-2 py-0.5 rounded ${p.retainOrSell === 'retain' ? 'bg-emerald/20 text-emerald' : 'bg-amber/20 text-amber'}`}>
                  {p.retainOrSell}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input value={saveName} onChange={e => setSaveName(e.target.value)}
              placeholder={`${state.propertyInput.city || 'Project'} evaluation`}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleSave}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition ${saved ? 'bg-emerald text-white' : 'bg-primary text-white hover:opacity-90'}`}>
            {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={() => window.print()}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 transition">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
