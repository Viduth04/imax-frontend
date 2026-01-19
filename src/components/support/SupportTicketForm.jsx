import React, { useState } from 'react';
import { useFormik } from 'formik';
import { supportTicketSchema } from '../../utils/validationSchemas';
import { Send, AlertCircle, Monitor, Cpu, HelpCircle, AlertTriangle, CreditCard } from 'lucide-react';
// Adjust the number of dots based on your folder depth
import api from '../../api';
import toast from 'react-hot-toast';

const SupportTicketForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    },
    validationSchema: supportTicketSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        // FIXED: Use the 'api' instance and relative path.
        // If you plan to support file uploads later, you would use formData here.
        // For now, sending the 'values' object is sufficient for text fields.
        const response = await api.post('/support-tickets', values);

        if (response.data.success) {
          toast.success('Support ticket created successfully!');
          resetForm();
          onSuccess?.();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create support ticket');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const categories = [
    { value: 'technical', label: 'Technical Issues', icon: Cpu, desc: 'Hardware problems, repairs, and upgrades' },
    { value: 'billing', label: 'Billing & Payments', icon: CreditCard, desc: 'Invoice inquiries and payment issues' },
    { value: 'equipment', label: 'Equipment Support', icon: Monitor, desc: 'Printers and peripherals troubleshooting' },
    { value: 'general', label: 'General Support', icon: HelpCircle, desc: 'Account assistance and general inquiries' },
    { value: 'complaint', label: 'Complaints', icon: AlertTriangle, desc: 'Report service dissatisfaction' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'from-slate-500 to-slate-600', textColor: 'text-slate-600', desc: 'General questions', badge: '24-48h' },
    { value: 'medium', label: 'Medium', color: 'from-yellow-500 to-orange-500', textColor: 'text-yellow-600', desc: 'Standard issues', badge: '4-24h' },
    { value: 'high', label: 'High', color: 'from-orange-500 to-red-500', textColor: 'text-orange-600', desc: 'Urgent issues', badge: '1-4h' },
    { value: 'urgent', label: 'Critical', color: 'from-red-500 to-red-700', textColor: 'text-red-600', desc: 'System down', badge: '< 1h' }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200/60">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Technical Support Request
          </h2>
          <p className="text-slate-600 mt-1">Get expert help with your technology issues</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-xl mr-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Quick Response Guarantee</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Our technicians respond within 2 hours during business hours. For faster resolution, 
              please include device models and error messages.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-3">
            Issue Summary *
          </label>
          <input
            type="text"
            id="subject"
            {...formik.getFieldProps('subject')}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 ${
              formik.touched.subject && formik.errors.subject
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Brief description (e.g., WiFi connection issues)"
          />
          {formik.touched.subject && formik.errors.subject && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.subject}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">
            Issue Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                  formik.values.category === cat.value
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={formik.values.category === cat.value}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    formik.values.category === cat.value
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 group-hover:bg-blue-100'
                  }`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-bold mb-1">{cat.label}</h3>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </label>
            ))}
          </div>
          {formik.touched.category && formik.errors.category && (
            <p className="mt-3 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.category}
            </p>
          )}
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4">
            Priority Level *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  formik.values.priority === priority.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formik.values.priority === priority.value}
                  onChange={formik.handleChange}
                  className="sr-only"
                />
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r mb-2 w-fit ${priority.color}`}>
                  {priority.badge}
                </span>
                <h4 className={`font-bold text-sm ${formik.values.priority === priority.value ? 'text-blue-900' : priority.textColor}`}>
                  {priority.label}
                </h4>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-3">
            Detailed Problem Description *
          </label>
          <textarea
            id="description"
            rows={6}
            {...formik.getFieldProps('description')}
            className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
              formik.touched.description && formik.errors.description
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
            placeholder="Please include: device model, when it started, and steps you've already tried."
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{formik.values.description.length}/2000 characters</span>
          </div>
          {formik.touched.description && formik.errors.description && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {formik.errors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="w-full flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg transform active:scale-[0.98]"
          >
            <Send className="w-5 h-5 mr-3" />
            {isSubmitting ? 'Creating Support Ticket...' : 'Submit Support Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportTicketForm;