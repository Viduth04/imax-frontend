import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowLeft, Wrench } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import api from '../api'; // Using your configured axios instance

const ISSUE_TYPES = [
  'Hardware Repair', 'Software Issues', 'Network Problems',
  'Data Recovery', 'Virus Removal', 'General Maintenance', 'Other'
];

const TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

const EditAppointment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  const validationSchema = Yup.object({
    customerName: Yup.string().required('Name is required').matches(/^[a-zA-Z\s]+$/, 'Letters and spaces only'),
    customerEmail: Yup.string().required('Email is required').email('Invalid email'),
    customerPhone: Yup.string()
      .required('Phone is required')
      .matches(/^[\d\s\-+]+$/, 'Invalid format')
      .test('len', 'Must be 10-15 digits', val => {
        const d = val?.replace(/\D/g, '');
        return d?.length >= 10 && d?.length <= 15;
      }),
    appointmentDate: Yup.date().required('Date is required'),
    timeSlot: Yup.string().required('Select a time').oneOf(TIME_SLOTS),
    issueType: Yup.string().required('Select issue type').oneOf(ISSUE_TYPES),
    issueDescription: Yup.string().required('Required').min(10).max(500)
  });

  const formik = useFormik({
    initialValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      appointmentDate: '',
      timeSlot: '',
      issueType: '',
      issueDescription: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.put(`/appointments/${id}`, values);
        toast.success('Appointment updated successfully!');
        navigate('/my-appointments');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    }
  });

  // Fetch initial data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await api.get(`/appointments/${id}`);
        if (data.success) {
          const apt = data.appointment;
          formik.setValues({
            customerName: apt.customerName,
            customerEmail: apt.customerEmail,
            customerPhone: apt.customerPhone,
            appointmentDate: new Date(apt.appointmentDate).toISOString().split('T')[0],
            timeSlot: apt.timeSlot,
            issueType: apt.issueType,
            issueDescription: apt.issueDescription
          });
        }
      } catch (error) {
        toast.error('Could not find appointment');
        navigate('/my-appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  // Debounced Availability Check
  useEffect(() => {
    const checkAvailability = async () => {
      // Don't check if form is still loading initial data
      if (!loading && formik.values.appointmentDate && formik.values.timeSlot) {
        setCheckingAvailability(true);
        try {
          const { data } = await api.get('/appointments/check-availability', {
            params: { 
              date: formik.values.appointmentDate, 
              timeSlot: formik.values.timeSlot,
              excludeAppointmentId: id 
            }
          });
          setAvailabilityStatus(data);
        } catch (error) {
          setAvailabilityStatus({ available: false, message: "Error checking slots" });
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [formik.values.appointmentDate, formik.values.timeSlot, id, loading]);

  const InputField = ({ label, name, type = 'text', ...props }) => (
    <div className="flex flex-col">
      <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">{label}</label>
      <input
        type={type}
        {...formik.getFieldProps(name)}
        className={`px-4 py-3 rounded-xl border transition-all outline-none focus:ring-4 ${
          formik.touched[name] && formik.errors[name]
            ? 'border-red-300 focus:ring-red-50'
            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-50'
        }`}
        {...props}
      />
      {formik.touched[name] && formik.errors[name] && (
        <span className="text-red-500 text-xs mt-1.5 font-medium flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" /> {formik.errors[name]}
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/my-appointments')}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-8 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Appointments
        </button>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Section */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-black flex items-center mb-6 text-slate-800 uppercase tracking-tight">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Appointment Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Full Name" name="customerName" />
                  <InputField label="Phone Number" name="customerPhone" />
                  <div className="md:col-span-2">
                    <InputField label="Email Address" name="customerEmail" type="email" />
                  </div>
                  <InputField label="Date" name="appointmentDate" type="date" min={getMinDate()} />
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Time Slot</label>
                    <select 
                      {...formik.getFieldProps('timeSlot')}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-[50px]"
                    >
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Availability Bar */}
                {availabilityStatus && (
                  <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 ${
                    checkingAvailability ? 'bg-slate-50 border-slate-200' :
                    availabilityStatus.available ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                    'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    {checkingAvailability ? <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" /> : 
                     availabilityStatus.available ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-bold">{checkingAvailability ? 'Checking...' : availabilityStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Issue Section */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-black flex items-center mb-6 text-slate-800 uppercase tracking-tight">
                  <Wrench className="w-5 h-5 mr-2 text-blue-600" /> Issue Details
                </h2>
                <div className="space-y-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Issue Type</label>
                    <select 
                      {...formik.getFieldProps('issueType')}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    >
                      {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Problem Description</label>
                    <textarea 
                      {...formik.getFieldProps('issueDescription')}
                      rows="4"
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    />
                    <div className="flex justify-end mt-2">
                       <span className="text-xs font-bold text-slate-400">{formik.values.issueDescription.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">Update Control</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Changing the date or time will re-verify technician availability. Changes are permanent once saved.
                </p>
                
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid || (availabilityStatus && !availabilityStatus.available)}
                  className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white rounded-2xl font-black transition-all active:scale-95 mb-3"
                >
                  {formik.isSubmitting ? "UPDATING..." : "SAVE CHANGES"}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate('/my-appointments')}
                  className="w-full py-4 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors"
                >
                  DISCARD CHANGES
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointment;