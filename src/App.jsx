import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Sensor from './pages/Sensor'
import AIChat from './pages/AIChat'
import Analysis from './pages/Analysis'
import Settings from './pages/Settings'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home"     element={<Home />} />
          <Route path="sensor"   element={<Sensor />} />
          <Route path="ai"       element={<AIChat />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App