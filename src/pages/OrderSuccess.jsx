// ✅ src/pages/OrderSuccess.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  ArrowRight,
  Home,
  ShoppingBag,
  Sparkles,
  Loader2,
} from "lucide-react";

const PageOverlay = ({ show = false, text = "Loading…" }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-700">{text}</span>
      </div>
    </div>
  );
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🧾 get details passed from Checkout
  const { orderId, paymentRef, orderData } = location.state || {};
  const orderNumber = orderId || "ORD" + Date.now();

  const [routing, setRouting] = useState(false);

  const handleNavigate = (path) => {
    setRouting(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        navigate(path);
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      {/* overlay loader */}
      <PageOverlay show={routing} text="Redirecting…" />

      {/* local CSS animations */}
      <style>
        {`
          @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
          @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.1; } }
          @keyframes bounce {
            0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
            50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
          }
          .animate-ping-custom { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
          .animate-pulse-custom { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .animate-bounce-custom { animation: bounce 1s infinite; }
        `}
      </style>

      <div className="max-w-2xl w-full">
        {/* success icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-ping-custom">
              <div className="w-32 h-32 bg-green-400 rounded-full opacity-20"></div>
            </div>
            <div
              className="absolute inset-0 animate-pulse-custom"
              style={{ animationDelay: "75ms" }}
            >
              <div className="w-32 h-32 bg-blue-400 rounded-full opacity-20"></div>
            </div>

            <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
            </div>

            <div
              className="absolute -top-2 -right-2 animate-bounce-custom"
              style={{ animationDelay: "100ms" }}
            >
              <Sparkles className="w-8 h-8 text-yellow-400" fill="currentColor" />
            </div>
            <div
              className="absolute -bottom-2 -left-2 animate-bounce-custom"
              style={{ animationDelay: "200ms" }}
            >
              <Sparkles className="w-6 h-6 text-blue-400" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* main card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
            <h1 className="text-4xl font-black text-white mb-2">
              Payment Successful! 🎉
            </h1>
            <p className="text-green-100 text-lg">
              Order #{orderNumber} has been confirmed and is being processed
            </p>
            {paymentRef && (
              <p className="text-green-200 text-sm mt-2">
                Reference ID:{" "}
                <span className="font-mono break-all">{paymentRef}</span>
              </p>
            )}
          </div>

          <div className="p-8">
            {/* thank you */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Thank you for shopping with us! We've received your order and will
                process it shortly.
                {orderData?.shippingAddress && (
                  <>
                    <br />
                    Your order will be delivered to{" "}
                    <b>{orderData.shippingAddress.address}</b>,{" "}
                    {orderData.shippingAddress.city}.
                  </>
                )}
              </p>
            </div>

            {/* timeline */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <span>What happens next?</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-600">
                      We've received your order
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    Done
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 text-blue-700" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-gray-900">Processing</p>
                    <p className="text-sm text-gray-600">
                      We're preparing your items
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold animate-pulse">
                    Next
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow">
                    <Truck className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-gray-900">On the Way</p>
                    <p className="text-sm text-gray-600">
                      Your order will be shipped soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Estimated Delivery
                  </p>
                  <p className="font-bold text-blue-900">3-5 Business Days</p>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                    Shipping
                  </p>
                  <p className="font-bold text-green-900">Free Delivery</p>
                </div>
              </div>
            </div>

            {/* email notice */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mt-1">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Order confirmation sent!
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We've sent a confirmation email with your order details.
                    Please check your inbox.
                  </p>
                </div>
              </div>
            </div>

            {/* buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigate("/my-orders")}
                disabled={routing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {routing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>{routing ? "Opening My Orders…" : "View My Orders"}</span>
                {!routing && <ArrowRight className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleNavigate("/shop")}
                disabled={routing}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:border-blue-300 hover:bg-blue-50 font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {routing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Home className="w-5 h-5" />
                )}
                <span>{routing ? "Opening Shop…" : "Continue Shopping"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* footer support */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-2xl shadow-lg px-6 py-4 border border-blue-100">
            <p className="text-sm text-gray-600">
              Need help? Contact{" "}
              <a
                href="mailto:support@greengrow.lk"
                className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
              >
                support@greengrow.lk
              </a>
            </p>
          </div>
        </div>

        {/* subtle background elements */}
        <div className="fixed top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse-custom pointer-events-none"></div>
        <div
          className="fixed bottom-10 right-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse-custom pointer-events-none"
          style={{ animationDelay: "150ms" }}
        ></div>
      </div>
    </div>
  );
};

export default OrderSuccess;
