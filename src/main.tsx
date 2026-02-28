import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { EngineProvider } from './hooks/useEngine'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EngineProvider>
      <App />
    </EngineProvider>
  </StrictMode>,
)
