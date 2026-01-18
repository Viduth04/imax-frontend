// src/pages/OrderManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  Trash2, Filter, Search, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

// PDF libs
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // controls
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // view modal
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
      const { data } = await axios.get(`/orders?${params}`);
      if (data.success) {
        setOrders(data.orders || []);
        setPagination({
          currentPage: Number(data.currentPage || 1),
          totalPages: Number(data.totalPages || 1),
          total: Number(data.total || 0),
        });
      }
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data } = await axios.get('/orders/stats/overview');
      if (data.success) setStats(data.stats || {});
    } catch {
      /* ignore */
    }
  }

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      const { data } = await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        toast.success('Order status updated');
        fetchOrders();
        fetchStats();
      }
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const { data } = await axios.delete(`/orders/${orderId}`);
      if (data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
        fetchStats();
      }
    } catch {
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

  // helpers for modal
  const getAddress = (order) => {
    if (!order) return 'No address available';
    const addr = order.shippingAddress || order.address || {};
    if (typeof addr === 'string') return addr;
    const parts = [addr.fullName, addr.address, addr.city, addr.postalCode, addr.country]
      .filter(Boolean);
    return parts.length ? parts.join(', ') : 'Address not available';
  };
  const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

  // client-side search on current page
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) => {
      const id = (o.orderNumber || o._id || '').toString().toLowerCase();
      const name = (o.user?.name || '').toLowerCase();
      const email = (o.user?.email || '').toLowerCase();
      const status = (o.status || '').toLowerCase();
      return id.includes(term) || name.includes(term) || email.includes(term) || status.includes(term);
    });
  }, [orders, searchTerm]);

  // PDF download (fits A4 landscape; shows full Date column)
  const downloadReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      // Header
      const title = 'Orders Report';
      const generatedAt = new Date().toLocaleString();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(title, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Generated: ${generatedAt}`, 40, 60);
      const f = filterStatus ? `Filter: ${filterStatus}` : 'Filter: All';
      doc.text(f, 40, 78);

      const head = [['Order ID', 'Customer', 'Email', 'Status', 'Payment', 'Total (LKR)', 'Date']];
      const body = filteredOrders.map((o) => [
        o.orderNumber || o._id || '',
        o.user?.name || '',
        o.user?.email || '',
        o.status || '',
        o.paymentMethod || 'COD',
        (Number(o.total) || 0).toFixed(2),
        new Date(o.createdAt).toLocaleString(), // full date & time
      ]);

      autoTable(doc, {
        startY: 98,
        head,
        body,
        tableWidth: 'auto',
        styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 120 }, // Order ID
          1: { cellWidth: 110 }, // Customer
          2: { cellWidth: 150 }, // Email
          3: { cellWidth: 80 },  // Status
          4: { cellWidth: 100 }, // Payment
          5: { cellWidth: 90, halign: 'right' }, // Total
          6: { cellWidth: 110 }, // Date
        },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(10);
          doc.setTextColor(120);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 70, pageHeight - 15);
        },
        margin: { top: 80, right: 30, bottom: 30, left: 30 },
      });

      doc.save('orders-report.pdf');
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const openView  = (o) => { setSelectedOrder(o); setShowViewModal(true); };
  const closeView = () => { setSelectedOrder(null); setShowViewModal(false); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center text-3xl font-extrabold text-slate-900">
          <span className="mr-3 grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
            <Package className="h-6 w-6" />
          </span>
          Order Management
        </h2>
        <p className="mt-1 text-slate-600">Manage and track all customer orders</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Pending</p>
          <p className="mt-1 text-3xl font-extrabold text-amber-800">{stats.pendingOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Processing</p>
          <p className="mt-1 text-3xl font-extrabold text-blue-800">{stats.processingOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-purple-700">Shipped</p>
          <p className="mt-1 text-3xl font-extrabold text-purple-800">{stats.shippedOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700">Delivered</p>
          <p className="mt-1 text-3xl font-extrabold text-green-800">{stats.deliveredOrders || 0}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Revenue</p>
          <div className="mt-1">
            <div className="text-sm font-semibold text-blue-700">LKR:</div>
            <div className="text-3xl font-extrabold text-blue-800">{stats.revenue || 0}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, email, or status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 rounded-xl border border-slate-300 bg-slate-50 px-10 py-2 text-sm outline-none ring-blue-500/30 placeholder:text-slate-400 focus:border-transparent focus:ring-2"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white">
              <Filter className="h-5 w-5 text-slate-500" />
            </span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination((p) => ({ ...p, currentPage: 1 }));
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Package className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading orders…</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <tr key={order._id} className="transition-colors hover:bg-slate-50">
                      {/* ORDER */}
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900 leading-tight break-all">
                          {order.orderNumber || order._id}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {order.items?.length || 0} items
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-900">{order.user?.name || '—'}</div>
                        <div className="text-sm text-slate-500">{order.user?.email || '—'}</div>
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-blue-700">LKR:</div>
                        <div className="text-xl font-bold text-blue-600 leading-tight">
                          {(Number(order.total) || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className={`rounded-full border-0 px-3 py-1.5 text-sm font-semibold ${statusCfg.pill}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openView(order)}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-700">Order Details</h2>
              <button onClick={closeView} className="rounded-md px-2 text-2xl text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold text-slate-700">Order ID:</span> {selectedOrder.orderNumber || selectedOrder._id}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Status:</span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Payment:</span>{' '}
                    <span className={`ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${(selectedOrder.paymentMethod || 'COD') === 'COD' ? 'bg-yellow-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {selectedOrder.paymentMethod || 'COD'}
                    </span>
                  </p>
                  <p><span className="font-semibold text-slate-700">Total:</span> LKR {(Number(selectedOrder.total) || 0).toFixed(2)}</p>
                  <p><span className="font-semibold text-slate-700">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold text-slate-700">Name:</span> {selectedOrder.user?.name || '—'}</p>
                  <p><span className="font-semibold text-slate-700">Email:</span> {selectedOrder.user?.email || '—'}</p>
                  <p><span className="font-semibold text-slate-700">Phone:</span> {selectedOrder.shippingAddress?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Shipping Address</h3>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                {getAddress(selectedOrder)}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold uppercase text-slate-500">Order Items</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Qty</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getOrderItems(selectedOrder).length ? (
                      getOrderItems(selectedOrder).map((it, i) => {
                        const qty = it.quantity ?? 1;
                        const price = Number(it.price ?? 0);
                        return (
                          <tr key={i} className="border-t border-slate-200">
                            <td className="px-4 py-3">{it.name}</td>
                            <td className="px-4 py-3">{qty}</td>
                            <td className="px-4 py-3">LKR {price.toFixed(2)}</td>
                            <td className="px-4 py-3">LKR {(price * qty).toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">No items found in this order.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={closeView} className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
