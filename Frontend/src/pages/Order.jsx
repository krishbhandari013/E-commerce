// order-simple.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOrderData = location.state?.orderData;
  
  const [allOrders, setAllOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("orderHistory");
    if (savedOrders) {
      setAllOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save current order to history
  useEffect(() => {
    if (currentOrderData) {
      // Add timestamp if not present
      const orderWithTime = {
        ...currentOrderData,
        timestamp: currentOrderData.timestamp || new Date().toISOString(),
        status: currentOrderData.status || "Confirmed"
      };

      const existingOrders = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      const orderExists = existingOrders.some(order => order.orderId === orderWithTime.orderId);
      
      if (!orderExists) {
        const updatedHistory = [orderWithTime, ...existingOrders];
        localStorage.setItem("orderHistory", JSON.stringify(updatedHistory));
        setAllOrders(updatedHistory);
      }
      setExpandedOrder(orderWithTime.orderId);
    }
  }, [currentOrderData]);

  // Format date with time
  const formatDateTime = (dateString, timestamp) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    };
    
    // If we have timestamp, use it for time
    if (timestamp) {
      const timeDate = new Date(timestamp);
      const timeStr = timeDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return {
        date: date.toLocaleDateString(undefined, options),
        time: timeStr
      };
    }
    
    // Default to current time if no timestamp
    return {
      date: date.toLocaleDateString(undefined, options),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
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

  // Toggle order expansion
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // If no orders
  if (!currentOrderData && allOrders.length === 0) {
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

  const ordersToShow = currentOrderData 
    ? [currentOrderData, ...filteredOrders.filter(o => o.orderId !== currentOrderData.orderId)]
    : filteredOrders;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-white">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Orders</h1>
            <p className="text-gray-500">Track and manage your orders</p>
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
            <p className="text-2xl font-bold">{allOrders.length}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">
              {allOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Items Purchased</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">
              {allOrders.filter(o => o.status === 'Delivered').length}
            </p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <p className="text-2xl font-bold">
              {allOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>
          
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersToShow.length > 0 ? (
          ordersToShow.map((order, orderIndex) => {
            const isExpanded = expandedOrder === order.orderId;
            const { date, time } = formatDateTime(order.date, order.timestamp);
            const itemCount = order.items?.length || 0;
            
            return (
              <div 
                key={order.orderId} 
                className={`border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                  orderIndex === 0 && currentOrderData ? 'border-black shadow-md' : ''
                }`}
              >
                {/* Order Header - Clickable */}
                <div 
                  onClick={() => toggleOrder(order.orderId)}
                  className="bg-white p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Expand/Collapse Icon */}
                      <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      
                      {/* Order Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">#{order.orderId}</span>
                          {orderIndex === 0 && currentOrderData && (
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Current</span>
                          )}
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
                      <span className="text-lg font-bold">{order.currency}{order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items - Expandable */}
                {isExpanded && (
                  <div className="p-5 space-y-5 bg-gray-50">
                    {/* Items */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Items Ordered
                      </h3>
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex gap-4 p-3 bg-white rounded-xl border hover:shadow-md transition-shadow">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-gray-100 border rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  `;
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

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="text-gray-500">Size: {item.size}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">Qty: {item.quantity}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">Price: {order.currency}{item.price?.toFixed(2)}</span>
                              </div>
                            </div>
                            <p className="font-semibold text-lg text-gray-900">
                              {order.currency}{item.total?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-5 rounded-xl border">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Payment Summary
                      </h3>
                      <div className="flex flex-col items-end">
                        <div className="w-full sm:w-72 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{order.currency}{order.subtotal?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">{order.currency}{order.shipping?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">{order.currency}{order.tax?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200 mt-2">
                            <span>Total</span>
                            <span className="text-lg">{order.currency}{order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {order.customer && (
                      <div className="bg-white p-5 rounded-xl border">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Delivery Address
                        </h3>
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

                    {/* Estimated Delivery */}
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Estimated Delivery</p>
                            <p className="text-base font-semibold text-blue-800">
                              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border">
            <p className="text-gray-500">No orders match your search</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="mt-4 text-black underline hover:no-underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

     
    </div>
  );
}