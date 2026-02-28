import { useState } from 'react';
import { useEngine } from '@/hooks/useEngine';
import { formatINR, formatPercent, formatYears } from '@/lib/constants';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#f15824', '#33CCCC', '#00AA77', '#FFAA00', '#FF0066', '#FF5500', '#9955CC'];

type Tab = 'pnl' | 'scenarios' | 'leaseback' | 'debt';

export default function Step4Financial() {
  const { state, recalculate, calculateDebt } = useEngine();
  const [tab, setTab] = useState<Tab>('pnl');
  const [ltvRatio, setLtvRatio] = useState(0.6);
  const [intRate, setIntRate] = useState(0.10);
  const [tenure, setTenure] = useState(10);

  const fin = state.financials;
  const capex = state.capex;

  if (!fin || !capex) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="text-6xl">💰</div>
        <h2 className="text-2xl font-bold">Financial Engine</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Configure your product mix in the previous step, then calculate financials.
        </p>
        <button onClick={recalculate} className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition">
          Run Financial Model
        </button>
      </div>
    );
  }

  const base = fin.base;
  const revenueData = base.projections.map(p => ({
    year: `Y${p.year}`,
    Hospitality: Math.round(p.revenue.hospitalityRevenue / 100000),
    'F&B': Math.round(p.revenue.fnbRevenue / 100000),
    Events: Math.round(p.revenue.eventRevenue / 100000),
    'Co-working': Math.round(p.revenue.coworkingRevenue / 100000),
    EBITDA: Math.round(p.ebitda / 100000),
  }));

  const capexData = [
    { name: 'Land', value: capex.landCost },
    { name: 'Construction', value: capex.constructionCost },
    { name: 'Approvals', value: capex.approvalsCost },
    { name: 'Interiors', value: capex.interiorsFurniture },
    { name: 'Landscaping', value: capex.landscaping },
    { name: 'Working Capital', value: capex.workingCapital },
    { name: 'Contingency', value: capex.contingency },
  ].filter(d => d.value > 0);

  const scenarioData = [
    { metric: 'IRR', Bear: fin.bear.irr, Base: fin.base.irr, Bull: fin.bull.irr },
    { metric: 'NPV (L)', Bear: Math.round(fin.bear.npv / 100000), Base: Math.round(fin.base.npv / 100000), Bull: Math.round(fin.bull.npv / 100000) },
    { metric: 'MOIC', Bear: fin.bear.moic, Base: fin.base.moic, Bull: fin.bull.moic },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Engine</h2>
        <button onClick={recalculate} className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 transition">
          Recalculate
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Capex', value: formatINR(capex.totalCapex), color: 'text-foreground' },
          { label: 'IRR', value: formatPercent(base.irr), color: base.irr > 15 ? 'text-emerald' : 'text-amber' },
          { label: 'NPV', value: formatINR(base.npv), color: base.npv > 0 ? 'text-emerald' : 'text-rose' },
          { label: 'MOIC', value: `${base.moic.toFixed(2)}x`, color: base.moic > 2 ? 'text-emerald' : 'text-amber' },
          { label: 'Payback', value: formatYears(base.paybackYears), color: base.paybackYears < 7 ? 'text-emerald' : 'text-amber' },
        ].map(m => (
          <div key={m.label} className="glass-card p-4 metric-card">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {([
          { id: 'pnl', label: 'P&L Projection' },
          { id: 'scenarios', label: 'Scenarios' },
          { id: 'leaseback', label: 'Sale-Leaseback' },
          { id: 'debt', label: 'Debt Analysis' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-2 rounded-md text-sm transition ${tab === t.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* P&L Tab */}
      {tab === 'pnl' && (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Revenue & EBITDA (in Lakhs)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    {['Hospitality', 'F&B', 'Events', 'Co-working'].map((key, i) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#8a8578' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8a8578' }} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  {['Hospitality', 'F&B', 'Events', 'Co-working'].map((key, i) => (
                    <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={COLORS[i]} fill={`url(#grad-${key})`} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Capex Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={capexData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {capexData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {capexData.map((d, i) => (
                  <div key={d.name} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: COLORS[i % COLORS.length] }} />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-medium">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projection Table */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">10-Year Projection</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-4">Year</th>
                  <th className="text-right py-2 px-2">Revenue</th>
                  <th className="text-right py-2 px-2">OpEx</th>
                  <th className="text-right py-2 px-2">EBITDA</th>
                  <th className="text-right py-2 px-2">Net CF</th>
                  <th className="text-right py-2 pl-2">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {base.projections.map(p => (
                  <tr key={p.year} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">Y{p.year}</td>
                    <td className="text-right py-2 px-2">{formatINR(p.totalRevenue)}</td>
                    <td className="text-right py-2 px-2 text-rose">{formatINR(p.opex)}</td>
                    <td className="text-right py-2 px-2 text-emerald">{formatINR(p.ebitda)}</td>
                    <td className="text-right py-2 px-2">{formatINR(p.netCashflow)}</td>
                    <td className={`text-right py-2 pl-2 font-medium ${p.cumulativeCashflow >= 0 ? 'text-emerald' : 'text-rose'}`}>
                      {formatINR(p.cumulativeCashflow)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scenarios Tab */}
      {tab === 'scenarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[fin.bear, fin.base, fin.bull].map(s => (
              <div key={s.label} className={`glass-card p-6 space-y-3 ${s.label === 'Base Case' ? 'border-primary/50 border' : ''}`}>
                <h3 className="font-semibold text-center">{s.label}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">IRR</span><span className={s.irr > 15 ? 'text-emerald font-bold' : 'text-amber font-bold'}>{formatPercent(s.irr)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">NPV</span><span className="font-medium">{formatINR(s.npv)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">MOIC</span><span className="font-medium">{s.moic.toFixed(2)}x</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payback</span><span className="font-medium">{formatYears(s.paybackYears)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Capex</span><span className="font-medium">{formatINR(s.capex.totalCapex)}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Scenario Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData}>
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#8a8578' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8a8578' }} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333333', borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="Bear" fill="#FF0066" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Base" fill="#f15824" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bull" fill="#00AA77" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Sale-Leaseback Tab */}
      {tab === 'leaseback' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.saleLeasebackModels.map(model => (
            <div key={model.type} className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-lg">{model.label}</h3>
              <p className="text-xs text-muted-foreground">{model.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Investor Yield</span><span className="text-emerald font-bold">{formatPercent(model.investorYield)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zo Mgmt Fee</span><span>{formatPercent(model.managementFee)}</span></div>
                <hr className="border-border" />
                <div className="flex justify-between"><span className="text-muted-foreground">Investor Annual</span><span className="text-emerald">{formatINR(model.investorAnnualCashflow)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zo Annual</span><span className="text-cyan">{formatINR(model.zoAnnualCashflow)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debt Tab */}
      {tab === 'debt' && (
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Debt Assumptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">LTV Ratio: {Math.round(ltvRatio * 100)}%</label>
                <input type="range" min="0" max="0.8" step="0.05" value={ltvRatio} onChange={e => setLtvRatio(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Interest Rate: {(intRate * 100).toFixed(1)}%</label>
                <input type="range" min="0.06" max="0.18" step="0.005" value={intRate} onChange={e => setIntRate(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tenure: {tenure} years</label>
                <input type="range" min="3" max="20" step="1" value={tenure} onChange={e => setTenure(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
            <button onClick={() => calculateDebt(ltvRatio, intRate, tenure)}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 transition">
              Calculate Debt Scenario
            </button>
          </div>

          {state.debt && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 metric-card">
                <p className="text-xs text-muted-foreground">Loan Amount</p>
                <p className="text-xl font-bold mt-1">{formatINR(state.debt.loanAmount)}</p>
              </div>
              <div className="glass-card p-4 metric-card">
                <p className="text-xs text-muted-foreground">Monthly EMI</p>
                <p className="text-xl font-bold mt-1 text-amber">{formatINR(state.debt.emi)}</p>
              </div>
              <div className="glass-card p-4 metric-card">
                <p className="text-xs text-muted-foreground">Leveraged IRR</p>
                <p className={`text-xl font-bold mt-1 ${state.debt.leveragedIRR > 15 ? 'text-emerald' : 'text-amber'}`}>{formatPercent(state.debt.leveragedIRR)}</p>
              </div>
              <div className="glass-card p-4 metric-card">
                <p className="text-xs text-muted-foreground">DSCR</p>
                <p className={`text-xl font-bold mt-1 ${state.debt.dscr > 1.5 ? 'text-emerald' : 'text-rose'}`}>{state.debt.dscr === Infinity ? '∞' : state.debt.dscr.toFixed(2)}x</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
