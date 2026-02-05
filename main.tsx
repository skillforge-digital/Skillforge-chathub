import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import { BackgroundProvider } from './context/BackgroundContext.tsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BackgroundProvider>
          <App />
        </BackgroundProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
