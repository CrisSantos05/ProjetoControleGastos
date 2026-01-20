import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({ immediate: true })

// Version logging for deployment verification
console.log('🚀 Controle de Gastos v3.1 - Build: 2026-01-20T10:07:00');
console.log('📅 Deployed at:', new Date().toISOString());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
