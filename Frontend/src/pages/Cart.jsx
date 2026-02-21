import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  Shield,
  Truck,
  RefreshCw,
  Tag,
  X
} from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import CartTool from '../components/CartTool';

const Cart = () => {
  const { 
    cartItems, 
    products, 
    currency,
    removeFromCart, 
    updateQuantity,
  } = useContext(ShopContext);

  const [savedItems, setSavedItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Get product details for each cart item
  const cartItemsWithDetails = cartItems.map(cartItem => {
    const product = products.find(p => p._id === cartItem.productId);
    return {
      ...cartItem,
      productDetails: product,
      total: product?.price * cartItem.quantity || 0
    };
  }).filter(item => item.productDetails);

  // Save for later functionality
  const saveForLater = (item) => {
    setSavedItems([...savedItems, item]);
    removeFromCart(item.productId, item.size);
  };

  // Move to cart from saved items
  const moveToCart = (item) => {
    // Add back to cart logic here
    setSavedItems(savedItems.filter(saved => 
      !(saved.productId === item.productId && saved.size === item.size)
    ));
  };

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE20') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-lg blur opacity-20"></div>
          <div className="relative bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold-400 h-auto bg-black bg-clip-text text-transparent flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-black" />
                  Shopping Cart
                </h1>
                <p className="text-gray-500 mt-2">
                  {cartItems.length > 0 
                    ? `You have ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`
                    : 'Your cart is waiting to be filled'
                  }
                </p>
              </div>
              <Link 
                to="/collection" 
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {cartItems.length === 0 && savedItems.length === 0 ? (
          // Empty Cart View with animations
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-20 w-40 h-40 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-black rounded-full">
                  <ShoppingBag className="w-20 h-20 text-white font-bold-100 " />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Your cart is empty
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Looks like you haven't added anything yet. Explore our collection and find something you'll love!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="group inline-flex items-center justify-center gap-2  bg-gray-100 text-gray-700 px-8 py-3  text-black px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-black-500/25 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Shopping
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/"
                  className="group inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  <Heart className="w-4 h-4" />
                  View Wishlist
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items Section */}
            <div className="flex-1 space-y-6">
              {/* Cart Items List */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    Cart Items ({cartItems.length})
                  </h2>
                </div>

                {cartItemsWithDetails.map((item, index) => (
                  <div 
                    key={`${item.productId}-${item.size}`} 
                    className="group p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image with zoom effect */}
                      <div className="sm:w-32 h-32 relative overflow-hidden rounded-xl">
                        <img 
                          src={item.productDetails.image[0]} 
                          alt={item.productDetails.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                       
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {item.productDetails.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                                Size: {item.size}
                              </span>
                              {item.productDetails.category && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                  {item.productDetails.category}
                                </span>
                              )}
                            </div>
                            
                            {/* Mobile Price */}
                            <div className="sm:hidden mt-3">
                              <span className="text-xl font-bold text-blue-600  ">
                                {currency}{item.productDetails.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Price */}
                          <div className="hidden sm:block text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              {currency}{item.productDetails.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Qty:</span>
                            <div className="flex items-center border-2 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(
                                  item.productId, 
                                  item.size, 
                                  item.quantity - 1
                                )}
                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(
                                  item.productId, 
                                  item.size, 
                                  item.quantity + 1
                                )}
                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                           
                            <button
                              onClick={() => removeFromCart(item.productId, item.size)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-sm text-gray-500">Item Total:</span>
                          <span className="text-lg font-bold text-gray-800">
                            {currency}{item.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Promo Code - Mobile */}
                <div className="p-6 bg-gray-50 lg:hidden">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {promoError && (
                        <p className="text-red-500 text-sm mt-1">{promoError}</p>
                      )}
                    </div>
                    <button
                      onClick={applyPromoCode}
                      disabled={promoApplied}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        promoApplied 
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      }`}
                    >
                      {promoApplied ? 'Applied!' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved for Later Section */}
              {savedItems.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-purple-600" />
                      Saved for Later ({savedItems.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {savedItems.map((item) => (
                      <div key={`saved-${item.productId}-${item.size}`} className="p-4 flex items-center gap-4">
                        <img 
                          src={item.productDetails.image[0]} 
                          alt={item.productDetails.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.productDetails.name}</h4>
                          <p className="text-sm text-gray-500">Size: {item.size}</p>
                        </div>
                        <button
                          onClick={() => moveToCart(item)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shopping Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Free Shipping</h4>
                    <p className="text-xs text-gray-500">On orders over $100</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Easy Returns</h4>
                    <p className="text-xs text-gray-500">30-day return policy</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Secure Payment</h4>
                    <p className="text-xs text-gray-500">100% protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary - Sticky on desktop */}
            <div className="lg:w-96">
              <div className="sticky top-24 space-y-6">
                <CartTool 
                  cartItems={cartItemsWithDetails}
                  currency={currency}
                  promoApplied={promoApplied}
                />
                
                {/* Promo Code - Desktop */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Have a promo code?
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={promoApplied}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        promoApplied 
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      }`}
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-sm mt-2">{promoError}</p>
                  )}
                  {promoApplied && (
                    <p className="text-green-500 text-sm mt-2">
                      Promo code applied successfully!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation keyframes to your global CSS */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Cart;