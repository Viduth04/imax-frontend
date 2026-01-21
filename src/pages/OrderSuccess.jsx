// ✅ src/pages/OrderSuccess.jsx - Modern UI Edition
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle, Package, Truck, Clock, ArrowRight,
  Home, ShoppingBag, Sparkles, Loader2, Mail, Star,
  Shield, Heart, Zap
} from "lucide-react";

// Modern Loading Overlay with Glassmorphism
const PageOverlay = ({ show = false, text = "Loading…" }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-xl"></div>
      <div className="relative z-10 flex items-center gap-4 rounded-2xl bg-white/90 backdrop-blur-md px-8 py-6 shadow-2xl border border-white/20">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-blue-400/30"></div>
        </div>
        <span className="text-lg font-semibold text-slate-800">{text}</span>
      </div>
    </div>
  );
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [routing, setRouting] = useState(false);

  // 🛡️ Safety: Fallback if user accesses page directly without checkout state
  const { orderId, paymentRef, orderData } = location.state || {};
  
  useEffect(() => {
    if (!location.state) {
      // Redirect to home if no order info is present (prevents ghost success pages)
      const timer = setTimeout(() => navigate('/'), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const orderNumber = orderId || "ORD" + Math.floor(Math.random() * 1000000);

  const handleNavigate = (path) => {
    setRouting(true);
    // Ensure the loader state renders before the heavy navigation task begins
    setTimeout(() => navigate(path), 100);
  };

  if (!location.state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_70%)]"></div>
        <div className="relative z-10">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25 mx-auto">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Processing your session...</h2>
          <p className="text-slate-300 text-lg">Redirecting to home if no order data is found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <PageOverlay show={routing} text="Redirecting…" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-2xl animate-ping" style={{animationDelay: '2s'}}></div>
      </div>

      <style>
        {`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); } }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-glow { animation: glow 2s ease-in-out infinite; }
          .animate-slide-in-up { animation: slideInUp 0.8s ease-out forwards; }
        `}
      </style>

      <div className="max-w-3xl w-full z-10 animate-slide-in-up">
        {/* Modern Success Icon Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block animate-float">
            {/* Animated Rings */}
            <div className="absolute inset-0 animate-ping bg-green-400/20 rounded-full" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-0 animate-ping bg-blue-400/10 rounded-full" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
            <div className="absolute inset-0 animate-ping bg-purple-400/10 rounded-full" style={{animationDuration: '5s', animationDelay: '2s'}}></div>

            {/* Main Success Icon */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25 animate-glow">
              <CheckCircle className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={2.5} />
            </div>

            {/* Floating Elements */}
            <Sparkles className="absolute -top-3 -right-3 w-10 h-10 text-yellow-400 animate-bounce" />
            <Star className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400 animate-pulse" />
            <Heart className="absolute top-4 -left-4 w-5 h-5 text-pink-400 animate-ping" style={{animationDelay: '1.5s'}} />
          </div>

          {/* Success Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-semibold text-sm">Order Confirmed Successfully!</span>
          </div>
        </div>

        {/* Modern Success Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-8 py-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Order Confirmed! 🎉
              </h1>
              <p className="text-slate-300 font-medium text-lg">
                Order <span className="text-green-400 font-bold text-xl">#{orderNumber}</span> is officially on our radar.
              </p>
            </div>
          </div>

          <div className="p-8 lg:p-10">
            {/* Enhanced Thank You Message */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl mb-6">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-semibold">Confirmation Email Sent</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Thank you for your purchase! A confirmation email has been sent to{" "}
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{orderData?.userEmail || "your inbox"}</span>.
              </p>
              <p className="text-slate-500 text-sm">
                Your order is being processed and you can track its progress below.
              </p>
            </div>

            {/* Enhanced Steps Timeline */}
            <div className="space-y-4 mb-12">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Order Progress</h3>

              <ModernTimelineItem
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                title="Payment Received"
                desc={paymentRef ? `Reference: ${paymentRef}` : "Payment verified successfully"}
                status="Completed"
                active
                color="green"
              />
              <ModernTimelineItem
                icon={<Package className="w-6 h-6 text-blue-600" />}
                title="Preparing Package"
                desc="Items are being quality checked and carefully packed"
                status="In Progress"
                processing
                color="blue"
              />
              <ModernTimelineItem
                icon={<Truck className="w-6 h-6 text-slate-400" />}
                title="Shipping"
                desc={`Fast delivery to ${orderData?.shippingAddress?.city || 'your location'}`}
                status="Pending"
                color="slate"
              />
            </div>

            {/* Modern Action Buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => handleNavigate("/my-orders")}
                disabled={routing}
                className="group relative overflow-hidden flex items-center justify-center gap-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <ShoppingBag className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Track Order</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
              </button>

              <button
                onClick={() => handleNavigate("/shop")}
                disabled={routing}
                className="group relative overflow-hidden flex items-center justify-center gap-3 w-full bg-white/90 backdrop-blur-sm text-slate-700 py-5 rounded-2xl font-bold text-lg hover:bg-white transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:scale-105 border border-white/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/0 via-slate-50/50 to-slate-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Home className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Continue Shopping</span>
                <Sparkles className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Support Section */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="text-slate-700 font-semibold text-sm">Need assistance?</p>
              <a href="mailto:support@imaxcomputers.lk" className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors">
                Contact our support team
              </a>
            </div>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Timeline Item Component
const ModernTimelineItem = ({ icon, title, desc, status, active = false, processing = false, color = "slate" }) => {
  const colorClasses = {
    green: {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      shadow: "shadow-green-500/25",
      badge: "bg-green-100 text-green-700",
      ring: "ring-green-500/20"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/25",
      badge: "bg-blue-100 text-blue-700",
      ring: "ring-blue-500/20"
    },
    slate: {
      bg: "bg-gradient-to-br from-slate-400 to-slate-500",
      shadow: "shadow-slate-500/25",
      badge: "bg-slate-100 text-slate-600",
      ring: "ring-slate-500/20"
    }
  };

  const classes = colorClasses[color];

  return (
    <div className="relative flex items-start gap-6 group">
      {/* Connection Line */}
      <div className="absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-slate-200 to-slate-100"></div>

      {/* Icon Container */}
      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${classes.bg} ${classes.shadow} ${
        processing ? `ring-4 ${classes.ring} animate-pulse` : ''
      }`}>
        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="relative z-10">
          {icon}
        </div>
        {active && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-bounce"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900 text-lg">{title}</h4>
            <span className={`text-xs uppercase tracking-widest font-black px-3 py-1.5 rounded-full ${classes.badge} ${
              processing ? 'animate-pulse' : ''
            }`}>
              {status}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{desc}</p>

          {/* Progress Indicator */}
          {processing && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <span className="text-xs text-blue-600 font-medium">60% Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;