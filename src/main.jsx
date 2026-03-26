import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const strict = import.meta.env.VITE_STRICT_MODE !== 'false'
const app = strict ? <StrictMode><App /></StrictMode> : <App />

createRoot(document.getElementById('root')).render(app)
