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
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-80px)] fixed left-0 top-20 p-5">
      
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            end={item.path === "/add"} // This makes "add" the default active
          >
            <img src={item.icon} alt="" className="w-5 h-5 opacity-60" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-5 left-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 text-xs">Online</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar