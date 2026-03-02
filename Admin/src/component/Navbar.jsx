import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-8 z-50">
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
      
      {/* Right side - Logout button */}
      <button
        onClick={onLogout}
        className="text-gray-600 text-sm hover:text-black transition-colors"
      >
        LOGOUT
      </button>
    </nav>
  )
}

export default Navbar