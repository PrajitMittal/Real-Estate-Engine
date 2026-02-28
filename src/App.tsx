import { useEngine } from './hooks/useEngine';
import { WIZARD_STEPS } from './lib/constants';
import Step1Property from './components/steps/Step1Property';
import Step2Market from './components/steps/Step2Market';
import Step3Product from './components/steps/Step3Product';
import Step4Financial from './components/steps/Step4Financial';
import Step5Risk from './components/steps/Step5Risk';
import Step6Vision from './components/steps/Step6Vision';
import Step7Decision from './components/steps/Step7Decision';

function App() {
  const { state, dispatch } = useEngine();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <Step1Property />;
      case 2: return <Step2Market />;
      case 3: return <Step3Product />;
      case 4: return <Step4Financial />;
      case 5: return <Step5Risk />;
      case 6: return <Step6Vision />;
      case 7: return <Step7Decision />;
      default: return <Step1Property />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-sm">
              Zo
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Real Estate Engine</h1>
              <p className="text-xs text-muted-foreground">Property Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.propertyInput.city && (
              <span className="text-xs bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
                {state.propertyInput.city}, {state.propertyInput.state}
              </span>
            )}
            {state.viability && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium badge-${state.viability.rating}`}>
                {state.viability.rating.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Step Navigation */}
      <nav className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {WIZARD_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => dispatch({ type: 'SET_STEP', step: step.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  state.currentStep === step.id
                    ? 'bg-primary text-white font-medium'
                    : step.id < state.currentStep
                    ? 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-in" key={state.currentStep}>
          {renderStep()}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: Math.max(1, state.currentStep - 1) })}
            disabled={state.currentStep === 1}
            className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Step {state.currentStep} of {WIZARD_STEPS.length}
          </span>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: Math.min(WIZARD_STEPS.length, state.currentStep + 1) })}
            disabled={state.currentStep === WIZARD_STEPS.length}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Next Step
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
