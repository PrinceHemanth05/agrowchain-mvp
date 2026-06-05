import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. Import the new Provider
import { Web3Provider } from './context/Web3Context.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Wrap the App with the Provider */}
    <Web3Provider>
      <App />
    </Web3Provider>
  </StrictMode>,
)