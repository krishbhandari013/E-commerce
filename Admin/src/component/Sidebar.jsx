import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  const menuItems = [
    { path: "/add", icon: assets.add_icon, label: "Add Items" },
    { path: "/list", icon: assets.order_icon, label: "List Items" },
    { path: "/orders", icon: assets.parcel_icon, label: "Orders" },
  ]

  return (
    <>
      {/* Desktop Sidebar - visible on md and above */}
      <div className="hidden md:block w-48 lg:w-64 bg-white border-r border-gray-200 h-[calc(100vh-80px)] fixed left-0 top-20 p-4 lg:p-5 overflow-y-auto">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={item.path === "/add"}
            >
              <img src={item.icon} alt="" className="w-4 lg:w-5 h-4 lg:h-5 opacity-60" />
              <span className="text-xs lg:text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 lg:left-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-400 text-[10px] lg:text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - visible on small devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-black' : 'text-gray-400'
                }`
              }
              end={item.path === "/add"}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-5 h-5 mb-1 opacity-60"
              />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Tablet Sidebar - alternative for medium devices if you want icons only */}
      <div className="hidden sm:block md:hidden w-16 bg-white border-r border-gray-200 h-[calc(100vh-80px)] fixed left-0 top-20 py-4">
        <nav className="flex flex-col items-center space-y-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                  isActive ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'
                }`
              }
              title={item.label}
              end={item.path === "/add"}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-5 h-5 opacity-60"
              />
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar