import { useEngine } from './hooks/useEngine';
import { WIZARD_STEPS } from './lib/constants';
import Step1Property from './components/steps/Step1Property';
import Step2Market from './components/steps/Step2Market';
import Step3Product from './components/steps/Step3Product';
import Step4Financial from './components/steps/Step4Financial';
import Step5Risk from './components/steps/Step5Risk';
import Step6Vision from './components/steps/Step6Vision';
import Step7Decision from './components/steps/Step7Decision';

const ZostelSymbol = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="270 3 150 157" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#f15824" d="M270.2,66.8c.6-.1,1.1,0,1.6,0,7.4,0,14.8,0,22.2,0,11.4,0,22.8,0,34.2,0,.5,0,1.1,0,1.6,0,.2,0,.3-.2.3-.4-.2-.4-.3-.7-.5-1.1-3.4-6.2-6.8-12.4-10.1-18.6-2.7-4.9-5.4-9.9-8.1-14.8-.3-.5-.5-.9-.8-1.4-.1-.2-.4-.2-.5,0,0,.1-.2.2-.3.3-.3.5-.6.9-.9,1.4-1.2,1.8-2.3,3.6-3.5,5.3-.2.2-.3.5-.5.7,0,.1-.4.2-.5,0-.1,0-.3-.1-.4-.2-1.5-.9-3-1.8-4.4-2.7-.2-.1-.3-.2-.5-.3,0,0-.1-.3,0-.4.2-.4.4-.8.7-1.1,3.3-5.1,6.6-10.1,9.8-15.2,3-4.6,6-9.3,9-13.9.2-.3.4-.6.7-1,0-.1.3-.1.4,0,.2.3.4.7.6,1,3.7,7,7.5,13.9,11.2,20.9,5.1,9.5,10.2,19,15.4,28.6.2.4.4.8.7,1.2,0,.2.4.2.5,0,.3-.4.5-.8.8-1.3,2.1-3.8,4.2-7.6,6.3-11.4,3.6-6.5,7.2-13,10.8-19.4.3-.6.6-1.1.9-1.7.1-.2,0-.5-.3-.5-.2,0-.4,0-.6,0-.3,0-.7,0-1,0-2.6,0-5.1,0-7.7,0-.4,0-.9,0-1.3,0-.2,0-.4-.2-.5-.5,0-.2,0-.4,0-.6,0-1.5,0-3,0-4.4,0-.2,0-.5,0-.7,0-.1.2-.2.3-.3.1,0,.3,0,.4,0,.4,0,.9,0,1.3,0,11.2,0,22.3,0,33.5,0,2.3,0,2.1-.3,1.3,1.8-1.3,3.3-2.9,6.5-4.6,9.6-7,13.2-13.9,26.5-20.9,39.7-.2.4-.4.8-.6,1.2,0,0,.1.3.2.3.1,0,.3,0,.4,0,.4,0,.9,0,1.3,0,11.7,0,23.4,0,35.1,0,2.4,0,2.4.2,1.2-2-1.2-2.3-2.5-4.5-3.7-6.8-.1-.3-.3-.5-.4-.8,0-.1,0-.3.1-.4.1,0,.2-.2.4-.3,1.6-1,3.1-1.9,4.7-2.8.2-.1.3-.2.5-.3,0,0,.2,0,.3,0,.3.4.6.8.8,1.2,3.9,6.8,7.9,13.7,11.8,20.5,1.9,3.3,3.7,6.5,5.6,9.8.2.4.4.8.6,1.2,0,.1,0,.3,0,.4,0,.2-.2.4-.3.5-.2,0-.4,0-.6,0-.5,0-1.1,0-1.6,0-17.9,0-35.8,0-53.6,0-.5,0-1.1,0-1.6,0-.3,0-.7,0-1,0-.5,0-.6.3-.4.7.2.4.4.7.5,1.1,1.2,2.3,2.5,4.6,3.7,6.9,4.5,8.3,8.9,16.5,13.4,24.8.2.4.5.8.7,1.1,0,0,.3,0,.4,0,.2-.3.4-.5.6-.8,1.5-2.2,2.9-4.5,4.3-6.7.2-.3.4-.7.6-1,.4-.7.5-.7,1.2-.3.4.3.8.5,1.2.8,1.1.7,2.2,1.5,3.3,2.2.2.1.4.3.6.5,0,0,.1.3,0,.4,0,.2-.2.4-.3.7-4.4,7.1-8.7,14.1-13.1,21.2-1.9,3.1-3.8,6.1-5.7,9.2-.1.2-.3.5-.6.6-.4-.3-.5-.7-.7-1.1-1.9-3.3-3.8-6.7-5.8-10-7.6-13.2-15.1-26.4-22.7-39.5-.2-.3-.4-.7-.6-1-.1-.2-.4-.1-.5,0-.2.3-.4.7-.6,1-2.5,4.2-5.1,8.3-7.6,12.5-4.1,6.8-8.2,13.5-12.3,20.3-.3.5-.6,1-.9,1.5-.1.2,0,.5.3.5.1,0,.3,0,.4,0,.3,0,.7,0,1,0,2.5,0,4.9.1,7.4.2.4,0,.8,0,1.2,0,.2,0,.4.2.4.4,0,.2,0,.4,0,.6,0,1.8,0,3.6,0,5.3,0,.2,0,.4,0,.6,0,.2-.2.4-.4.4-.1,0-.3,0-.4,0-1.7,0-3.5-.1-5.2-.2-1.4,0-2.8,0-4.1-.1-2.2,0-4.4,0-6.7-.2-1.5,0-3.1,0-4.6-.1-1.7,0-3.5-.1-5.2-.2-1.9,0-3.8,0-5.6-.1-2.1,0-4.1-.2-6.2-.3-.1,0-.2-.2-.2-.3,0,0,0,0,0-.1,6-9.7,12-19.4,18-29.1,4.4-7.1,8.8-14.2,13.2-21.3.3-.4.5-.8.7-1.3,0-.2,0-.4-.3-.4-.2,0-.4,0-.6,0-.4,0-.9,0-1.3,0-12,0-24,0-36,0-.6,0-1.2,0-1.8,0-.1,0-.2.3-.2.4,0,.1,0,.3.2.4.2.4.4.7.6,1,1.1,2,2.2,4,3.2,6,.2.3.3.6.5.9,0,.2,0,.4-.2.5,0,0-.2.1-.2.2-1.7,1-3.4,1.9-5.2,2.9-.4.2-.6.2-.8-.3-.1-.3-.3-.5-.4-.8-5.4-9.9-10.7-19.9-16.1-29.8-.2-.3-.3-.6-.5-.9,0-.1,0-.3,0-.4ZM341.6,73.7c-.6.1-1.2,0-1.8,0-18.4,0-36.8,0-55.3,0-.5,0-1,0-1.5,0-.2,0-.4,0-.6,0-.2,0-.4.3-.3.6,0,.2.2.4.3.5.8,1.5,1.6,3,2.5,4.6,0,.2.2.3.3.5.2.3.4.4.7.4.5,0,1.1,0,1.6,0,17.4,0,34.8,0,52.1,0,.6,0,1.2,0,1.8,0,0,.1.1.3,0,.3-.1.3-.2.5-.4.8-1.2,2-2.5,4.1-3.7,6.1-8.7,14.3-17.4,28.6-26.1,42.9-.2.3-.4.7-.6,1,0,.1-.1.3-.2.4,0,.1,0,.3.2.4,1.2.2,2.4.2,3.5.2,1.9,0,1.6.2,2.7-1.5,8.6-13.9,17.2-27.8,25.8-41.7,1.2-1.9,2.4-3.9,3.6-5.8.2-.3.3-.6.6-.8.4.2.5.6.7.9,7.6,13.2,15.2,26.4,22.7,39.5,1.8,3.2,3.6,6.3,5.5,9.5.2.3.4.7.6,1,0,0,.3.1.4,0,.1-.1.3-.3.4-.5.7-1.1,1.4-2.2,2.1-3.2.4-.6.4-1.1,0-1.6-.1-.2-.2-.4-.4-.6-6.8-12.2-13.7-24.5-20.5-36.7-.6-1.1-1.2-2.2-1.8-3.2-1.3-2.2-2.5-4.5-3.7-6.7,0-.1-.1-.3-.1-.4,0,0,0-.2.2-.2.5,0,1.1,0,1.6,0,18.9,0,37.7,0,56.6,0,.5,0,1.1,0,1.6,0,.1,0,.3,0,.4,0,.1,0,.2-.2.2-.4,0-.2-.2-.4-.3-.5-1-1.5-2-3.1-3-4.6-.2-.3-.5-.6-.7-.9-.7-.2-1.3-.1-2-.1-17.5,0-35.1,0-52.6,0-.5,0-1,0-1.5,0-.2,0-.4,0-.6,0,0-.2,0-.3,0-.4.2-.4.4-.9.7-1.3,6.6-12.2,13.1-24.3,19.7-36.5,2.4-4.4,4.8-8.9,7.2-13.3.2-.3.3-.7.5-1.1,0-.2,0-.4-.3-.4-.2,0-.4,0-.6,0-1,0-2.1,0-3.1,0-2.4,0-1.9-.3-3.1,1.8-4.7,8.4-9.4,16.9-14.1,25.4-4,7.2-7.9,14.3-11.9,21.5,0,.2-.2.3-.3.5,0,.1-.3.1-.4,0-.2-.3-.4-.7-.6-1-4.7-8.6-9.4-17.3-14-25.9-4.3-7.9-8.6-15.9-12.9-23.8-.2-.3-.4-.7-.6-1,0-.1-.2-.3-.2-.4-.1-.2-.5-.2-.6,0-1,1.5-2,3-2.9,4.4-.2.3-.2.6,0,.8.2.3.3.6.5.9,3.4,6.6,6.9,13.2,10.3,19.8,5,9.5,10,19.1,14.9,28.6.2.3.3.7.5,1.1,0,0,0,.2,0,.3Z"/>
  </svg>
);

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
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZostelSymbol className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold gradient-text tracking-wide">Real Estate Engine</h1>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">by Zostel</p>
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
      <nav className="border-b border-border bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {WIZARD_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => dispatch({ type: 'SET_STEP', step: step.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  state.currentStep === step.id
                    ? 'bg-primary text-white font-medium shadow-sm'
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
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/90 backdrop-blur-md">
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
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition zo-btn"
          >
            Next Step
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
