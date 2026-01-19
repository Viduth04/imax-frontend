import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, AlertTriangle, Mail, Package, Phone, MapPin, FileText, Calendar, Shield, Settings, Activity, Ticket, MessageSquare, Mountain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api.js'; // Import your custom axios instance
import SupportTicketList from '../components/support/SupportTicketList';
import FeedbackList from '../components/feedback/FeedbackList';
import UserOrders from './UserOrders';
import UserAppointments from './UserAppointments';

const UserDashboard = () => {
  const { user, checkAuth } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('tickets');
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  // Sync state when user context loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Changed from axios to api
      const { data } = await api.put('/users/profile', profileData);
      if (data.success) {
        toast.success('Profile updated successfully');
        checkAuth(); // Refresh the global user context
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Changed from axios to api
      const { data } = await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (data.success) {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Changed from axios to api
      const { data } = await api.delete('/users/account');
      if (data.success) {
        toast.success('Account deleted successfully');
        window.location.href = '/';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Edit Profile', icon: Settings },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'support', label: 'Support & Feedback', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  const supportSubTabs = [
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'feedback', label: 'My Feedback', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Mountain className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">IMAX Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your IMAX account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      if (item.id === 'support') setActiveSubTab('tickets');
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                  <div className="bg-blue-500 px-8 py-12">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-12 h-12 text-blue-500" />
                      </div>
                      <div className="text-white">
                        <h2 className="text-3xl font-bold">{user?.name}</h2>
                        <p className="text-blue-100 mt-1">{user?.email}</p>
                        <div className="flex items-center mt-4 space-x-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                            {user?.role === 'user' ? 'IMAX Member' : user?.role}
                          </span>
                          <span className="text-sm text-blue-100">
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><Mail className="w-4 h-4 text-slate-500" /></div>
                        <div>
                          <p className="text-sm text-slate-500">Email Address</p>
                          <p className="font-medium text-slate-900">{user?.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><Phone className="w-4 h-4 text-slate-500" /></div>
                        <div>
                          <p className="text-sm text-slate-500">Phone Number</p>
                          <p className="font-medium text-slate-900">{user?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><MapPin className="w-4 h-4 text-slate-500" /></div>
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-medium text-slate-900">{user?.address || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg"><Calendar className="w-4 h-4 text-slate-500" /></div>
                        <div>
                          <p className="text-sm text-slate-500">Account Created</p>
                          <p className="font-medium text-slate-900">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {user?.bio && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-100 rounded-lg"><FileText className="w-4 h-4 text-slate-500" /></div>
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Bio</p>
                            <p className="text-slate-900">{user.bio}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appointments' && <UserAppointments />}
            {activeSection === 'orders' && <UserOrders />}

            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                      <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                      <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all">
                      <Save className="w-5 h-5 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSection === 'support' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Support & Feedback</h2>
                  <p className="text-slate-600">Track your support tickets and equipment feedback</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                      {supportSubTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSubTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                            activeSubTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <tab.icon className="w-4 h-4 inline mr-2" />
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div className="p-6">
                    {activeSubTab === 'tickets' && <SupportTicketList />}
                    {activeSubTab === 'feedback' && <FeedbackList />}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Security Settings</h2>
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Password Requirements</p>
                    <p className="text-sm text-blue-700">Minimum 6 characters. Use a mix of letters and numbers.</p>
                  </div>
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required minLength="6" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required minLength="6" />
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all">
                    <Lock className="w-5 h-5 mr-2" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {activeSection === 'danger' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-red-600">Danger Zone</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
                    <p className="text-red-700 mb-4">This action is permanent and cannot be undone. All data will be wiped.</p>
                    <button onClick={() => setShowDeleteModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal remains the same */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Are you absolutely sure?</h3>
            <p className="text-slate-600 mb-6">This will permanently delete your rental history and preferences.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 bg-slate-100 rounded-xl">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={loading} className="px-6 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50">
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;