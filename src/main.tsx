import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import SoundProvider from './components/SoundProvider'
import './index.css'
import './styles/ui.css'
import './styles/stages.css'

const el = document.getElementById('root')
if (!el) throw new Error('Root element #root not found')

createRoot(el).render(
  <StrictMode>
    <SoundProvider>
      <App />
    </SoundProvider>
  </StrictMode>,
)
