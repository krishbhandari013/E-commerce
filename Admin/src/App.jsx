// App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Login from './component/Login'
import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
export const backendUrl = import.meta.env.VITE_BACKEND_URL 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true) // Add loading state
  const navigate = useNavigate()

  // Check for existing token when app loads
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      console.log("========== AUTH CHECK ==========")
      
      if (token) {
        console.log("✅ Token found - User is authenticated")
        setIsAuthenticated(true)
        // Only navigate if we're on root path
        if (window.location.pathname === '/') {
          navigate('/add', { replace: true })
        }
      } else {
        console.log("❌ No token found - User is not authenticated")
        setIsAuthenticated(false)
      }
      
      console.log("=================================")
      setLoading(false) // Set loading to false after check
    }

    checkAuth()
  }, [navigate])

  const handleLogin = () => {
    const token = localStorage.getItem('adminToken')
    console.log("🔐 Login successful - Token:", token ? "Present" : "Missing")
    setIsAuthenticated(true)
    navigate('/add', { replace: true })
  }

  const handleLogout = () => {
    console.log("🚪 Logging out...")
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('adminEmail')
    setIsAuthenticated(false)
    navigate('/', { replace: true })
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {/* Simple loading spinner */}
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Navbar onLogout={handleLogout} />
          <Sidebar />
          <div className="ml-64 mt-20 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/add" replace />} />
              <Route path="/add" element={<Add/>} />
              <Route path="/list" element={<List/>} />
              <Route path="/orders" element={<Orders/>} />
            </Routes>
          </div>
        </>
      )}
    </div>
  )
}

export default App