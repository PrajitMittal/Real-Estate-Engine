import { useState } from 'react';
import { useEngine } from '@/hooks/useEngine';
import { generateRender, analyzePropertyPhotos } from '@/lib/ai';
import { PRODUCT_CATALOG } from '@/lib/constants';
import type { ZoProductType } from '@/lib/types';
import type { RenderContext } from '@/lib/prompts';

export default function Step6Vision() {
  const { state, dispatch } = useEngine();
  const [generating, setGenerating] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'exterior' | 'interior' | 'aerial'>('exterior');
  const [analyzingPhotos, setAnalyzingPhotos] = useState(false);

  const handleAnalyzePhotos = async () => {
    const photos = state.propertyInput.photos;
    if (!photos || photos.length === 0) return;
    setAnalyzingPhotos(true);
    try {
      const description = await analyzePropertyPhotos(
        photos,
        `${state.propertyInput.location}, ${state.propertyInput.city} — ${state.propertyInput.areaSqft} sqft ${state.propertyInput.propertyType || 'property'}`,
      );
      dispatch({ type: 'SET_PROPERTY', data: { photoAnalysis: description } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: `Photo analysis failed: ${err}` });
    } finally {
      setAnalyzingPhotos(false);
    }
  };

  const handleGenerate = async (productType: ZoProductType) => {
    const product = state.recommendations.find(r => r.productType === productType);
    setGenerating(productType);
    dispatch({ type: 'SET_LOADING', key: 'isLoadingRender', value: true });
    try {
      const context: RenderContext = {
        areaSqft: state.propertyInput.areaSqft,
        unitCount: product?.unitCount,
        avgSqftPerUnit: product?.avgSqftPerUnit,
        buildStyle: product?.buildStyle || state.buildStyle,
        terrain: state.propertyInput.terrain,
        numberOfFloors: state.propertyInput.numberOfFloors,
        photoAnalysis: state.propertyInput.photoAnalysis,
      };
      const url = await generateRender(
        productType,
        `${state.propertyInput.location}, ${state.propertyInput.city}`,
        viewType,
        context,
      );
      if (url) {
        dispatch({
          type: 'ADD_RENDER',
          data: { productType, imageUrl: url, prompt: '', viewType },
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: `Render failed: ${err}` });
    } finally {
      setGenerating(null);
      dispatch({ type: 'SET_LOADING', key: 'isLoadingRender', value: false });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold">Conceptual Vision</h2>
        <p className="text-muted-foreground text-sm mt-1">AI-generated renders of your property transformation</p>
      </div>

      {/* View Type Selector */}
      <div className="glass-card p-4 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">View Type:</span>
        {(['exterior', 'interior', 'aerial'] as const).map(vt => (
          <button key={vt} onClick={() => setViewType(vt)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${viewType === vt ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
            {vt}
          </button>
        ))}
      </div>

      {/* Photo Analysis */}
      {state.propertyInput.photos && state.propertyInput.photos.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{state.propertyInput.photos.length} photo(s) uploaded</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {state.propertyInput.photoAnalysis ? 'Photos analyzed — renders will use this context' : 'Analyze photos to improve render accuracy'}
              </p>
            </div>
            <button onClick={handleAnalyzePhotos} disabled={analyzingPhotos}
              className={`px-4 py-2 rounded-lg text-sm transition ${state.propertyInput.photoAnalysis ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary text-white hover:opacity-90'} ${analyzingPhotos ? 'loading-pulse' : ''}`}>
              {analyzingPhotos ? 'Analyzing...' : state.propertyInput.photoAnalysis ? 'Re-analyze' : 'Analyze Photos'}
            </button>
          </div>
          {state.propertyInput.photoAnalysis && (
            <p className="text-xs text-cyan bg-cyan/10 px-3 py-2 rounded-lg mt-3">{state.propertyInput.photoAnalysis}</p>
          )}
        </div>
      )}

      {/* Generate Buttons */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Generate Renders</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {state.recommendations.map(product => {
            const catalog = PRODUCT_CATALOG[product.productType];
            const isGenerating = generating === product.productType;
            return (
              <button key={product.id} onClick={() => handleGenerate(product.productType)}
                disabled={isGenerating}
                className={`p-4 rounded-lg border border-border text-left transition hover:border-primary/50 ${isGenerating ? 'loading-pulse' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{catalog?.icon}</span>
                  <span className="font-medium text-sm">{product.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isGenerating ? 'Generating...' : `Generate ${viewType} render`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Gallery */}
      {state.renders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Generated Renders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.renders.map((render, i) => {
              const catalog = PRODUCT_CATALOG[render.productType];
              return (
                <div key={i} className="glass-card overflow-hidden">
                  <img src={render.imageUrl} alt={`${catalog?.label} render`}
                    className="w-full h-64 object-cover" />
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span>{catalog?.icon}</span>
                      <span className="font-medium text-sm">{catalog?.label}</span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">{render.viewType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.renders.length === 0 && !state.isLoadingRender && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🎨</div>
          <p>No renders generated yet. Click a product above to visualize it.</p>
          <p className="text-xs mt-2">Powered by AI image generation</p>
        </div>
      )}
    </div>
  );
}
