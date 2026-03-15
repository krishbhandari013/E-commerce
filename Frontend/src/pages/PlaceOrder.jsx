import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import toast from "react-hot-toast";
import CartLoader from "./CartLoader";
import { backendUrl } from "../App";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Payment gateway configurations
  const ESEWA_MERCHANT_ID = "EPAYTEST";

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur (for validation on exit)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Validate single field
  const validateField = (fieldName, value) => {
    let error = "";
    
    switch(fieldName) {
      case "fullName":
        if (!value?.trim()) {
          error = "Full name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = "Name can only contain letters and spaces";
        }
        break;
        
      case "email":
        if (!value?.trim()) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Valid email is required";
        }
        break;
        
      case "address":
        if (!value?.trim()) {
          error = "Address is required";
        } else if (value.trim().length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;
        
      case "city":
        if (!value?.trim()) {
          error = "City is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = "City can only contain letters and spaces";
        }
        break;
        
      case "zipCode":
        if (!value?.trim()) {
          error = "Zip code is required";
        } else if (!/^\d{5,6}$/.test(value.trim())) {
          error = "Valid zip code is required (5-6 digits)";
        }
        break;
        
      case "phone":
        if (!value?.trim()) {
          error = "Phone number is required";
        } else if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
          error = "Valid phone number is required (10+ digits)";
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Validate entire form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate each field
    Object.keys(formData).forEach(field => {
      const value = formData[field];
      let error = "";
      
      switch(field) {
        case "fullName":
          if (!value?.trim()) {
            error = "Full name is required";
            isValid = false;
          } else if (value.trim().length < 2) {
            error = "Name must be at least 2 characters";
            isValid = false;
          } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
            error = "Name can only contain letters and spaces";
            isValid = false;
          }
          break;
          
        case "email":
          if (!value?.trim()) {
            error = "Email is required";
            isValid = false;
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            error = "Valid email is required";
            isValid = false;
          }
          break;
          
        case "address":
          if (!value?.trim()) {
            error = "Address is required";
            isValid = false;
          } else if (value.trim().length < 5) {
            error = "Address must be at least 5 characters";
            isValid = false;
          }
          break;
          
        case "city":
          if (!value?.trim()) {
            error = "City is required";
            isValid = false;
          } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
            error = "City can only contain letters and spaces";
            isValid = false;
          }
          break;
          
        case "zipCode":
          if (!value?.trim()) {
            error = "Zip code is required";
            isValid = false;
          } else if (!/^\d{5,6}$/.test(value.trim())) {
            error = "Valid zip code is required (5-6 digits)";
            isValid = false;
          }
          break;
          
        case "phone":
          if (!value?.trim()) {
            error = "Phone number is required";
            isValid = false;
          } else if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
            error = "Valid phone number is required (10+ digits)";
            isValid = false;
          }
          break;
          
        default:
          break;
      }
      
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    if (!input) return '';
    return input.replace(/<[^>]*>?/gm, '').trim();
  };

  // Helper function to get product image
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

  // Save order to database with pending status
  const saveOrder = async (orderData) => {
    console.log("Saving order to database...", orderData.orderId);
    const response = await axios.post(`${backendUrl}/api/order/create`, {
      orderData: {
        ...orderData,
        paymentStatus: 'pending'
      },
      userEmail: currentUser.email
    });

    console.log("Save order response:", response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save order');
    }

    return response.data.order;
  };

  const handleKhaltiPayment = async (savedOrder) => {
    console.log("Initiating Khalti payment for order:", savedOrder.orderId);
    
    const toastId = toast.loading("Connecting to Khalti...");
    
    try {
      const initiateResponse = await axios.post(`${backendUrl}/api/payment/khalti/initiate`, {
        orderData: savedOrder,
        userEmail: currentUser.email
      });

      console.log("Khalti initiate response:", initiateResponse.data);

      if (!initiateResponse.data.success) {
        throw new Error(initiateResponse.data.message || 'Failed to initiate payment');
      }

      if (!initiateResponse.data.payment_url) {
        throw new Error('No payment URL received from Khalti');
      }

      sessionStorage.setItem('khaltiPidx', initiateResponse.data.pidx);
      sessionStorage.setItem('pendingOrder', JSON.stringify(savedOrder));
      sessionStorage.setItem('pendingCart', JSON.stringify(cartItems));
      sessionStorage.setItem('paymentMethod', 'khalti');

      toast.dismiss(toastId);
      toast.success("Redirecting to Khalti payment page...", { duration: 2000 });
      
      setTimeout(() => {
        window.location.href = initiateResponse.data.payment_url;
      }, 1500);

    } catch (error) {
      toast.dismiss(toastId);
      console.error("Khalti payment error:", error);
      
      let errorMessage = 'Failed to process Khalti payment';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Khalti authentication failed. Please check API keys.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid payment request';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to payment server. Please try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  // eSewa payment handler
  const handleEsewaPayment = (savedOrder) => {
    console.log("Initiating eSewa payment for order:", savedOrder.orderId);
    
    return new Promise((resolve, reject) => {
      try {
        const esewaUrl = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = esewaUrl;
        form.target = '_blank';

        const params = {
          amt: total.toFixed(2),
          psc: shipping.toFixed(2),
          pdc: '0',
          txAmt: tax.toFixed(2),
          tAmt: total.toFixed(2),
          pid: savedOrder.orderId,
          scd: ESEWA_MERCHANT_ID,
          su: `${window.location.origin}/payment/success?gateway=esewa&oid=${savedOrder.orderId}`,
          fu: `${window.location.origin}/payment/failure?gateway=esewa`
        };

        Object.keys(params).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = params[key];
          form.appendChild(input);
        });

        sessionStorage.setItem('pendingOrder', JSON.stringify(savedOrder));
        sessionStorage.setItem('pendingCart', JSON.stringify(cartItems));
        sessionStorage.setItem('paymentMethod', 'esewa');
        
        document.body.appendChild(form);
        form.submit();
        
        setTimeout(() => {
          document.body.removeChild(form);
        }, 100);

        resolve({ success: true, message: 'Redirecting to eSewa...' });
      } catch (error) {
        console.error("eSewa payment error:", error);
        reject(error);
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    
    console.log("Form submitted with payment method:", paymentMethod);
    
    setFormSubmitted(true);
    
    // Mark all fields as touched to show errors
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    // Validate form before submission
    if (!validateForm()) {
      console.log("Form validation failed");
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    if (isSubmitting || isProcessing) {
      console.log("Already submitting, please wait...");
      return;
    }
    
    if (!currentUser) {
      toast.error('Please login to place order');
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);
    setIsSubmitting(true);

    try {
      // Sanitize form data before sending
      const sanitizedFormData = {
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email).toLowerCase(),
        address: sanitizeInput(formData.address),
        city: sanitizeInput(formData.city),
        zipCode: sanitizeInput(formData.zipCode),
        phone: sanitizeInput(formData.phone)
      };

      // Prepare order items with validation
      const orderItems = cartItems.map(item => {
        const product = products.find(p => p._id === item.productId);
        
        if (!product) {
          throw new Error('Product not found in cart');
        }
        
        const imageUrl = getProductImage(product);
        const price = item.productPrice || item.price || product?.price || 0;
        const name = item.productName || item.name || product?.name || 'Product';
        
        if (item.quantity < 1) {
          throw new Error('Invalid quantity for product: ' + name);
        }
        
        return {
          name: sanitizeInput(name),
          size: item.size || '',
          quantity: item.quantity,
          price: price,
          total: price * item.quantity,
          image: imageUrl || ''
        };
      });

      // Prepare order data
      const orderData = {
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        currency,
        status: paymentMethod === 'cod' ? "Confirmed" : "Pending",
        customer: sanitizedFormData,
        paymentMethod,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      console.log("Order data prepared:", orderData);

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        toast.loading("Placing your order...", { id: "cod" });
        
        const savedOrder = await saveOrder(orderData);
        
        toast.dismiss("cod");
        toast.success('Order placed successfully!');
        
        await clearCart();
        
        navigate("/order", { 
          state: { orderData: savedOrder } 
        });
      } 
      else if (paymentMethod === 'khalti') {
        toast.loading("Saving order...", { id: "khalti" });
        
        const savedOrder = await saveOrder(orderData);
        
        toast.dismiss("khalti");
        
        await handleKhaltiPayment(savedOrder);
      } 
      else if (paymentMethod === 'esewa') {
        toast.loading("Saving order...", { id: "esewa" });
        
        const savedOrder = await saveOrder(orderData);
        
        toast.dismiss("esewa");
        
        await handleEsewaPayment(savedOrder);
      }

    } catch (error) {
      console.error("Order failed:", error);
      toast.dismiss();
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else if (error.response) {
        toast.error(error.response.data?.message || 'Failed to place order');
      } else {
        toast.error(error.message || 'An error occurred. Please try again.');
      }
      setIsSubmitting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty
  if (!cartItems?.length) {
    return <CartLoader />;
  }

  // Count number of errors
  const errorCount = Object.keys(errors).filter(key => errors[key]).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Delivery Information</h2>
                {formSubmitted && errorCount > 0 && (
                  <span className="text-sm text-red-500">
                    {errorCount} error{errorCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className={`w-full border ${touchedFields.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {touchedFields.fullName && errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`w-full border ${touchedFields.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {touchedFields.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="123 Main St"
                    className={`w-full border ${touchedFields.address && errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {touchedFields.address && errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City and Zip Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="New York"
                      className={`w-full border ${touchedFields.city && errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                    />
                    {touchedFields.city && errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="10001"
                      className={`w-full border ${touchedFields.zipCode && errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                    />
                    {touchedFields.zipCode && errors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="1234567890"
                    className={`w-full border ${touchedFields.phone && errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-black focus:ring-1 focus:ring-black outline-none transition`}
                  />
                  {touchedFields.phone && errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'hover:border-gray-400'}`}>
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

                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'khalti' ? 'border-purple-600 bg-purple-50' : 'hover:border-purple-400'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="khalti"
                    checked={paymentMethod === "khalti"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                  />
                  <div className="flex items-center w-full justify-between">
                    <div>
                      <p className="font-medium">Khalti</p>
                      <p className="text-sm text-gray-500">Phone: 9800000000, OTP: 123456</p>
                    </div>
                    <img 
                      src="https://images.seeklogo.com/logo-png/33/1/khalti-logo-png_seeklogo-337962.png" 
                      alt="Khalti" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </label>

                <label className={`flex items-center p-3 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50`}>
                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={paymentMethod === "esewa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3 w-4 h-4"
                    disabled
                  />
                  <div className="flex items-center w-full justify-between">
                    <div>
                      <p className="font-medium">eSewa <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span></p>
                      <p className="text-sm text-gray-400">Currently unavailable</p>
                    </div>
                    <img 
                      src="https://esewa.com.np/common/images/esewa_logo.png" 
                      alt="eSewa" 
                      className="w-16 h-6 object-contain opacity-50"
                    />
                  </div>
                </label>
              </div>
            </div>
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
                const itemName = item.productName || item.name || product?.name || 'Product';
                const itemPrice = item.productPrice || item.price || product?.price || 0;
                
                return (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span className="flex-1">
                      {itemName} {item.size && <span className="text-gray-500">(Size: {item.size})</span>}
                      <span className="block text-xs text-gray-400">Qty: {item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {currency}{(itemPrice * item.quantity).toFixed(2)}
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

            {/* Validation Summary - Only show when form submitted AND there are errors */}
            {formSubmitted && errorCount > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following error{errorCount > 1 ? 's' : ''}:
                </p>
                <ul className="text-xs text-red-600 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    error && <li key={field} className="capitalize">{field}: {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="space-y-3 mt-6">
              {paymentMethod === 'cod' && (
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || isSubmitting}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isProcessing || isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Place Order • ${currency}${total.toFixed(2)}`
                  )}
                </button>
              )}

              {paymentMethod === 'khalti' && (
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || isSubmitting}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  {isProcessing || isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <img src="https://images.seeklogo.com/logo-png/33/1/khalti-logo-png_seeklogo-337962.png" alt="Khalti" className="w-5 h-5" />
                      Pay with Khalti
                    </>
                  )}
                </button>
              )}

              {paymentMethod === 'esewa' && (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="w-16 h-5 object-contain opacity-50" />
                  <span className="text-sm">Coming Soon</span>
                </button>
              )}
            </div>

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