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
  ShoppingBag,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet
} from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'timestamp',
    direction: 'desc'
  });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    paid: 0,
    unpaid: 0,
    failed: 0,
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
        const ordersData = response.data.orders || [];
        // Sort by date initially
        const sortedOrders = sortOrders(ordersData, 'timestamp', 'desc');
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        calculateStats(sortedOrders);
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

  // Sort orders function
  const sortOrders = (ordersArray, field, direction) => {
    return [...ordersArray].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle date fields
      if (field === 'timestamp' || field === 'createdAt') {
        aValue = new Date(aValue || a.timestamp || a.createdAt || 0).getTime();
        bValue = new Date(bValue || b.timestamp || b.createdAt || 0).getTime();
      }

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle sort
  const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
    
    const sorted = sortOrders(filteredOrders, field, direction);
    setFilteredOrders(sorted);
  };

  // Calculate statistics
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'Pending').length,
      processing: ordersData.filter(o => o.status === 'Processing').length,
      shipped: ordersData.filter(o => o.status === 'Shipped').length,
      delivered: ordersData.filter(o => o.status === 'Delivered').length,
      cancelled: ordersData.filter(o => o.status === 'Cancelled').length,
      paid: ordersData.filter(o => o.paymentStatus === 'paid').length,
      unpaid: ordersData.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'pending').length,
      failed: ordersData.filter(o => o.paymentStatus === 'failed').length,
      revenue: ordersData.reduce((sum, o) => sum + (o.total || 0), 0)
    };
    setStats(stats);
  };

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }

    // Date filter - FIXED VERSION
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp || order.createdAt || 0);
        
        switch(dateFilter) {
          case 'today':
            return orderDate >= today;
            
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          }
            
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          }
            
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          }
            
          case 'custom':
            if (customDateRange.start && customDateRange.end) {
              const start = new Date(customDateRange.start);
              const end = new Date(customDateRange.end);
              end.setHours(23, 59, 59, 999);
              return orderDate >= start && orderDate <= end;
            }
            return true;
            
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered = sortOrders(filtered, sortConfig.field, sortConfig.direction);
    
    setFilteredOrders(filtered);
    calculateStats(filtered);
  }, [searchTerm, statusFilter, paymentStatusFilter, dateFilter, customDateRange, orders, sortConfig]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please login as admin');
        return;
      }

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
      toast.dismiss();
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error('Error updating order status');
      }
    }
  };

  // Update payment status - NEW FUNCTION
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please login as admin');
        return;
      }

      const loadingToast = toast.loading('Updating payment status...');

      // You'll need to create this endpoint in your backend
      const response = await axios.post(`${backendUrl}/api/order/admin/update-payment-status`, {
        orderId,
        paymentStatus: newPaymentStatus
      }, {
        headers: { 'token': token }
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}`);
        
        // Update local state
        const updatedOrders = orders.map(order => 
          order.orderId === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        );
        setOrders(updatedOrders);
      } else {
        toast.error(response.data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.dismiss();
      toast.error('Error updating payment status');
    }
  };

  // Export orders as CSV
  const exportToCSV = () => {
    try {
      const headers = [
        'Order ID', 
        'Date', 
        'Customer', 
        'Email', 
        'Phone',
        'Address',
        'Subtotal', 
        'Shipping', 
        'Tax', 
        'Total', 
        'Order Status',
        'Payment Method',
        'Payment Status',
        'Items Count'
      ];
      
      const csvData = filteredOrders.map(order => [
        order.orderId,
        new Date(order.timestamp || order.createdAt).toLocaleString(),
        order.customer?.fullName || 'N/A',
        order.customer?.email || 'N/A',
        order.customer?.phone || 'N/A',
        `${order.customer?.address || ''}, ${order.customer?.city || ''} ${order.customer?.zipCode || ''}`.trim(),
        order.subtotal?.toFixed(2) || '0.00',
        order.shipping?.toFixed(2) || '0.00',
        order.tax?.toFixed(2) || '0.00',
        order.total?.toFixed(2) || '0.00',
        order.status || 'N/A',
        order.paymentMethod || 'N/A',
        order.paymentStatus || 'N/A',
        order.items?.length || 0
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Confirmed': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const badges = {
      'paid': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
      'refunded': 'bg-orange-100 text-orange-800 border-orange-200'
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

  // Get payment icon
  const getPaymentIcon = (method) => {
    switch(method) {
      case 'cod': return <DollarSign className="w-4 h-4" />;
      case 'khalti': return <Wallet className="w-4 h-4" />;
      case 'esewa': return <Wallet className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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

      {/* Stats Cards - Updated */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
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
        <div className="bg-emerald-50 p-4 rounded-lg shadow-sm border border-emerald-200">
          <p className="text-2xl font-bold text-emerald-700">{stats.paid}</p>
          <p className="text-xs text-emerald-600">Paid</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow-sm border text-white">
          <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
          <p className="text-xs text-gray-300">Revenue</p>
        </div>
      </div>

      {/* Filters - Enhanced */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by order ID, customer, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="w-40">
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
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="w-40">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

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

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all' || dateFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
            {searchTerm && <span className="bg-gray-100 px-2 py-1 rounded">Search: {searchTerm}</span>}
            {statusFilter !== 'all' && <span className="bg-gray-100 px-2 py-1 rounded">Status: {statusFilter}</span>}
            {paymentStatusFilter !== 'all' && <span className="bg-gray-100 px-2 py-1 rounded">Payment: {paymentStatusFilter}</span>}
            {dateFilter !== 'all' && <span className="bg-gray-100 px-2 py-1 rounded">Date: {dateFilter}</span>}
          </div>
        )}
      </div>

      {/* Orders Table with Sortable Headers */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Column Headers */}
          <div className="bg-gray-50 p-4 rounded-lg border hidden lg:grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
            <button 
              onClick={() => handleSort('orderId')}
              className="col-span-2 flex items-center gap-1 hover:text-black"
            >
              Order ID <SortIndicator field="orderId" />
            </button>
            <button 
              onClick={() => handleSort('timestamp')}
              className="col-span-2 flex items-center gap-1 hover:text-black"
            >
              Date <SortIndicator field="timestamp" />
            </button>
            <button 
              onClick={() => handleSort('customer.fullName')}
              className="col-span-2 flex items-center gap-1 hover:text-black"
            >
              Customer <SortIndicator field="customer.fullName" />
            </button>
            <span className="col-span-1">Status</span>
            <span className="col-span-1">Payment</span>
            <span className="col-span-1">Method</span>
            <button 
              onClick={() => handleSort('total')}
              className="col-span-1 flex items-center gap-1 hover:text-black"
            >
              Total <SortIndicator field="total" />
            </button>
            <span className="col-span-2">Actions</span>
          </div>

          {filteredOrders.map((order) => (
            <div key={order.orderId || order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Order Header */}
              <div 
                onClick={() => toggleOrderExpand(order.orderId || order._id)}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* Mobile View */}
                <div className="lg:hidden space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-medium">#{order.orderId || order._id?.slice(-8)}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.timestamp)}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      {expandedOrder === (order.orderId || order._id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{order.customer?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.customer?.email || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      {getPaymentIcon(order.paymentMethod)}
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <p className="col-span-2 font-mono font-medium">#{order.orderId || order._id?.slice(-8)}</p>
                  <p className="col-span-2 text-sm">{formatDate(order.timestamp)}</p>
                  <div className="col-span-2">
                    <p className="font-medium truncate">{order.customer?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate">{order.customer?.email || 'N/A'}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-1 text-sm">
                    {getPaymentIcon(order.paymentMethod)}
                    {order.paymentMethod}
                  </div>
                  <p className="col-span-1 font-bold">${order.total?.toFixed(2)}</p>
                  <div className="col-span-2 flex justify-end">
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
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Method:</span>
                          <span className="flex items-center gap-1 text-sm">
                            {getPaymentIcon(order.paymentMethod)}
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Updates */}
                    <div className="space-y-4">
                      {/* Order Status Update */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Update Order Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Confirmed'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.orderId || order._id, status)}
                              disabled={order.status === status}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
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

                      {/* Payment Status Update */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Update Payment Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['paid', 'pending', 'failed', 'refunded'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updatePaymentStatus(order.orderId || order._id, status)}
                              disabled={order.paymentStatus === status}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                order.paymentStatus === status
                                  ? 'bg-gray-900 text-white cursor-not-allowed'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
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