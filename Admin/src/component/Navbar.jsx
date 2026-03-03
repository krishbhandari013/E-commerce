import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Navbar = ({ onLogout }) => {
  
  const navigate = useNavigate()

  const handleLogout = () => {
   

    // Clear token from localStorage
    localStorage.removeItem('adminToken')
    localStorage.removeItem('userData')
    
    // Clear any other stored data if needed
    // localStorage.clear() // Use this if you want to clear ALL localStorage data
    
    // Call the parent's onLogout function to update auth state
    onLogout()
    
    // Redirect to login page
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 z-50 shadow-sm">
      {/* Left side - Logo */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center">
          <img 
            src={assets.logo} 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      
        
      </div>
      
      {/* Right side - Admin info and Logout */}
      <div className="flex items-center gap-6">
        {/* Show logged-in user email if stored */}
        {localStorage.getItem('adminEmail') && (
          <span className="text-sm text-gray-500 hidden md:inline">
            {localStorage.getItem('adminEmail')}
          </span>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 text-sm hover:text-black transition-colors group"
        >
          <svg 
            className="w-4 h-4 group-hover:rotate-12 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          LOGOUT
        </button>
      </div>
    </nav>
  )
}

export default Navbar