// src/pages/OrderManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  Trash2, Filter, Search, Download, Eye, RefreshCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api'; // Using your configured axios instance

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
      // Use the 'api' instance instead of 'axios'
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
    <div className="p-1 space-y-6">
      {/* Header Section */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="flex items-center text-3xl font-extrabold text-slate-900">
              <span className="mr-3 grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                <Package className="h-6 w-6" />
              </span>
              Order Management
            </h2>
            <p className="mt-1 text-slate-600">Track and fulfill customer orders from across Sri Lanka</p>
          </div>
          <div className="flex gap-3">
             <button
              onClick={downloadReport}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Total Orders" value={stats.totalOrders} color="slate" />
        <StatCard title="Pending" value={stats.pendingOrders} color="yellow" />
        <StatCard title="Processing" value={stats.processingOrders} color="blue" />
        <StatCard title="Shipped" value={stats.shippedOrders} color="purple" />
        <StatCard title="Delivered" value={stats.deliveredOrders} color="green" />
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Total Revenue</p>
          <p className="mt-1 text-xs font-bold text-blue-400">LKR</p>
          <p className="text-2xl font-bold text-blue-800">{(stats.revenue || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(p => ({ ...p, currentPage: 1 }));
            }}
            className="w-full md:w-48 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Order Ref</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <RefreshCcw className="mx-auto h-8 w-8 animate-spin mb-2" />
                    Fetching latest orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-slate-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">
                        LKR {(Number(order.total) || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1 text-xs font-bold ${getStatusConfig(order.status).pill}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openView(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteOrder(order._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-slate-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            Next
          </button>
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

// Sub-component for clean Stats
const StatCard = ({ title, value, color }) => {
  const colors = {
    yellow: 'border-yellow-200 bg-yellow-50 text-amber-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    slate: 'border-slate-200 bg-white text-slate-700',
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colors[color] || colors.slate}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
      <p className="mt-2 text-3xl font-black">{value || 0}</p>
    </div>
  );
};

export default OrderManagement;