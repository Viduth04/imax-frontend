import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ArrowLeft, CheckCircle, Star, Award, 
  TrendingUp, ThumbsUp, Heart, Users2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedbackForm from '../components/feedback/FeedbackForm';

const FeedbackPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = () => {
    setSuccessMessage('Thank you for your valuable feedback! We appreciate you taking the time to help us improve our computer services.');
    setShowSuccess(true);
    
    // Smooth scroll to top to ensure user sees the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setShowSuccess(false);
    }, 8000);
  };

  const feedbackStats = [
    { icon: Star, label: 'Average Rating', value: '4.8/5' },
    { icon: Users2, label: 'Happy Customers', value: '2,500+' },
    { icon: TrendingUp, label: 'Satisfaction Rate', value: '96%' }
  ];

  const testimonials = [
    {
      name: 'Priya Perera',
      location: 'Colombo',
      rating: 5,
      comment: 'Excellent laptop repair service! Fixed my device within 2 hours.',
      service: 'Laptop Repair'
    },
    {
      name: 'Kamal Silva',
      location: 'Kandy',
      rating: 5,
      comment: 'Professional team and fair pricing. Highly recommended for PC builds.',
      service: 'PC Assembly'
    }
  ];

  const feedbackCategories = [
    { title: 'Service Quality', icon: Award, count: '1,250+ reviews' },
    { title: 'Technical Expertise', icon: Star, count: '980+ reviews' },
    { title: 'Customer Support', icon: Heart, count: '850+ reviews' }
  ];

  return (
    <div className="min-h-screen bg-blue-50/50 mt-16 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Service Feedback
              </h1>
              <p className="text-blue-600 font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Help us build a better tech experience in Sri Lanka
              </p>
            </div>
            
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2.5 text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 font-bold text-sm shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="container mx-auto px-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center shadow-sm">
            <div className="p-2 bg-emerald-500 rounded-lg mr-4">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-emerald-900 font-bold text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {feedbackStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-blue-100 flex items-center gap-4 group hover:border-blue-300 transition-colors">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                <stat.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <FeedbackForm onSuccess={handleSuccess} />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Analysis Areas</h3>
              <div className="space-y-3">
                {feedbackCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-transparent hover:border-blue-100 transition-all cursor-default">
                    <cat.icon className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{cat.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{cat.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Recent Stories</h3>
              <div className="space-y-4">
                {testimonials.length > 0 ? (
                  testimonials.map((t, i) => (
                    <div key={i} className="p-4 rounded-xl bg-blue-50/30 border border-blue-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-black text-slate-800">{t.name}</p>
                          <p className="text-[10px] text-slate-500">{t.location}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, starIdx) => (
                            <Star 
                              key={starIdx} 
                              className={`w-3 h-3 ${starIdx < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs italic text-slate-600 leading-relaxed mb-3">"{t.comment}"</p>
                      <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                        {t.service}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>

            {/* Impact Banner */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <ThumbsUp className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Sri Lanka Tech Excellence</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Your feedback isn't just a rating—it's the blueprint for our next service update.
                </p>
                <div className="space-y-2">
                  {['Service Reliability', 'Support Speed', 'Pricing Fair'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="uppercase tracking-tighter">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;