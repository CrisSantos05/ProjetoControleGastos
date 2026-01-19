import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// registerSW({ immediate: true })

// Version logging for deployment verification
console.log('🚀 Controle de Gastos v2.0.0 - Build: 2026-01-18T20:00:00');
console.log('📅 Deployed at:', new Date().toISOString());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
