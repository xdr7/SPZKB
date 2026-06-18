import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import KonsultasiWizard from './components/KonsultasiWizard'
import ZatList from './components/ZatList'
import MakananList from './components/MakananList'
import TentangSistem from './components/TentangSistem'
import AdminLogin from './components/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './components/AdminDashboard'
import AdminZat from './components/AdminZat'
import AdminMakanan from './components/AdminMakanan'
import AdminRule from './components/AdminRule'
import AdminBatas from './components/AdminBatas'
import AdminBranding from './components/AdminBranding'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/konsultasi" element={<KonsultasiWizard />} />
      <Route path="/zat" element={<ZatList />} />
      <Route path="/makanan" element={<MakananList />} />
      <Route path="/tentang" element={<TentangSistem />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="zat" element={<AdminZat />} />
        <Route path="makanan" element={<AdminMakanan />} />
        <Route path="rule" element={<AdminRule />} />
        <Route path="batas" element={<AdminBatas />} />
        <Route path="branding" element={<AdminBranding />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
