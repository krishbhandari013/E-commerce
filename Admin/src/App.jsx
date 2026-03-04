// App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast' 
import Login from './component/Login'
import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
export const backendUrl = import.meta.env.VITE_BACKEND_URL 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check for existing token when app loads
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      console.log("========== AUTH CHECK ==========")
      
      if (token) {
        console.log("✅ Token found - User is authenticated")
        setIsAuthenticated(true)
        if (window.location.pathname === '/') {
          navigate('/add', { replace: true })
        }
      } else {
        console.log("❌ No token found - User is not authenticated")
        setIsAuthenticated(false)
      }
      
      console.log("=================================")
      setLoading(false)
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 3000,
          className: '',
          style: {
            background: '#fff',
            color: '#000',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #22c55e',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #3b82f6',
            },
          },
        }}
      />
      
      <div>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Navbar onLogout={handleLogout} />
            <Sidebar />
            {/* Updated main content area with responsive classes */}
            <div className={`
              transition-all duration-300
              md:ml-48 lg:ml-64 
              mt-20 p-4 sm:p-6
              pb-20 md:pb-6
            `}>
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
    </>
  )
}

export default App