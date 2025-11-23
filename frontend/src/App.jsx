import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './components/Header.jsx'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'

function ProtectedRoute({ children }) {
  const isAuthed = !!localStorage.getItem('auth')
  return isAuthed ? children : <Navigate to="/" replace />
}

function AppLayout() {
  const location = useLocation()
  const showHeader = location.pathname !== '/'
  return (
    //<div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-gray-900">
      //{showHeader && <Header />}
      //<main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      //</main>
    //</div>
  )
}

export default function App() {
  useTranslation() // ensure i18n is loaded
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}