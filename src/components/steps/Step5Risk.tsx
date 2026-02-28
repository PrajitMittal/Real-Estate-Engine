import { useEngine } from '@/hooks/useEngine';
import { generateRiskAssessment } from '@/lib/ai';

const SEVERITY_COLORS = ['', 'bg-emerald', 'bg-cyan', 'bg-amber', 'bg-orange-500', 'bg-rose'];
const CATEGORY_ICONS: Record<string, string> = {
  regulatory: '📋', market: '📈', construction: '🏗️', financial: '💰',
  operational: '⚙️', environmental: '🌿', political: '🏛️',
};

export default function Step5Risk() {
  const { state, dispatch } = useEngine();
  const risks = state.risks;

  const runRiskAssessment = async () => {
    dispatch({ type: 'SET_LOADING', key: 'isLoadingRisks', value: true });
    try {
      const result = await generateRiskAssessment(
        state.propertyInput,
        state.recommendations,
        state.financials?.base.irr || 0,
        state.capex?.totalCapex || 0,
      );
      dispatch({ type: 'SET_RISKS', data: result });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: `Risk assessment failed: ${err}` });
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'isLoadingRisks', value: false });
    }
  };

  if (state.isLoadingRisks) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-amber border-t-transparent animate-spin" />
        <p className="text-muted-foreground">Assessing risks for {state.propertyInput.city}...</p>
      </div>
    );
  }

  if (!risks) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold">Risk Assessment</h2>
        <p className="text-muted-foreground text-center max-w-md">
          AI will identify project-specific risks and mitigation strategies.
        </p>
        <button onClick={runRiskAssessment}
          className="px-6 py-3 rounded-lg bg-amber text-black font-medium hover:opacity-90 transition">
          Run Risk Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Assessment</h2>
          <p className="text-muted-foreground text-sm mt-1">{risks.items.length} risks identified</p>
        </div>
        <button onClick={runRiskAssessment} className="px-4 py-2 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition">
          Re-assess
        </button>
      </div>

      {/* Overall Score */}
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E2D8" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke={risks.overallScore < 25 ? '#10b981' : risks.overallScore < 50 ? '#f59e0b' : risks.overallScore < 75 ? '#f97316' : '#ef4444'}
              strokeWidth="8" strokeDasharray={`${risks.overallScore * 2.51} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{risks.overallScore}</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold capitalize">Risk Level: <span className={
            risks.rating === 'low' ? 'text-emerald' : risks.rating === 'moderate' ? 'text-amber' : risks.rating === 'high' ? 'text-orange-500' : 'text-rose'
          }>{risks.rating}</span></p>
          <p className="text-sm text-muted-foreground mt-1">
            {risks.rating === 'low' ? 'Minimal risks — proceed with confidence' :
             risks.rating === 'moderate' ? 'Manageable risks — implement mitigations before proceeding' :
             risks.rating === 'high' ? 'Significant risks — careful planning and contingencies required' :
             'Critical risks — fundamental concerns that may block the project'}
          </p>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="space-y-3">
        {risks.items.sort((a, b) => b.riskScore - a.riskScore).map(risk => (
          <div key={risk.id} className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CATEGORY_ICONS[risk.category] || '⚡'}</span>
                <div>
                  <h4 className="font-medium">{risk.title}</h4>
                  <span className="text-xs text-muted-foreground capitalize">{risk.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-2 h-4 rounded-sm ${i <= risk.severity ? SEVERITY_COLORS[risk.severity] : 'bg-secondary'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Score: {risk.riskScore}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{risk.description}</p>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-3">
              <p className="text-xs text-emerald font-medium mb-1">Mitigation</p>
              <p className="text-sm">{risk.mitigation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
