import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, Save, X, Search, Mail, Phone, MapPin, Calendar, Shield, Activity, TrendingUp, Settings, MessageSquare, Ticket, Star, AlertCircle, CheckCircle, Clock, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupportTicketList from '../components/support/SupportTicketList';
import FeedbackList from '../components/feedback/FeedbackList';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import toast from 'react-hot-toast';
import api from '../api'; // Ensure this path is correct based on your folder structure
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
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'technicians', label: 'Technicians', icon: Users },
    { id: 'deletion-requests', label: 'Deletion Requests', icon: Trash2 },
    { id: 'admins', label: 'Manage Admins', icon: Users },
    { id: 'tickets', label: 'Support Tickets', icon: Ticket },
    { id: 'feedback', label: 'Customer Feedback', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: Settings }
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
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeSection === item.id ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="bg-blue-500 px-8 py-12 text-white">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="w-12 h-12 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{user?.name}</h2>
                        <p className="text-blue-100">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Stats Grid */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">Products</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.products}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">Orders</p>
                      <p className="text-2xl font-bold text-green-600">{stats.orders}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">Admins</p>
                      <p className="text-2xl font-bold text-slate-700">{stats.totalAdmins}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900">Support & Feedback</h3>
                {renderTicketStats()}
                {renderFeedbackStats()}
              </div>
            )}

            {activeSection === 'products' && <ProductManagement />}
            {activeSection === 'orders' && <OrderManagement />}
            {activeSection === 'appointments' && <AppointmentManagement />}
            {activeSection === 'technicians' && <TechnicianManagement />}
            {activeSection === 'tickets' && <SupportTicketList isAdmin={true} />}
            {activeSection === 'feedback' && <FeedbackList isAdmin={true} />}
            
            {activeSection === 'admins' && (
               <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                 <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">Admin Management</h2>
                    <button onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Create Admin
                    </button>
                 </div>
                 {/* Table and other Admin logic... */}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;