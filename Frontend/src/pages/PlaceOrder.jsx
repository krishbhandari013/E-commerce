import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { cartItems, products, currency, delivery_free, getCartTotal, clearCart } = useContext(ShopContext);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // ✅ Add this to prevent double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      toast.error('Please login to place order');
      navigate('/login');
    } else {
      setCurrentUser({ email: userEmail, token });
    }
  }, [navigate]);

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? delivery_free : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Debug: Check product structure on mount
  useEffect(() => {
    if (products && products.length > 0) {
      console.log("Sample product structure:", products[0]);
    }
  }, [products]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["fullName", "email", "address", "city", "zipCode", "phone"];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Valid phone number is required (10+ digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get product image from various formats
  const getProductImage = (product) => {
    if (!product) return null;
    
    const imageFields = ['image', 'img', 'images', 'thumbnail', 'picture', 'photo', 'imageUrl'];
    
    for (const field of imageFields) {
      const value = product[field];
      
      if (value) {
        if (typeof value === 'string') {
          return value;
        }
        if (typeof value === 'object' && value.url) {
          return value.url;
        }
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === 'string') {
            return firstItem;
          }
          if (firstItem && firstItem.url) {
            return firstItem.url;
          }
        }
      }
    }
    
    return null;
  };

  // ✅ FIXED: Handle form submission with double-submission prevention
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearCart(); // Clear cart immediately to prevent duplicate orders on refresh or back navigation
    
    // ✅ PREVENT DOUBLE SUBMISSION
    if (isSubmitting || isProcessing) {
      console.log("Already submitting, please wait...");
      toast.loading("Processing your order...", { id: "processing" });
      return;
    }
    
    if (!validateForm()) return;
    if (!currentUser) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setIsSubmitting(true);

    try {
      // Prepare order items
      const orderItems = cartItems.map(item => {
        const product = products.find(p => p._id === item.productId);
        const imageUrl = getProductImage(product);
        
        return {
          name: product?.name || 'Product',
          size: item.size,
          quantity: item.quantity,
          price: product?.price || 0,
          total: (product?.price || 0) * item.quantity,
          image: imageUrl
        };
      });

      // Prepare complete order data
      const orderData = {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        currency,
        status: paymentMethod === 'cod' ? "Confirmed" : "Processing",
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        paymentMethod,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      console.log("🔍 Order data being sent:", JSON.stringify(orderData, null, 2));

      // ✅ Save order to database via backend
      const response = await axios.post('http://localhost:5000/api/order/create', {
        orderData: orderData,
        userEmail: currentUser.email
      });

      console.log("Backend response:", response.data);

      if (response.data.success) {
        // Clear cart and show success
        
        toast.dismiss("processing");
        toast.success('Order placed successfully!');
        
        // Navigate to order confirmation page with order data
        navigate("/order", { 
          state: { 
            orderData: response.data.order || orderData 
          } 
        });
      } else {
        toast.dismiss("processing");
        toast.error(response.data.message || 'Failed to place order');
        setIsSubmitting(false); // Reset on error so user can try again
      }
    } catch (error) {
      console.error("Order failed:", error);
      toast.dismiss("processing");
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else if (error.response) {
        toast.error(error.response.data?.message || 'Failed to place order');
      } else {
        toast.error('An error occurred. Please try again.');
      }
      setIsSubmitting(false); // Reset on error
    } finally {
      setIsProcessing(false);
      // Note: isSubmitting is NOT reset on success to prevent double navigation
    }
  };

  // If cart is empty
  if (!cartItems?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to your cart to proceed with checkout.</p>
          <Link to="/collection" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="New York"
                      className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-black transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-black transition opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                    disabled
                  />
                  <div>
                    <p className="font-medium">Credit/Debit Card <span className="text-xs text-gray-400">(Coming Soon)</span></p>
                    <p className="text-sm text-gray-500">Pay securely online</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button for Mobile */}
            <button
              type="submit"
              disabled={isProcessing || isSubmitting}
              className="lg:hidden w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isProcessing || isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Place Order • ${currency}${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Right Side - Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Items List */}
            <div className="max-h-60 overflow-y-auto mb-4 space-y-3 pr-2">
              {cartItems.map((item, index) => {
                const product = products.find(p => p._id === item.productId);
                return (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span className="flex-1">
                      {product?.name} <span className="text-gray-500">(Size: {item.size})</span>
                      <span className="block text-xs text-gray-400">Qty: {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {currency}{(product?.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{currency}{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span>{currency}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span className="text-black">{currency}{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Desktop Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing || isSubmitting}
              className="hidden lg:block w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-medium mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isProcessing || isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Place Order • ${currency}${total.toFixed(2)}`
              )}
            </button>

            {/* Back to Cart Link */}
            <Link 
              to="/cart"
              className="block text-center text-sm text-gray-500 hover:text-black mt-4 transition"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}