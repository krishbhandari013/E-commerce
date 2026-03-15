// ProductItem.jsx
import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

function ProductItem({ id, img, name, price, cond }) {
  const { currency } = useContext(ShopContext);

  console.log('ProductItem id:', id); // Debug log

  // Handle missing id - don't render if no id
  if (!id) {
    console.warn('ProductItem rendered without id');
    return null;
  }

  return (
    <Link to={`/product/${id}`} className="block h-full">
      <div className="relative border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group bg-white h-full flex flex-col">
        {cond && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
            {cond}
          </span>
        )}

        <div className="overflow-hidden aspect-square w-full">
          <img
            src={img || 'https://via.placeholder.com/300?text=No+Image'} // Fallback image
            alt={name || 'Product'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
            }}
          />
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center pointer-events-none">
          <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm sm:text-base bg-black bg-opacity-50 px-3 py-1 rounded-full">
            View Details
          </span>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <p className="text-gray-800 font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
            {name || 'Unnamed Product'}
          </p>
          <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            {currency} {price || '0.00'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductItem;