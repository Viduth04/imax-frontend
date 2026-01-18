// ✅ src/pages/OrderSuccess.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle, Package, Truck, Clock, ArrowRight,
  Home, ShoppingBag, Sparkles, Loader2, Mail
} from "lucide-react";

// Helper for loading overlay
const PageOverlay = ({ show = false, text = "Loading…" }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-xl border border-slate-100">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-700">{text}</span>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-bold">Processing your session...</h2>
        <p className="text-gray-500">Redirecting to home if no order data is found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <PageOverlay show={routing} text="Redirecting…" />

      <style>
        {`
          @keyframes ping-slow { 75%, 100% { transform: scale(1.5); opacity: 0; } }
          .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        `}
      </style>

      <div className="max-w-2xl w-full z-10">
        {/* Success Icon Header */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-ping-slow bg-green-400 rounded-full opacity-20"></div>
            <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
        </div>

        {/* Main Success Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white/50 overflow-hidden">
          <div className="bg-slate-900 px-8 py-8 text-center text-white">
            <h1 className="text-3xl font-black mb-2 tracking-tight">Order Confirmed! 🎉</h1>
            <p className="text-slate-400 font-medium">
              Order <span className="text-green-400">#{orderNumber}</span> is officially on our radar.
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center">
              <p className="text-slate-600 leading-relaxed">
                Thank you for your purchase! A confirmation email has been sent to{" "}
                <span className="font-bold text-slate-800">{orderData?.userEmail || "your inbox"}</span>.
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-6 mb-10">
              <TimelineItem 
                icon={<CheckCircle className="w-5 h-5 text-white" />} 
                title="Payment Received" 
                desc={paymentRef ? `Ref: ${paymentRef}` : "Verified successfully"}
                status="Done"
                active
              />
              <TimelineItem 
                icon={<Package className="w-5 h-5 text-blue-600" />} 
                title="Preparing Package" 
                desc="Items are being quality checked and packed"
                status="Next"
                processing
              />
              <TimelineItem 
                icon={<Truck className="w-5 h-5 text-slate-400" />} 
                title="Shipping" 
                desc={`Delivery to ${orderData?.shippingAddress?.city || 'your address'}`}
                status="Pending"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid gap-4">
              <button
                onClick={() => handleNavigate("/my-orders")}
                disabled={routing}
                className="group flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <ShoppingBag className="w-5 h-5" />
                Track Order
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => handleNavigate("/shop")}
                disabled={routing}
                className="flex items-center justify-center gap-3 w-full bg-slate-50 text-slate-700 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all border border-slate-200"
              >
                <Home className="w-5 h-5" />
                Back to Shop
              </button>
            </div>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Need assistance? <a href="mailto:support@greengrow.lk" className="text-blue-600 font-bold hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

// Sub-component for Timeline Items
const TimelineItem = ({ icon, title, desc, status, active = false, processing = false }) => (
  <div className="flex items-start gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
      active ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-slate-100'
    } ${processing ? 'bg-blue-100 ring-4 ring-blue-50' : ''}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900">{title}</h4>
        <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${
          active ? 'bg-green-100 text-green-700' : 
          processing ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-400'
        }`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  </div>
);

export default OrderSuccess;