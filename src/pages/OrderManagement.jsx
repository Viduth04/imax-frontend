// src/pages/OrderManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  Trash2, Filter, Search, Download, Eye, RefreshCcw,
  TrendingUp, Users, DollarSign, BarChart3, Calendar,
  ChevronLeft, ChevronRight, MoreHorizontal, Settings,
  AlertCircle, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js'; // Using your configured axios instance

// PDF libs
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Controls
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // View modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, pagination.currentPage]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...(filterStatus && { status: filterStatus }),
      });
      const { data } = await api.get(`/orders?${params}`);
      if (data.success) {
        setOrders(data.orders || []);
        setPagination({
          currentPage: Number(data.currentPage || 1),
          totalPages: Number(data.totalPages || 1),
          total: Number(data.total || 0),
        });
      }
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data } = await api.get('/orders/stats/overview');
      if (data.success) setStats(data.stats || {});
    } catch (err) {
      /* ignore silent fail for stats */
    }
  }

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      const { data } = await api.delete(`/orders/${orderId}`);
      if (data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      toast.error('Failed to delete order');
    }
  }

  const getStatusConfig = (status) => {
    const cfg = {
      pending:    { pill: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { pill: 'bg-blue-100 text-blue-800',    icon: Package },
      shipped:    { pill: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered:  { pill: 'bg-green-100 text-green-800',   icon: CheckCircle },
      cancelled:  { pill: 'bg-red-100 text-red-800',       icon: XCircle },
    };
    return cfg[status] || cfg.pending;
  };

  const getAddress = (order) => {
    if (!order) return 'No address available';
    const addr = order.shippingAddress || order.address || {};
    if (typeof addr === 'string') return addr;
    const parts = [addr.fullName, addr.address, addr.city, addr.postalCode, addr.country]
      .filter(Boolean);
    return parts.length ? parts.join(', ') : 'Address not available';
  };

  const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

  // Client-side search within the current page results
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      const id = (o.orderNumber || o._id || '').toString().toLowerCase();
      const name = (o.user?.name || '').toLowerCase();
      const email = (o.user?.email || '').toLowerCase();
      return id.includes(term) || name.includes(term) || email.includes(term);
    });
  }, [orders, searchTerm]);

  const downloadReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const title = 'IMAX Order Management Report';
      const generatedAt = new Date().toLocaleString();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 40, 60);
      doc.text(filterStatus ? `Filter: Status - ${filterStatus}` : 'Filter: All Orders', 40, 75);

      const head = [['Order ID', 'Customer', 'Email', 'Status', 'Payment', 'Total (LKR)', 'Date']];
      const body = filteredOrders.map((o) => [
        o.orderNumber || o._id || '',
        o.user?.name || 'N/A',
        o.user?.email || 'N/A',
        o.status?.toUpperCase() || '',
        o.paymentMethod || 'COD',
        (Number(o.total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        new Date(o.createdAt).toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 95,
        head,
        body,
        styles: { fontSize: 8, cellPadding: 6 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 100 },
          2: { cellWidth: 140 },
          3: { cellWidth: 70, halign: 'center' },
          5: { halign: 'right' },
          6: { cellWidth: 110 }
        },
        margin: { left: 40, right: 40 }
      });

      doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Could not generate PDF');
    }
  };

  const openView = (o) => { setSelectedOrder(o); setShowViewModal(true); };
  const closeView = () => { setSelectedOrder(null); setShowViewModal(false); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {/* Modern Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="animate-fade-in-left">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black mb-2">Order Management</h1>
                  <p className="text-blue-100 text-lg">Track and fulfill customer orders from across Sri Lanka</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
                  <div className="text-sm text-blue-200">Total Orders</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold">{stats.pendingOrders || 0}</div>
                  <div className="text-sm text-blue-200">Pending</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-2xl font-bold">LKR {(stats.revenue || 0).toLocaleString()}</div>
                  <div className="text-sm text-blue-200">Revenue</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-right">
              <button
                onClick={downloadReport}
                className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-2xl px-6 py-4 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Export Report
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={fetchOrders}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl px-6 py-4 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-16 left-16 w-12 h-12 bg-yellow-300/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-32 left-32 w-8 h-8 bg-purple-300/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modern Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">
        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Orders</p>
              <p className="text-3xl font-black text-slate-900">{stats.totalOrders || 0}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">+12% this month</span>
              </div>
            </div>
            <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-slate-200 transition-colors duration-300">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Pending</p>
              <p className="text-3xl font-black text-yellow-600">{stats.pendingOrders || 0}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-600 font-medium">Needs attention</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-2xl group-hover:bg-yellow-200 transition-colors duration-300">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Processing</p>
              <p className="text-3xl font-black text-blue-600">{stats.processingOrders || 0}</p>
              <div className="flex items-center mt-2">
                <Settings className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 font-medium">In progress</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors duration-300">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Shipped</p>
              <p className="text-3xl font-black text-purple-600">{stats.shippedOrders || 0}</p>
              <div className="flex items-center mt-2">
                <Truck className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 font-medium">On the way</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors duration-300">
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Delivered</p>
              <p className="text-3xl font-black text-green-600">{stats.deliveredOrders || 0}</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">Completed</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors duration-300">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Revenue</p>
              <p className="text-2xl font-black text-emerald-700">LKR</p>
              <p className="text-lg font-bold text-emerald-800">{(stats.revenue || 0).toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <DollarSign className="w-3 h-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-600 font-medium">This month</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors duration-300">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filters & Search */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPagination(p => ({ ...p, currentPage: 1 }));
                }}
                className="pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="processing">⚙️ Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
                setPagination(p => ({ ...p, currentPage: 1 }));
              }}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-medium transition-all duration-200 hover:shadow-md"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filterStatus || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-600">Active filters:</span>
            {filterStatus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filterStatus}
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setPagination(p => ({ ...p, currentPage: 1 }));
                  }}
                  className="ml-2 hover:text-blue-600"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:text-purple-600"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Modern Orders Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Order Reference</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Customer</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Order Date</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Total Amount</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Status</th>
                <th className="px-6 py-5 text-center text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <RefreshCcw className="h-12 w-12 animate-spin mb-4 text-blue-500" />
                      <p className="text-lg font-medium">Loading orders...</p>
                      <p className="text-sm text-slate-400 mt-1">Fetching latest data from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={order._id}
                      className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300 animate-fade-in-up border-b border-slate-50 last:border-b-0"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-mono text-sm font-bold text-slate-900">
                              #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                              <Box className="w-3 h-3 mr-1" />
                              {getOrderItems(order).length} items
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {order.user?.name || 'Guest User'}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {order.user?.email || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-slate-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xl font-bold text-slate-900 mb-1">
                          LKR {(order.total || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {order.paymentMethod === 'cash-on-delivery' ? 'Cash on Delivery' : 'Paid Online'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold ${statusConfig.pill} shadow-sm`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openView(order)}
                            className="group relative p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            title="View Order Details"
                          >
                            <Eye className="h-5 w-5" />
                            <div className="absolute inset-0 bg-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </button>

                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className={`appearance-none px-4 py-2 rounded-2xl text-xs font-bold border-0 cursor-pointer transition-all duration-200 hover:scale-105 ${statusConfig.pill} shadow-sm`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-current pointer-events-none" />
                          </div>

                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="group relative p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                            title="Delete Order"
                          >
                            <Trash2 className="h-5 w-5" />
                            <div className="absolute inset-0 bg-red-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-24">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                      <p className="text-sm text-slate-400 text-center max-w-md">
                        {filterStatus || searchTerm
                          ? 'Try adjusting your filters or search terms to find orders.'
                          : 'Orders will appear here once customers start placing them.'
                        }
                      </p>
                      {(filterStatus || searchTerm) && (
                        <button
                          onClick={() => {
                            setFilterStatus('');
                            setSearchTerm('');
                            setPagination(p => ({ ...p, currentPage: 1 }));
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-6 bg-slate-50/50 rounded-b-3xl">
          <div className="text-sm text-slate-600">
            Showing {filteredOrders.length} of {pagination.total} orders
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(p => ({ ...p, currentPage: pageNum }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Order Full Details</h2>
              <button onClick={closeView} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8">
               <div className="grid md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Customer Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Name:</span> <span className="font-semibold">{selectedOrder.user?.name}</span></p>
                      <p><span className="text-slate-500">Email:</span> <span className="font-semibold">{selectedOrder.user?.email}</span></p>
                      <p><span className="text-slate-500">Phone:</span> <span className="font-semibold">{selectedOrder.shippingAddress?.phone || 'N/A'}</span></p>
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 block mb-1">Shipping Address</span>
                        <p className="text-slate-700 leading-relaxed">{getAddress(selectedOrder)}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Payment & Logistics</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Method:</span> <span className="font-bold text-blue-600">{selectedOrder.paymentMethod || 'COD'}</span></p>
                      <p><span className="text-slate-500">Status:</span> <span className="font-semibold capitalize">{selectedOrder.status}</span></p>
                      <p><span className="text-slate-500">Placed On:</span> <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                      <div className="mt-4 p-4 bg-blue-600 rounded-2xl text-white">
                        <span className="text-xs font-medium opacity-80 block">Grand Total</span>
                        <span className="text-2xl font-black">LKR {(Number(selectedOrder.total) || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </section>
               </div>

               <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Items Ordered</h3>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Product Name</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Unit Price</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getOrderItems(selectedOrder).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                            <td className="px-4 py-3 text-center">{item.quantity || 1}</td>
                            <td className="px-4 py-3 text-right">LKR {Number(item.price).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                              LKR {(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </section>
            </div>
            
            <div className="border-t border-slate-100 p-6 flex justify-end">
              <button onClick={closeView} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;