import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

function LatestCollection() {
  const { products } = useContext(ShopContext);

  // Only show first 10 products
  const latestProducts = products.slice(0, 12);

  return (
    <div className="my-12 px-4 md:px-10">
      {/* Section Title */}
      <div className="text-center py-8">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-3 max-w-xl mx-auto">
          Explore our newest arrivals-high-quality, stylish products carefully curated for you.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-8 mt-10">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            img={item.image}
            name={item.name}
            price={item.price}
            cond={"NEW"}
          />
        ))}
      </div>
    </div>
  );
}

export default LatestCollection;
