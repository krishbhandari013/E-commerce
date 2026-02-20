// Product.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import Related from '../components/Related';

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart, updateQuantity, cartItems, cartCount } = useContext(ShopContext);
  
  // Refs
  const sizeSectionRef = useRef(null);
  
  // State management
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Find current product
  const product = products.find(p => String(p._id) === String(productId));
  
  // Check if product is in cart
  const cartItem = cartItems?.find(
    item => item.productId === product?._id && item.size === selectedSize
  );

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSize('');
    setQuantity(1);
    setSelectedImage(0);
  }, [productId]);

  // Loading state
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Prepare images array
  const images = Array.isArray(product.image) && product.image.length > 0 
    ? product.image 
    : [product.image || '/placeholder-image.jpg'];

  // Handlers
  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('Please select a size', {
        className: 'mt-20',
        autoClose: 3000,
        position: "top-right",
        theme: "colored"
      });
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await addToCart(product._id, selectedSize, quantity);
      
      // Success toast with cart link
    
      
      

      // Optional: Animate the cart icon
      const cartIcon = document.querySelector('.cart-icon-animate');
      if (cartIcon) {
        cartIcon.classList.add('animate-bounce');
        setTimeout(() => {
          cartIcon.classList.remove('animate-bounce');
        }, 500);
      }

    } catch (error) {
      toast.error('Failed to add to cart. Please try again.', {
        position: "top-right",
        theme: "colored"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size', {
        position: "top-right",
        theme: "colored"
      });
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addToCart(product._id, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!', {
        position: "top-right",
        theme: "colored"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">


      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
        {/* Left Column - Images */}
        <div className="lg:w-1/2">
          <div className="sticky top-24 space-y-4">
            {/* Main Image with Zoom */}
            <div 
              className={`relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-crosshair
                ${isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsImageZoomed(!isImageZoomed)}
            >
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300
                  ${isImageZoomed ? 'scale-150' : 'scale-100'}`}
                style={{
                  transformOrigin: `${(selectedImage % 100)}% ${(selectedImage % 100)}%`
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                }}
              />
              
              {/* Image Navigation Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all
                        ${selectedImage === index 
                          ? 'w-6 bg-black' 
                          : 'bg-gray-400 hover:bg-gray-600'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                      ${selectedImage === index 
                        ? 'border-black opacity-100' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Product
            </button>
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="lg:w-1/2">
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.bestseller && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Bestseller
                </span>
              )}
              {product.new && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  New Arrival
                </span>
              )}
              {product.discount && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl text-gray-900 mb-2">
                {product.name}
              </h1>
             
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {currency}{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {currency}{product.originalPrice}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    Save {currency}{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Rating (if available) */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
            )}

            {/* Short Description */}
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            <div ref={sizeSectionRef} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Select Size <span className="text-red-500 text-xs ml-1">*</span>
                </h3>
                <button className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Size Guide
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => {
                  const isInCart = cartItems?.some(
                    item => item.productId === product._id && item.size === size
                  );
                  
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`relative min-w-[48px] h-12 px-4 rounded-lg border-2 transition-all font-medium
                        ${selectedSize === size 
                          ? 'border-black bg-black text-white' 
                          : isInCart
                            ? 'border-green-500 bg-green-50 text-gray-900'
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                        }`}
                    >
                      {size}
                      {isInCart && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange('decrement')}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1) setQuantity(val);
                    }}
                    className="w-16 text-center font-medium focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange('increment')}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-50 transition font-medium"
                    disabled={product.stock && quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                
                {product.stock && (
                  <span className="text-sm text-gray-500">
                    {product.stock} units available
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`flex-1 bg-black text-white py-4 px-6 rounded-lg font-medium 
                    hover:bg-gray-800 transition-colors flex items-center justify-center gap-2
                    ${isAddingToCart ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-white text-black border-2 border-black py-4 px-6 rounded-lg font-medium 
                    hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Free Delivery</h4>
                  <p className="text-sm text-gray-500">On orders over {currency}50</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Easy Returns</h4>
                  <p className="text-sm text-gray-500">30-day return policy</p>
                </div>
              </div>
            </div>

            {/* Tabs for additional info */}
            <div>
              <div className="flex border-b">
                {['description', 'details', 'shipping'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm capitalize transition
                      ${activeTab === tab 
                        ? 'text-black border-b-2 border-black' 
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="py-4 text-gray-600">
                {activeTab === 'description' && (
                  <p className="leading-relaxed">{product.description}</p>
                )}
                {activeTab === 'details' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Category: {product.category}</li>
                    <li>Sub-category: {product.subCategory}</li>
                    <li>Material: {product.material || 'Premium quality'}</li>
                    <li>Care: Machine wash cold</li>
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>Free shipping on orders over {currency}50</p>
                    <p>Estimated delivery: 3-5 business days</p>
                    <p>Easy 30-day returns</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <Related 
        currentProductId={product._id}
        category={product.category}
        subCategory={product.subCategory}
      />
    </div>
  );
};

export default Product;