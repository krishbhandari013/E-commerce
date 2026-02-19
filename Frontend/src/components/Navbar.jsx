import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  
  const profileRef = useRef();
  const searchRef = useRef();
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search when clicking outside (optional - remove if you don't want this)
  useEffect(() => {
    function handleSearchOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target) && 
          !e.target.closest('.search-trigger')) {
        setShowSearch(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleSearchOutside);
    return () => document.removeEventListener("mousedown", handleSearchOutside);
  }, []);

  const handleSearchClick = () => {
    navigate("/collection");
    setShowSearch(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${searchQuery}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-white shadow-sm z-50 ">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <img src={assets.logo} alt="logo" className="h-8" />
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
              {[
                { path: "/", name: "Home" },
                { path: "/collection", name: "Collection" },
                { path: "/about", name: "About" },
                { path: "/contact", name: "Contact" },
              ].map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `relative pb-1 transition-colors duration-200 ${
                        isActive
                          ? "text-black font-semibold"
                          : "text-gray-600 hover:text-black"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.name}
                        {isActive && (
                          <span className="absolute left-0 bottom-0 w-full h-[2px] bg-black"></span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              {/* Search Icon */}
              <button 
                onClick={handleSearchClick}
                className="search-trigger hover:scale-110 transition-transform duration-200"
              >
                <img src={assets.search_icon} alt="search" className="w-5" />
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <img src={assets.profile_icon} alt="profile" className="w-5" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-3 w-40 bg-white shadow-lg rounded-md py-2 text-sm border border-gray-100">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 hover:bg-gray-50" 
                      onClick={() => setShowProfile(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 hover:bg-gray-50" 
                      onClick={() => setShowProfile(false)}
                    >
                      Orders
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500">
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative hover:scale-110 transition-transform duration-200">
                <img src={assets.cart_icon} alt="cart" className="w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setShowMenu(true)} 
                className="md:hidden hover:scale-110 transition-transform duration-200"
              >
                <img src={assets.menu_icon} alt="menu" className="w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar - Below navbar with same width */}
      {showSearch && (
        <div 
          ref={searchRef}
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-7xl    z-40"
          style={{ top: "76px" }}
        >
          <div className="px-6 py-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-full text-base focus:outline-none focus:border-black transition-colors duration-200"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <button
                  type="submit"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 mr-1"
                >
                  <img src={assets.search_icon} alt="search" className="w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseSearch}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Close search"
                >
                  <svg 
                    className="w-5 h-5 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              </div>
            </form>
            
            {/* Optional search suggestions */}
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                Press Enter to search for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-[76px]"></div>
      {showSearch && <div className="h-[89px]"></div>}

      {/* Mobile Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" 
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="flex flex-col py-4">
              <NavLink 
                to="/" 
                onClick={() => setShowMenu(false)} 
                className={({ isActive }) =>
                  `py-3 px-6 hover:bg-gray-50 transition-colors duration-200 ${
                    isActive ? "bg-gray-100 font-medium" : ""
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/collection" 
                onClick={() => setShowMenu(false)} 
                className={({ isActive }) =>
                  `py-3 px-6 hover:bg-gray-50 transition-colors duration-200 ${
                    isActive ? "bg-gray-100 font-medium" : ""
                  }`
                }
              >
                Collection
              </NavLink>
              <NavLink 
                to="/about" 
                onClick={() => setShowMenu(false)} 
                className={({ isActive }) =>
                  `py-3 px-6 hover:bg-gray-50 transition-colors duration-200 ${
                    isActive ? "bg-gray-100 font-medium" : ""
                  }`
                }
              >
                About
              </NavLink>
              <NavLink 
                to="/contact" 
                onClick={() => setShowMenu(false)} 
                className={({ isActive }) =>
                  `py-3 px-6 hover:bg-gray-50 transition-colors duration-200 ${
                    isActive ? "bg-gray-100 font-medium" : ""
                  }`
                }
              >
                Contact
              </NavLink>
            </ul>
          </div>
        </>
      )}
    </>
  );
}