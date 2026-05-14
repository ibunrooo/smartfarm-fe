import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Sensor from './pages/Sensor'
import AIChat from './pages/AIChat'
import Analysis from './pages/Analysis'
import Onboarding from './pages/Onboarding'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          )}
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home"       element={<Home />} />
          <Route path="sensor"     element={<Sensor />} />
          <Route path="ai"         element={<AIChat />} />
          <Route path="analysis"   element={<Analysis />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
