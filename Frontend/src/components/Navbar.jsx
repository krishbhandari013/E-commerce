import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {assets} from "../assets/assets";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef();
  const [cartCount, setCartCount] = useState(0);


  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
        console.log("clicked")
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm relative z-50">

        {/* LEFT - LOGO */}
        <Link to="/">
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        {/* CENTER - DESKTOP MENU */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {["/", "/collection", "/about", "/contact"].map((path, index) => {
            const names = ["Home", "Collection", "About", "Contact"];
            return (
              <li key={index}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `relative pb-1 ${
                      isActive ? "text-black" : "text-gray-600 hover:text-black"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {names[index]}
                      {isActive && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {/* Search */}
          <img
            src={assets.search_icon}
            alt="search"
            className="w-5 cursor-pointer hover:scale-110 transition"
          />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <img
              src={assets.profile_icon}
              alt="profile"
              className="w-5 cursor-pointer hover:scale-110 transition"
              onClick={() => setShowProfile(!showProfile)}
            />

            {showProfile && (
              <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-md py-2 text-sm animate-fadeIn">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  My Profile
                </Link>
                <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">
                  Orders
                </Link>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
      <Link to="/cart" className="relative">
  <img
    src={assets.cart_icon}
    alt="cart"
    className="w-5 cursor-pointer hover:scale-110 transition"
  />

    <p className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
      {cartCount}
    </p>
  
</Link>


          {/* Mobile Menu Button */}
          <img
            src={assets.menu_icon}
            alt="menu"
            onClick={() => setShowMenu(true)}
            className="w-6 cursor-pointer md:hidden"
          />
        </div>
      </nav>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300 ${
          showMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setShowMenu(false)}
      ></div>

      {/* ================= SLIDE MENU ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          showMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setShowMenu(false)}>✕</button>
        </div>

        <ul className="flex flex-col gap-6 px-6 py-8 text-gray-700 text-base">
          <NavLink to="/" onClick={() => setShowMenu(false)} className="hover:bg-gray-100 p-[10px]">Home</NavLink>
          <NavLink to="/collection" onClick={() => setShowMenu(false)} className="hover:bg-gray-100 p-[10px] ">Collection</NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false) } className="hover:bg-gray-100 p-[10px]">About</NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)} className="hover:bg-gray-100 p-[10px]">Contact</NavLink>
        </ul>
      </div>
    </>
  );
}
