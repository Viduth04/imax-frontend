import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Save, X, Search, Mail, Phone, MapPin, Calendar, Shield, Activity, TrendingUp, Settings, MessageSquare, Ticket, Star, AlertCircle, CheckCircle, Clock, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupportTicketList from '../components/support/SupportTicketList';
import FeedbackList from '../components/feedback/FeedbackList';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import toast from 'react-hot-toast';
import api from '../api.js'; // Ensure this path is correct based on your folder structure
import TechnicianManagement from './TechnicianManagement';
import AppointmentManagement from './AppointmentManagement';

const AdminDashboard = () => {
  const { user, checkAuth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    recentUsers: [],
    tickets: {},
    feedback: {},
    products: 0,
    orders: 0
  });
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchStats();
    if (activeSection === 'admins') {
      fetchAdmins();
    }
    if (activeSection === 'deletion-requests') {
      fetchDeletionRequests();
    }
  }, [activeSection]);

  const fetchStats = async () => {
    try {
      // Replaced hardcoded localhost with api instance relative paths
      const [userStats, ticketStats, feedbackStats, productStats, orderStats] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/support-tickets/stats'),
        api.get('/feedback/stats'),
        api.get('/products?limit=1'),
        api.get('/orders/stats/overview')
      ]);

      setStats({
        totalUsers: userStats.data.stats.totalUsers,
        totalAdmins: userStats.data.stats.totalAdmins,
        recentUsers: userStats.data.stats.recentUsers,
        tickets: ticketStats.data.stats,
        feedback: feedbackStats.data.stats,
        products: productStats.data.total || 0,
        orders: orderStats.data.stats.totalOrders || 0
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/admins');
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      toast.error('Failed to fetch admins');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/users/search?query=${searchQuery}`);
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/admins', newAdminData);
      if (data.success) {
        toast.success('Admin created successfully');
        setShowCreateModal(false);
        setNewAdminData({ name: '', email: '', password: '' });
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (adminId) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/admin/admins/${adminId}`, editingAdmin);
      if (data.success) {
        toast.success('Admin updated successfully');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    setLoading(true);
    try {
      const { data } = await api.delete(`/admin/admins/${adminId}`);
      if (data.success) {
        toast.success('Admin deleted successfully');
        fetchAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', profileData);
      if (data.success) {
        toast.success('Profile updated successfully');
        checkAuth();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletionRequests = async () => {
    try {
      const { data } = await api.get('/deletion-requests');
      if (data.success) {
        setDeletionRequests(data.deletionRequests);
      }
    } catch (error) {
      toast.error('Failed to fetch deletion requests');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', activeBg: 'bg-blue-500' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-green-600', bgColor: 'bg-green-50', hoverBg: 'hover:bg-green-100', activeBg: 'bg-green-500' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-50', hoverBg: 'hover:bg-purple-100', activeBg: 'bg-purple-500' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', hoverBg: 'hover:bg-orange-100', activeBg: 'bg-orange-500' },
    { id: 'technicians', label: 'Technicians', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50', hoverBg: 'hover:bg-indigo-100', activeBg: 'bg-indigo-500' },
    { id: 'deletion-requests', label: 'Deletion Requests', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100', activeBg: 'bg-red-500' },
    { id: 'admins', label: 'Manage Admins', icon: Shield, color: 'text-yellow-600', bgColor: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100', activeBg: 'bg-yellow-500' },
    { id: 'tickets', label: 'Support Tickets', icon: Ticket, color: 'text-pink-600', bgColor: 'bg-pink-50', hoverBg: 'hover:bg-pink-100', activeBg: 'bg-pink-500' },
    { id: 'feedback', label: 'Customer Feedback', icon: MessageSquare, color: 'text-cyan-600', bgColor: 'bg-cyan-50', hoverBg: 'hover:bg-cyan-100', activeBg: 'bg-cyan-500' },
    { id: 'profile', label: 'My Profile', icon: Settings, color: 'text-slate-600', bgColor: 'bg-slate-50', hoverBg: 'hover:bg-slate-100', activeBg: 'bg-slate-500' }
  ];

  const renderTicketStats = () => {
    if (!stats.tickets || !stats.tickets.status) return null;
    const statusConfig = {
      open: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock, label: 'Open' },
      'in-progress': { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle, label: 'In Progress' },
      resolved: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'text-slate-600', bg: 'bg-slate-100', icon: CheckCircle, label: 'Closed' }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.tickets.status.map((stat) => {
          const config = statusConfig[stat._id] || statusConfig.open;
          const IconComponent = config.icon;
          return (
            <div key={stat._id} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 capitalize">{config.label} Tickets</p>
                  <p className={`text-3xl font-bold mt-1 ${config.color}`}>{stat.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg}`}>
                  <IconComponent className={`w-6 h-6 ${config.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFeedbackStats = () => {
    if (!stats.feedback || !stats.feedback.overall) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Feedback</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.feedback.overall.totalFeedback}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Average Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.feedback.overall.avgRating?.toFixed(1) || 0}/5</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Satisfaction Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.feedback.overall.avgRating ? `${((stats.feedback.overall.avgRating / 5) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 mt-20">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">IMAX Admin Portal</h1>
          <p className="text-slate-600 mt-1">Manage your e-commerce system</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            {/* Modern Sidebar */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Admin Panel</h2>
                    <p className="text-blue-100 text-sm">Management Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
                    Menu
                  </h3>
                </div>

                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group w-full flex items-center px-4 py-4 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up ${
                      activeSection === item.id
                        ? `${item.activeBg} text-white shadow-xl scale-105`
                        : `text-slate-700 ${item.hoverBg} hover:text-slate-900`
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`p-2 rounded-xl mr-4 transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-white/20 text-white'
                        : `${item.bgColor} ${item.color} group-hover:scale-110`
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={`transition-all duration-300 ${
                      activeSection === item.id ? 'font-semibold' : 'group-hover:font-semibold'
                    }`}>
                      {item.label}
                    </span>
                    {activeSection === item.id && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  System Online
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {/* Modern Content Header */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-slate-600">
                    Manage and monitor your IMAX Computer Parts system
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Last updated</p>
                    <p className="text-sm font-medium text-slate-900">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {activeSection === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl shadow-2xl overflow-hidden text-white">
                  <div className="px-8 py-12">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                          <Shield className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">Welcome back, {user?.name}!</h2>
                          <p className="text-blue-100 mt-1">Administrator Dashboard</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-100 text-sm">Last login</div>
                        <div className="text-white font-semibold">
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern Stats Grid */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Total Users</p>
                      <p className="text-3xl font-black text-blue-800">{stats.totalUsers}</p>
                      <div className="mt-2 text-xs text-blue-600 font-medium">Active users</div>
                    </div>

                    <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Products</p>
                      <p className="text-3xl font-black text-purple-800">{stats.products}</p>
                      <div className="mt-2 text-xs text-purple-600 font-medium">In catalog</div>
                    </div>

                    <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-1">Orders</p>
                      <p className="text-3xl font-black text-green-800">{stats.orders}</p>
                      <div className="mt-2 text-xs text-green-600 font-medium">This month</div>
                    </div>

                    <div className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-slate-500 rounded-xl">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <Users className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Admins</p>
                      <p className="text-3xl font-black text-slate-800">{stats.totalAdmins}</p>
                      <div className="mt-2 text-xs text-slate-600 font-medium">Active admins</div>
                    </div>
                  </div>
                </div>

                {/* Support & Feedback Section */}
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-3">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Support & Feedback</h3>
                </div>
                {renderTicketStats()}
                {renderFeedbackStats()}
              </div>
            )}

            {activeSection === 'products' && <ProductManagement />}
            {activeSection === 'orders' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
                    <p className="text-slate-600">Loading order management...</p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <OrderManagement isEmbedded={true} />
                </div>
              </div>
            )}
            {activeSection === 'appointments' && <AppointmentManagement />}
            {activeSection === 'technicians' && <TechnicianManagement />}

            {activeSection === 'deletion-requests' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-red-100 rounded-xl mr-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Deletion Requests</h2>
                    <p className="text-slate-600">Manage user account deletion requests</p>
                  </div>
                </div>

                {deletionRequests.length > 0 ? (
                  <div className="space-y-4">
                    {deletionRequests.map((request) => (
                      <div key={request._id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Users className="w-5 h-5 text-slate-600 mr-2" />
                              <span className="font-semibold text-slate-900">{request.user?.name || 'Unknown User'}</span>
                              <span className="text-slate-500 ml-2">({request.user?.email})</span>
                            </div>
                            <p className="text-slate-600 mb-3">{request.reason || 'No reason provided'}</p>
                            <div className="flex items-center text-sm text-slate-500">
                              <Clock className="w-4 h-4 mr-1" />
                              Requested on {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                if (window.confirm('Approve this deletion request? This will permanently delete the user account.')) {
                                  // Handle approval logic
                                  toast.success('Deletion request approved');
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Reject this deletion request?')) {
                                  // Handle rejection logic
                                  toast.success('Deletion request rejected');
                                }
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trash2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Deletion Requests</h3>
                    <p className="text-slate-600">All user accounts are currently active.</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'tickets' && <SupportTicketList isAdmin={true} />}
            {activeSection === 'feedback' && <FeedbackList isAdmin={true} />}
            
            {activeSection === 'admins' && (
              <div className="space-y-6">
                {/* Create Admin Modal */}
                {showCreateModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold mb-4">Create New Admin</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newAdminData.name}
                          onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newAdminData.email}
                          onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={async () => {
                              try {
                                const { data } = await api.post('/admin/admins', newAdminData);
                                if (data.success) {
                                  toast.success('Admin created successfully');
                                  setShowCreateModal(false);
                                  setNewAdminData({ name: '', email: '', password: '' });
                                  fetchAdmins();
                                }
                              } catch (error) {
                                toast.error('Failed to create admin');
                              }
                            }}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold"
                          >
                            Create Admin
                          </button>
                          <button
                            onClick={() => setShowCreateModal(false)}
                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Management */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">Admin Management</h2>
                      <p className="text-slate-600 mt-1">Manage administrator accounts</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Admin
                    </button>
                  </div>

                  {/* Admins Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 rounded-t-2xl">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {admins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Shield className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">{admin.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Administrator
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this admin?')) {
                                    // Delete admin logic here
                                    toast.success('Admin deleted successfully');
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {admins.length === 0 && (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No Admins Found</h3>
                      <p className="text-slate-600">Create your first admin account to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                  <div className="flex items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mr-4">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
                      <p className="text-slate-600">Manage your administrator profile settings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Information */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                        <textarea
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Bio and Actions */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          rows={6}
                          placeholder="Tell us about yourself..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all resize-none"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={async () => {
                            try {
                              const { data } = await api.put('/admin/profile', profileData);
                              if (data.success) {
                                toast.success('Profile updated successfully');
                                await checkAuth(); // Refresh user data
                              }
                            } catch (error) {
                              toast.error('Failed to update profile');
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 px-6 rounded-2xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Save className="w-5 h-5 inline mr-2" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setProfileData({
                              name: user?.name || '',
                              email: user?.email || '',
                              phone: user?.phone || '',
                              address: user?.address || '',
                              bio: user?.bio || ''
                            });
                          }}
                          className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Account Created</p>
                    <p className="text-lg font-bold text-slate-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Last Login</p>
                    <p className="text-lg font-bold text-slate-900">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Account Status</p>
                    <p className="text-lg font-bold text-green-600">Active Admin</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;