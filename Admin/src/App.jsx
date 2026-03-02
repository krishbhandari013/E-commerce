import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom' // Remove BrowserRouter import
import Login from './component/Login'
import Navbar from './component/Navbar'
import Sidebar from './component/Sidebar'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
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