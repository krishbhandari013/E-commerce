import React, { useState } from 'react'
import { assets } from '../assets/assets'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")

  const onChangeHandler = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const onSubmitHandler = (e) => {
    e.preventDefault()
    
    if (formData.email.trim() !== "" && formData.password.trim() !== "") {
      onLogin()
    } else {
      setError("Please enter both email and password")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-sm mx-auto pt-20">
        {/* Logo and Title */}
        <div className="text-center mb-8">
        
          <h1 className="text-2xl font-light text-black">Admin Panel</h1>
          <p className="text-gray-400 text-xs mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChangeHandler}
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={onChangeHandler}
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-black text-sm focus:outline-none focus:border-black"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-400 text-xs">
              Demo: Use any email and password
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login