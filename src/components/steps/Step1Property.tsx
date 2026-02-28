import { useEngine } from '@/hooks/useEngine';
import { PROPERTY_TYPES, TERRAIN_OPTIONS, LOCATION_TIERS } from '@/lib/constants';
import { DEMO_STATE } from '@/data/demo';
import type { PropertyInput } from '@/lib/types';

export default function Step1Property() {
  const { state, dispatch, recalculate } = useEngine();
  const p = state.propertyInput;

  const update = (data: Partial<PropertyInput>) => dispatch({ type: 'SET_PROPERTY', data });

  const loadDemo = () => {
    if (DEMO_STATE.propertyInput) {
      dispatch({ type: 'SET_PROPERTY', data: DEMO_STATE.propertyInput });
      if (DEMO_STATE.marketResearch) dispatch({ type: 'SET_MARKET_RESEARCH', data: DEMO_STATE.marketResearch });
      if (DEMO_STATE.recommendations) dispatch({ type: 'SET_RECOMMENDATIONS', data: DEMO_STATE.recommendations });
      if (DEMO_STATE.buildStyle) dispatch({ type: 'SET_BUILD_STYLE', style: DEMO_STATE.buildStyle });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Brief</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter what you know — we'll figure out the rest</p>
        </div>
        <button onClick={loadDemo} className="px-4 py-2 rounded-lg bg-violet text-white text-sm hover:opacity-90 transition">
          Load Demo (Gurgaon)
        </button>
      </div>

      {/* Core Info */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Location / Address *</label>
            <input value={p.location || ''} onChange={e => update({ location: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Main Golf Course Road" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">City *</label>
            <input value={p.city || ''} onChange={e => update({ city: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Gurgaon" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">State</label>
            <input value={p.state || ''} onChange={e => update({ state: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Haryana" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Country</label>
            <input value={p.country || ''} onChange={e => update({ country: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="India" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Google Maps Link</label>
            <input value={p.mapLink || ''} onChange={e => update({ mapLink: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://maps.google.com/..." />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Coordinates</label>
            <input value={p.coordinates || ''} onChange={e => update({ coordinates: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="28.4595, 77.0266" />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Area (sqft) *</label>
            <input type="number" value={p.areaSqft || ''} onChange={e => update({ areaSqft: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="3000" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Property Type</label>
            <select value={p.propertyType || ''} onChange={e => update({ propertyType: e.target.value as PropertyInput['propertyType'] })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select...</option>
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Location Tier</label>
            <select value={p.locationTier || ''} onChange={e => update({ locationTier: e.target.value as PropertyInput['locationTier'] })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select...</option>
              {LOCATION_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Terrain</label>
            <select value={p.terrain || ''} onChange={e => update({ terrain: e.target.value as PropertyInput['terrain'] })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select...</option>
              {TERRAIN_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Land Cost / sqft (INR)</label>
            <input type="number" value={p.landCostPerSqft || ''} onChange={e => {
              const perSqft = Number(e.target.value);
              update({ landCostPerSqft: perSqft, totalLandCost: perSqft * (p.areaSqft || 0) });
            }}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="45000" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Total Land Cost (INR)</label>
            <input type="number" value={p.totalLandCost || ''} onChange={e => update({ totalLandCost: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="135000000" />
          </div>
        </div>
      </div>

      {/* Structure & Access */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Structure & Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={p.existingStructure || false}
              onChange={e => update({ existingStructure: e.target.checked })}
              className="w-4 h-4 accent-primary" />
            <label className="text-sm">Has existing structure</label>
          </div>
          {p.existingStructure && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Built-up Area (sqft)</label>
                <input type="number" value={p.existingSqftBuiltUp || ''} onChange={e => update({ existingSqftBuiltUp: Number(e.target.value) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Number of Floors</label>
                <input type="number" value={p.numberOfFloors || ''} onChange={e => update({ numberOfFloors: Number(e.target.value) })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Distance to City Center (km)</label>
            <input type="number" value={p.distanceToCity ?? ''} onChange={e => update({ distanceToCity: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Distance to Airport (km)</label>
            <input type="number" value={p.distanceToAirport ?? ''} onChange={e => update({ distanceToAirport: Number(e.target.value) })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nearest Tourist Attraction</label>
            <input value={p.nearestTouristAttraction || ''} onChange={e => update({ nearestTouristAttraction: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Description</h3>
        <textarea value={p.description || ''} onChange={e => update({ description: e.target.value })}
          rows={3}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Describe anything about the property — condition, surroundings, history, potential..." />
      </div>

      {/* Summary card */}
      {p.location && p.areaSqft && (
        <div className="glass-card p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald" />
            <span className="text-sm font-medium">Ready for analysis</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {p.areaSqft?.toLocaleString()} sqft {p.propertyType || 'property'} at {p.location}, {p.city}
            {p.totalLandCost ? ` — Land cost: ₹${(p.totalLandCost / 10000000).toFixed(2)} Cr` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
