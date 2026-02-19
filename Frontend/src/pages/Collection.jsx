import { useState, useEffect, useContext } from "react";
import ProductItem from "../components/ProductItem";
import { ShopContext } from "../context/ShopContext";
import Footer from "../components/Footer";

export default function Collection() {
  const { products } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState("relevant");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState({
    Men: false,
    Women: false,
    Kids: false,
  });
  
  const [selectedTypes, setSelectedTypes] = useState({
    Topwear: false,
    Bottomwear: false,
    Winterwear: false,
  });

  // Initialize filtered products when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      setFilteredProducts(products);
    }
  }, [products]);

  // Apply filters and sorting whenever selections change
  useEffect(() => {
    if (!products || products.length === 0) return;

    let filtered = [...products];

    // Apply category filters
    const activeCategories = Object.keys(selectedCategories).filter(
      (key) => selectedCategories[key]
    );
    
    if (activeCategories.length > 0) {
      filtered = filtered.filter((product) =>
        activeCategories.includes(product.category)
      );
    }

    // Apply type filters (using subCategory)
    const activeTypes = Object.keys(selectedTypes).filter(
      (key) => selectedTypes[key]
    );
    
    if (activeTypes.length > 0) {
      filtered = filtered.filter((product) =>
        activeTypes.includes(product.subCategory)
      );
    }

    // Apply sorting
    if (sortBy === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [selectedCategories, selectedTypes, sortBy, products]);

  // Handle category checkbox changes
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Handle type checkbox changes
  const handleTypeChange = (type) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories({
      Men: false,
      Women: false,
      Kids: false,
    });
    setSelectedTypes({
      Topwear: false,
      Bottomwear: false,
      Winterwear: false,
    });
    setSortBy("relevant");
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    const categoryCount = Object.values(selectedCategories).filter(Boolean).length;
    const typeCount = Object.values(selectedTypes).filter(Boolean).length;
    return categoryCount + typeCount;
  };

  // Get counts for each category
  const getCategoryCount = (category) => {
    return products?.filter(p => p.category === category).length || 0;
  };

  // Get counts for each type
  const getTypeCount = (type) => {
    return products?.filter(p => p.subCategory === type).length || 0;
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ========== FILTER SECTION - LEFT SIDE ========== */}
          {/* Desktop Filters - Always visible on lg and above */}
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="  border rounded-lg shadow-sm p-6 sticky top-24">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-medium mb-4 pb-2 border-b">CATEGORY</h3>
                <div className="space-y-3">
                  {[
                    { id: "Men", label: "Men" },
                    { id: "Women", label: "Women" },
                    { id: "Kids", label: "Kids" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories[item.id]}
                          onChange={() => handleCategoryChange(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        ({getCategoryCount(item.id)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-8">
                <h3 className="font-medium mb-4 pb-2 border-b">TYPE</h3>
                <div className="space-y-3">
                  {[
                    { id: "Topwear", label: "Topwear" },
                    { id: "Bottomwear", label: "Bottomwear" },
                    { id: "Winterwear", label: "Winter Wear" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTypes[item.id]}
                          onChange={() => handleTypeChange(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        ({getTypeCount(item.id)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========== PRODUCTS SECTION - RIGHT SIDE ========== */}
          <div className="flex-1">
            {/* Top Bar with Sort and Filter Toggle for Mobile/Tablet */}
            <div className="flex  sm:flex-row gap-4 bg:flex-end sm:items-center justify-between mb-6">
              {/* Filter Toggle Button - Visible below lg */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="relevant">Relevant</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-medium text-black">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>

            {/* Mobile/Tablet Filters - Show/Hide based on button click */}
            {showFilters && (
              <div className="lg:hidden border rounded-lg shadow-sm p-6 mb-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <div className="flex items-center gap-3">
                    {getActiveFiltersCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-black underline"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 pb-2 border-b">CATEGORY</h3>
                  <div className="space-y-2">
                    {[
                      { id: "Men", label: "Men" },
                      { id: "Women", label: "Women" },
                      { id: "Kids", label: "Kids" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories[item.id]}
                            onChange={() => handleCategoryChange(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          ({getCategoryCount(item.id)})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 pb-2 border-b">TYPE</h3>
                  <div className="space-y-2">
                    {[
                      { id: "Topwear", label: "Topwear" },
                      { id: "Bottomwear", label: "Bottomwear" },
                      { id: "Winterwear", label: "Winter Wear" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTypes[item.id]}
                            onChange={() => handleTypeChange(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          ({getTypeCount(item.id)})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
                >
                  Apply Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 md:gird-clos-2 xl:grid-cols-3 gap-3 sm:gap-4 gap-y-6 sm:gap-y-8">
                {filteredProducts.map((item) => (
                  <ProductItem
                    key={item._id}
                    id={item._id}
                    img={item.image}
                    name={item.name}
                    price={item.price}
                  />
                ))}
              </div>
            ) : (
              // No Products Found State
              <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 12H4M12 20V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-block px-6 py-2.5 bg-black text-white text-sm sm:text-base rounded-md hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
    
  );
}