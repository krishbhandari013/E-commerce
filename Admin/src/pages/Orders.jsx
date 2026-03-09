import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { backendUrl } from '../App';
import { 
  Package, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  ShoppingBag
} from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please login as admin');
        return;
      }

      const response = await axios.get(`${backendUrl}/api/order/admin/all`, {
        headers: { 'token': token }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setFilteredOrders(response.data.orders || []);
        calculateStats(response.data.orders || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error('Error loading orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate statistics
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'Pending').length,
      processing: ordersData.filter(o => o.status === 'Processing').length,
      shipped: ordersData.filter(o => o.status === 'Shipped').length,
      delivered: ordersData.filter(o => o.status === 'Delivered').length,
      cancelled: ordersData.filter(o => o.status === 'Cancelled').length,
      revenue: ordersData.reduce((sum, o) => sum + (o.total || 0), 0)
    };
    setStats(stats);
  };

  // Filter orders based on search, status, and date
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          filtered = filtered.filter(order => new Date(order.timestamp) > filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.timestamp) > filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.timestamp) > filterDate);
          break;
        default:
          break;
      }
    }

    setFilteredOrders(filtered);
    calculateStats(filtered);
  }, [searchTerm, statusFilter, dateFilter, orders]);

  // Update order status - UPDATED ROUTE
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please login as admin');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Updating order status...');

      const response = await axios.post(`${backendUrl}/api/order/admin/update-status`, {
        orderId,
        status: newStatus
      }, {
        headers: { 'token': token }
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        
        // Update local state
        const updatedOrders = orders.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error('Error updating order status');
      }
    }
  };

  // Export orders as CSV
  const exportToCSV = () => {
    try {
      const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Total', 'Status', 'Items'];
      const csvData = filteredOrders.map(order => [
        order.orderId,
        new Date(order.timestamp).toLocaleDateString(),
        order.customer?.fullName || 'N/A',
        order.customer?.email || 'N/A',
        `$${order.total?.toFixed(2)}`,
        order.status,
        order.items?.length || 0
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export orders');
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Processing': return <Package className="w-4 h-4" />;
      case 'Shipped': return <Truck className="w-4 h-4" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-500">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
          <p className="text-xs text-blue-600">Processing</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
          <p className="text-xs text-purple-600">Shipped</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
          <p className="text-xs text-green-600">Delivered</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          <p className="text-xs text-red-600">Cancelled</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow-sm border text-white">
          <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
          <p className="text-xs text-gray-300">Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID, customer, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="w-48">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.orderId || order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div 
                onClick={() => toggleOrderExpand(order.orderId || order._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="font-mono font-medium">#{order.orderId || order._id?.slice(-8)}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.timestamp)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium">{order.customer?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${order.total?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                  <div>
                    {expandedOrder === (order.orderId || order._id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === (order.orderId || order._id) && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Customer Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> {order.customer?.fullName}</p>
                        <p><span className="text-gray-500">Email:</span> {order.customer?.email}</p>
                        <p><span className="text-gray-500">Phone:</span> {order.customer?.phone || 'N/A'}</p>
                        <p><span className="text-gray-500">Address:</span> {order.customer?.address}, {order.customer?.city} {order.customer?.zipCode}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">Payment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal:</span>
                          <span>${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Shipping:</span>
                          <span>${order.shipping?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tax:</span>
                          <span>${order.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span>${order.total?.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Payment: {order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">Update Status</h4>
                      <div className="space-y-2">
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.orderId || order._id, status)}
                            disabled={order.status === status}
                            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                              order.status === status
                                ? 'bg-gray-900 text-white cursor-not-allowed'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 bg-white p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <div className="flex gap-3 text-sm text-gray-500">
                              <span>Size: {item.size}</span>
                              <span>Qty: {item.quantity}</span>
                              <span>Price: ${item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                          <p className="font-semibold">${item.total?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;