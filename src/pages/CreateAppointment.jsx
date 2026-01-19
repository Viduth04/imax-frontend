import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowLeft, Wrench } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api.js';

const ISSUE_TYPES = [
  'Hardware Repair', 'Software Issues', 'Network Problems',
  'Data Recovery', 'Virus Removal', 'General Maintenance', 'Other'
];

const TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

const CreateAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Policy: Book at least 2 days in advance
    return date.toISOString().split('T')[0];
  };

  const validationSchema = Yup.object({
    customerName: Yup.string()
      .required('Name is required')
      .matches(/^[a-zA-Z\s]+$/, 'Letters and spaces only'),
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
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      appointmentDate: '',
      timeSlot: '',
      issueType: '',
      issueDescription: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await api.post('/appointments', values);
        toast.success('Appointment booked!');
        navigate('/my-appointments');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Booking failed');
      }
    }
  });

  useEffect(() => {
    const checkAvailability = async () => {
      if (formik.values.appointmentDate && formik.values.timeSlot) {
        setCheckingAvailability(true);
        try {
          const { data } = await api.get('/appointments/check-availability', {
            params: { date: formik.values.appointmentDate, timeSlot: formik.values.timeSlot }
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
  }, [formik.values.appointmentDate, formik.values.timeSlot]);

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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-slate-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black">Book a Repair</h1>
          <p className="text-slate-400 mt-2">Professional hardware and software diagnostics</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold flex items-center mb-6 text-slate-800">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Contact & Schedule
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Name" name="customerName" placeholder="Full Name" />
                  <InputField label="Phone" name="customerPhone" placeholder="077..." />
                  <div className="md:col-span-2">
                    <InputField label="Email" name="customerEmail" type="email" />
                  </div>
                  <InputField label="Date" name="appointmentDate" type="date" min={getMinDate()} />
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Time Slot</label>
                    <select 
                      {...formik.getFieldProps('timeSlot')}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select a time</option>
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Availability Bar */}
                {(formik.values.appointmentDate && formik.values.timeSlot) && (
                  <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 ${
                    checkingAvailability ? 'bg-slate-50 border-slate-200' :
                    availabilityStatus?.available ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
                    'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    {checkingAvailability ? <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" /> : 
                     availabilityStatus?.available ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-bold tracking-tight">
                      {checkingAvailability ? 'Verifying schedule...' : availabilityStatus?.message}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold flex items-center mb-6 text-slate-800">
                  <Wrench className="w-5 h-5 mr-2 text-blue-600" /> Issue Description
                </h2>
                <div className="space-y-5">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Type of Issue</label>
                    <select 
                      {...formik.getFieldProps('issueType')}
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                    >
                      <option value="">Choose category</option>
                      {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-600 mb-1.5 ml-1">Details</label>
                    <textarea 
                      {...formik.getFieldProps('issueDescription')}
                      rows="4"
                      className="px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                      placeholder="Symptoms, when it started, etc..."
                    />
                    <div className="flex justify-between mt-2 px-1">
                       <span className="text-[10px] uppercase font-black text-slate-400">Min 10 characters</span>
                       <span className="text-xs font-bold text-slate-500">{formik.values.issueDescription.length}/500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Service Fee</span>
                    <span className="text-slate-900 font-bold">LKR 1,500</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic border-t pt-4">
                    * Final repair cost will be provided after physical diagnostic. Service fee is deductible from the total repair bill.
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid || (availabilityStatus && !availabilityStatus.available)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                  {formik.isSubmitting ? "BOOKING..." : "CONFIRM BOOKING"}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="w-full mt-3 py-4 text-slate-400 font-bold text-sm hover:text-slate-600"
                >
                  CANCEL
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointment;