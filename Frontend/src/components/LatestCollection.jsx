import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

function LatestCollection() {
  const { products, loading, error, fetchProducts } = useContext(ShopContext);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array means this runs once when component mounts

  // Handle resize for responsive visible count
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 640) {
        setVisibleCount(4);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(6);
      } else {
        setVisibleCount(8);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show first 10 products
  const latestProducts = products?.slice(0, 10) || [];
  const displayedProducts = latestProducts.slice(0, visibleCount);
  const hasMore = visibleCount < latestProducts.length;

  // Skeleton loading component
  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mt-10">
      {Array(visibleCount).fill(0).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const loadMore = () => {
    setVisibleCount(prev => prev + (isMobile ? 4 : 8));
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="my-12 px-4 md:px-10">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg mb-4">Failed to load products</p>
          <button 
            onClick={fetchProducts}
            className="px-6 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12 px-4 md:px-10">
      {/* Section Title */}
      <div className="text-center py-8">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-3 max-w-xl mx-auto">
          Explore our newest arrivals - high-quality, stylish products carefully curated for you.
        </p>
      </div>

      {/* Show skeleton while loading, show products when loaded */}
      {loading ? (
        renderSkeletonGrid()
      ) : (
        <>
          {latestProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mt-10">
                {displayedProducts.map((item, index) => (
                  <ProductItem
                    key={item._id || index}
                    id={item._id}
                    img={item.image}
                    name={item.name}
                    price={item.price}
                    cond={"NEW"}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    Load More
                  </button>
                </div>
              )}

              {/* Products Count */}
              {latestProducts.length > 0 && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  Showing {displayedProducts.length} of {latestProducts.length} products
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default LatestCollection;