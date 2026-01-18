import React, { useState } from 'react';
import { Monitor, ArrowLeft, CheckCircle, Settings, MessageSquare, HardDrive, Phone, Clock, Users, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SupportTicketForm from '../components/support/SupportTicketForm';

const SupportPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = () => {
    setSuccessMessage('Your support ticket has been created successfully! Our technical team will respond within 2 hours during business hours.');
    setShowSuccess(true);
    
    // Smooth scroll to top to see the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setShowSuccess(false);
    }, 6000);
  };

  // Fixed: Use full class names so Tailwind can purge/build them correctly
  const quickActions = [
    {
      title: 'Live Chat Support',
      description: 'Chat with our technical experts in real-time',
      icon: MessageSquare,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      action: 'Start Chat'
    },
    {
      title: 'Remote Assistance',
      description: 'Get remote computer assistance and troubleshooting',
      icon: Monitor,
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      action: 'Request Access'
    },
    {
      title: 'Knowledge Base',
      description: 'Browse our comprehensive technical documentation',
      icon: HardDrive,
      bgColor: 'bg-blue-700',
      textColor: 'text-blue-700',
      action: 'Browse FAQ'
    }
  ];

  const supportStats = [
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: '< 2 Hours',
      iconBg: 'bg-blue-500'
    },
    {
      icon: Users,
      label: 'Expert Technicians',
      value: '25+ Team',
      iconBg: 'bg-blue-600'
    },
    {
      icon: Shield,
      label: 'Resolution Rate',
      value: '98.5%',
      iconBg: 'bg-blue-700'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 mt-16 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Technical <span className="text-blue-600">Support</span>
              </h1>
              <p className="text-slate-500 mt-2 text-base max-w-xl">
                Experience world-class technical assistance. From hardware diagnostics to software troubleshooting, our experts have you covered.
              </p>
            </div>
            
            <Link 
              to="/"
              className="flex items-center px-5 py-2.5 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 border border-slate-200 hover:border-blue-200 shadow-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Notification */}
        {showSuccess && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center shadow-sm">
              <div className="p-2 bg-green-500 rounded-xl mr-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-900">Ticket Received</p>
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {supportStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center space-x-4">
                <div className={`p-4 ${stat.iconBg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Support Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900">Open a Support Ticket</h2>
                </div>
                <SupportTicketForm onSuccess={handleSuccess} />
              </div>
            </div>

            {/* Common FAQ Shortcut (New) */}
            <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Need a quick answer?</h3>
                  <p className="text-slate-400 mb-6 max-w-md">Our knowledge base contains over 500+ articles covering common hardware and software issues.</p>
                  <button className="flex items-center font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    Visit Knowledge Base <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
               </div>
               <Settings className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Direct Channels</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="group border border-slate-100 bg-slate-50/50 rounded-2xl p-5 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${action.bgColor} rounded-xl shadow-lg shadow-blue-200`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 mb-4 leading-relaxed">
                          {action.description}
                        </p>
                        <button className={`w-full py-2.5 text-sm bg-white border border-slate-200 ${action.textColor} hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-xl font-bold transition-all`}>
                          {action.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-xl shadow-blue-200 p-8 text-white relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl inline-block mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Priority Line</h3>
                <p className="text-blue-100/80 mb-6 text-sm">
                  Available for Enterprise clients and critical hardware failures.
                </p>
                <a 
                  href="tel:+94112345678"
                  className="block w-full px-4 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all text-center shadow-lg"
                >
                  +94 11 234 5678
                </a>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Service Hours */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Operations
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Weekdays</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-lg text-xs">8AM - 6PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Saturday</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-3 py-1 rounded-lg text-xs">9AM - 4PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Sunday</span>
                  <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg text-xs">Emergency Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;