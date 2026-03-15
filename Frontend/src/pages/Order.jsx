import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "../App";

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOrderData = location.state?.orderData;
  
  const [allOrders, setAllOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasSavedCurrentOrder, setHasSavedCurrentOrder] = useState(false);
  // ✅ Add this to track if we're currently saving
  const [isSaving, setIsSaving] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      toast.error('Please login to view your orders');
      navigate('/login');
    } else {
      setCurrentUser({ email: userEmail, token });
    }
  }, [navigate]);

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.email) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching orders for:", currentUser.email);
        
        const response = await axios.post(`${backendUrl}/api/order/my-orders`, {
          userEmail: currentUser.email
        }, {
          headers: {
            'token': currentUser.token
          }
        });
        
        console.log("Orders response:", response.data);
        
        if (response.data.success) {
          // ✅ Deduplicate orders from server
          const orders = response.data.orders || [];
          const uniqueOrders = [];
          const seenOrderIds = new Set();
          
          orders.forEach(order => {
            if (!seenOrderIds.has(order.orderId)) {
              seenOrderIds.add(order.orderId);
              uniqueOrders.push(order);
            }
          });
          
          console.log(`Fetched ${orders.length} orders, showing ${uniqueOrders.length} unique orders`);
          setAllOrders(uniqueOrders);
        } else {
          toast.error(response.data.message || 'Failed to load orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        
        if (error.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Make sure backend is running.');
        } else {
          toast.error('Error loading orders from server');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // ✅ FIXED: Save new order to database with duplicate prevention
  useEffect(() => {
    const saveOrderToDatabase = async () => {
      // Don't save if already saved or no data or currently saving
      if (!currentOrderData || !currentUser?.email || !currentUser?.token || hasSavedCurrentOrder || isSaving) {
        return;
      }
      
      // Check if order already exists in state
      const orderExists = allOrders.some(o => o.orderId === currentOrderData.orderId);
      if (orderExists) {
        console.log("Order already exists, skipping save");
        setHasSavedCurrentOrder(true);
        setExpandedOrder(currentOrderData.orderId);
        return;
      }
      
      setIsSaving(true);
      
      try {
        console.log("Saving new order to database:", currentOrderData);
        
        // Remove _id field if it exists
        const { _id, ...cleanOrderData } = currentOrderData;
        
        console.log("Clean order data (no _id):", cleanOrderData);
        
        const response = await axios.post(`${backendUrl}/api/order/create`, {
          orderData: cleanOrderData,
          userEmail: currentUser.email
        }, {
          headers: {
            'token': currentUser.token
          }
        });
        
        console.log("Save order response:", response.data);
        
        if (response.data.success) {
          toast.success('Order saved successfully!');
          setHasSavedCurrentOrder(true);
          
          // ✅ Instead of manually adding, refresh all orders from server
          const refreshResponse = await axios.post(`${backendUrl}/api/order/my-orders`, {
            userEmail: currentUser.email
          }, {
            headers: { 'token': currentUser.token }
          });
          
          if (refreshResponse.data.success) {
            const orders = refreshResponse.data.orders || [];
            const uniqueOrders = [];
            const seenOrderIds = new Set();
            
            orders.forEach(order => {
              if (!seenOrderIds.has(order.orderId)) {
                seenOrderIds.add(order.orderId);
                uniqueOrders.push(order);
              }
            });
            
            setAllOrders(uniqueOrders);
          }
          
          setExpandedOrder(currentOrderData.orderId);
          
          // Clear location state to prevent re-saving
          window.history.replaceState({}, document.title);
        } else {
          toast.error(response.data.message || 'Failed to save order');
          setIsSaving(false);
        }
      } catch (error) {
        console.error('Error saving order:', error);
        
        if (error.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Order may not be saved.');
        } else {
          toast.error('Failed to save order to database');
        }
        setIsSaving(false);
      }
    };

    saveOrderToDatabase();
  }, [currentOrderData, currentUser, allOrders, hasSavedCurrentOrder, isSaving]);

  // Reset hasSavedCurrentOrder when component unmounts or orderData changes
  useEffect(() => {
    return () => {
      setHasSavedCurrentOrder(false);
    };
  }, [currentOrderData]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: 'N/A', time: 'N/A' };
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return { date: 'Invalid date', time: 'Invalid time' };
    }
    
    const dateOptions = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    };
    
    const timeOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions)
    };
  };

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "all" || order.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
      'Processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
      'Delivered': 'bg-green-50 text-green-700 border-green-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return badges[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Calculate total items
  const totalItems = allOrders.reduce((sum, order) => {
    const orderItems = order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0;
    return sum + orderItems;
  }, 0);

  const deliveredOrders = allOrders.filter(o => o.status === 'Delivered').length;
  const totalSpent = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

  const ordersToShow = filteredOrders;

  // Show empty state
  if (allOrders.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't placed any orders. Start shopping to see your order history!</p>
          <Link 
            to="/collection" 
            className="inline-block bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Orders</h1>
            <p className="text-gray-500">Welcome back, {currentUser?.email}</p>
          </div>
          <Link 
            to="/collection" 
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 text-center shadow-md inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">{ordersToShow.length}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">{totalItems}</p>
            <p className="text-xs text-gray-500">Items Purchased</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">{deliveredOrders}</p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search your orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersToShow.map((order) => {
          const isExpanded = expandedOrder === order.orderId;
          const { date, time } = formatDateTime(order.timestamp);
          
          const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
          
          return (
            <div 
              key={order.orderId} 
              className="border rounded-xl overflow-hidden transition-all hover:shadow-lg"
            >
              {/* Order Header */}
              <div 
                onClick={() => toggleOrder(order.orderId)}
                className="bg-white p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">#{order.orderId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                          {order.status || 'Confirmed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{date}</span>
                        <span>•</span>
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                    <span className="text-lg font-bold">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items - Expandable */}
              {isExpanded && (
                <div className="p-5 space-y-5 bg-gray-50">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Items Ordered
                    </h3>
                    {order.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-4 p-3 bg-white rounded-xl border hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-gray-100 border rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-gray-500">Size: {item.size}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">Qty: {item.quantity || 1}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">Price: ${item.price?.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="font-semibold text-lg text-gray-900">
                          ${item.total?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white p-5 rounded-xl border">
                    <h3 className="font-semibold mb-4">Payment Summary</h3>
                    <div className="flex flex-col items-end">
                      <div className="w-full sm:w-72 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">${order.shipping?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">${order.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-lg">${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.customer && (
                    <div className="bg-white p-5 rounded-xl border">
                      <h3 className="font-semibold mb-4">Delivery Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{order.customer.fullName}</p>
                          <p className="text-sm text-gray-600 mt-1">{order.customer.address}</p>
                          <p className="text-sm text-gray-600">{order.customer.city}, {order.customer.zipCode}</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm text-gray-600">📞 {order.customer.phone}</p>
                          <p className="text-sm text-gray-600">📧 {order.customer.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}