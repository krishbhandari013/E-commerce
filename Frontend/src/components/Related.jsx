// Related.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const Related = ({ currentProductId, category, subCategory }) => {
  const navigate = useNavigate();
  const { products, currency } = useContext(ShopContext);

  // Filter related products
  const relatedProducts = products.filter(product => 
    product._id !== currentProductId &&
    product.category === category &&
    product.subCategory === subCategory
  ).slice(0, 4); // Limit to 4 products

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <>

    <div className="mt-16 pt-16 border-t border-gray-200">

    
      
              <Title text1={"RELATED"} text2={"PRODUCT"}   />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => navigate(`/product/${product._id}`)}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Product Image */}
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img 
                src={Array.isArray(product.image) ? product.image[0] : product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-sm text-gray-700 mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {currency}{product.price}
              </p>
              
              {/* Bestseller Badge */}
              {product.bestseller && (
                <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Bestseller
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
        </>
  );
};

export default Related;