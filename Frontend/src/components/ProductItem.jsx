import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

function ProductItem({ id, img, name, price,cond }) {
  const { currency } = useContext(ShopContext);

  return (
    <Link to={`/product/${id}`} className="block h-full">
      <div className="relative border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group bg-white h-full flex flex-col">
        {/* New Badge */}
      {
           cond && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
         {cond}
        </span>
      }
      

        {/* Product Image - Fixed aspect ratio */}
        <div className="overflow-hidden aspect-square w-full">
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Hover Info Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center pointer-events-none">
          <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm sm:text-base bg-black bg-opacity-50 px-3 py-1 rounded-full">
            View Details
          </span>
        </div>

        {/* Product Info - Fixed height with text truncation */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-gray-800 font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
            {name}
          </p>
          <p className="text-gray-600 mt-2 text-sm sm:text-base font-medium">
            {currency} {price}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ProductItem;