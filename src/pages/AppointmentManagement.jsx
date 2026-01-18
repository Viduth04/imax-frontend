import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Trash2, Filter, UserCheck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../api'; // Crucial: Using your custom instance

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Memoized fetch functions to prevent effect loops
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...(filterStatus && { status: filterStatus })
      };

      // api instance automatically prepends the baseURL
      const { data } = await api.get('/appointments', { params });
      if (data.success) {
        setAppointments(data.appointments);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages,
          total: data.total
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filterStatus]);

  const fetchTechnicians = async () => {
    try {
      const { data } = await api.get('/technicians?status=active');
      if (data.success) setTechnicians(data.technicians);
    } catch (error) {
      console.error('Failed to fetch technicians');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/appointments/stats/overview');
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
    fetchStats();
  }, [fetchAppointments]);

  // Formik logic
  const assignFormik = useFormik({
    initialValues: { technicianId: '' },
    validationSchema: Yup.object({
      technicianId: Yup.string().required('Please select a technician')
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { data } = await api.put(
          `/appointments/${selectedAppointment._id}/assign-technician`,
          values
        );
        if (data.success) {
          toast.success('Technician assigned successfully');
          setShowAssignModal(false);
          resetForm();
          fetchAppointments();
          fetchStats();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to assign technician');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const { data } = await api.put(`/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Delete this appointment permanently?')) return;
    try {
      const { data } = await api.delete(`/appointments/${appointmentId}`);
      if (data.success) {
        toast.success('Deleted successfully');
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      'in-progress': { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Stats Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <Calendar className="w-7 h-7 mr-3 text-blue-600" />
            Appointments
          </h2>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(p => ({ ...p, currentPage: 1 }));
            }}
            className="border-none focus:ring-0 text-sm font-medium text-slate-600"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', val: stats.totalAppointments, color: 'slate' },
          { label: 'Pending', val: stats.pendingAppointments, color: 'yellow' },
          { label: 'Confirmed', val: stats.confirmedAppointments, color: 'blue' },
          { label: 'Active', val: stats.inProgressAppointments, color: 'purple' },
          { label: 'Done', val: stats.completedAppointments, color: 'green' },
          { label: 'Nulled', val: stats.cancelledAppointments, color: 'red' },
        ].map((item) => (
          <div key={item.label} className={`bg-white rounded-xl p-4 border-b-4 border-${item.color}-500 shadow-sm`}>
            <p className="text-xs font-semibold text-slate-500 uppercase">{item.label}</p>
            <p className="text-xl font-bold text-slate-900">{item.val || 0}</p>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No appointments found</h3>
            <p className="text-slate-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">ID / Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Technician</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-blue-600">{apt.appointmentNumber}</span>
                      <p className="text-xs text-slate-400 mt-1">{new Date(apt.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{apt.customerName}</p>
                      <p className="text-xs text-slate-500">{apt.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <p className="text-xs text-slate-500 ml-5">{apt.timeSlot}</p>
                    </td>
                    <td className="px-6 py-4">
                      {apt.technician ? (
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold mr-2">
                            {apt.technician.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{apt.technician.name}</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setSelectedAppointment(apt); setShowAssignModal(true); }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          + Assign Tech
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusUpdate(apt._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border-none ring-1 ring-inset ${getStatusConfig(apt.status).color} cursor-pointer focus:ring-2`}
                        disabled={['completed', 'cancelled'].includes(apt.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">Active</option>
                        <option value="completed">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(apt._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{appointments.length}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Technician Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-blue-600" />
              Assign Technician
            </h3>

            <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Appointment</p>
                  <p className="font-bold text-slate-900">{selectedAppointment?.appointmentNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Issue</p>
                  <p className="text-sm font-medium text-slate-700">{selectedAppointment?.issueType}</p>
                </div>
              </div>
            </div>

            <form onSubmit={assignFormik.handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Expert</label>
                <select
                  {...assignFormik.getFieldProps('technicianId')}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all ${
                    assignFormik.touched.technicianId && assignFormik.errors.technicianId
                      ? 'border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                >
                  <option value="">Choose technician...</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAssignModal(false); assignFormik.resetForm(); }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignFormik.isSubmitting || !assignFormik.isValid}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                >
                  {assignFormik.isSubmitting ? 'Assigning...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;