import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// registerSW({ immediate: true })

// Version logging for deployment verification
console.log('🚀 INITIALIZING: Controle de Gastos v3.1.0-FIXED');
console.log('📅 Deployed at:', new Date().toISOString());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
