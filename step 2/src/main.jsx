import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HospitalProvider } from './context/HospitalContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HospitalProvider>
      <App />
    </HospitalProvider>
  </React.StrictMode>,
)
