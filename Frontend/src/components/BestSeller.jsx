import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

function BestSeller() {
  const { products } = useContext(ShopContext);

  // Filter products that are marked as bestseller
  const bestSellers = products.filter((item) => item.bestseller).slice(0, 4);


  return (
    <div className="my-12 px-4 md:px-10">
      {/* Section Title */}
      <div className="text-center py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-3 max-w-xl mx-auto">
          Discover our most popular products-loved and highly rated by our customers.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-8 mt-10">
        {bestSellers.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            img={item.image}
            name={item.name}
            price={item.price}
           
          />
        ))}
      </div>
    </div>
  );
}

export default BestSeller;
