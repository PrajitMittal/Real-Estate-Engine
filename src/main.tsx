import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { EngineProvider } from './hooks/useEngine'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <EngineProvider>
        <App />
      </EngineProvider>
    </ErrorBoundary>
  </StrictMode>,
)
