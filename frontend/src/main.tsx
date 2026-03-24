import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './style.css'
import { ToastProvider } from './contexts/ToastContext'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)