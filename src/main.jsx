import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/anton/400.css'
import '@fontsource/yellowtail/400.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource-variable/inter-tight'
import './styles/base.css'
import App from './App.jsx'
import { isFrozen } from './lib/clock.js'

if (isFrozen) document.documentElement.classList.add('frozen')
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
