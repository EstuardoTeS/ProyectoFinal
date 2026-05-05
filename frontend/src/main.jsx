import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.jsx'
import './global.css'
import './native-app.css'

if (Capacitor.isNativePlatform() || window.location.search.includes('native=1')) {
  document.body.classList.add('native-app')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
