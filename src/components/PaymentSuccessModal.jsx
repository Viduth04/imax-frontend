import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Clock, Home, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  paymentRef, 
  orderData 
}) => {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after modal opens
      setTimeout(() => setShowAnimation(true), 100);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  const handleViewOrder = () => {
    navigate(`/orders/${orderId}`);
    onClose();
  };

  const handleContinueShopping = () => {
    navigate('/shop');
    onClose();
  };

  const handleGoHome = () => {
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Success Animation */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
          <div className="relative">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center transition-all duration-500 ${
              showAnimation ? 'scale-110' : 'scale-100'
            }`}>
              <CheckCircle className={`w-12 h-12 text-green-600 transition-all duration-500 ${
                showAnimation ? 'scale-110' : 'scale-100'
              }`} />
            </div>
            
            {/* Floating sparkles */}
            <div className={`absolute -top-2 -right-2 transition-all duration-700 ${
              showAnimation ? 'animate-bounce' : 'opacity-0'
            }`} style={{ animationDelay: '100ms' }}>
              <Sparkles className="w-8 h-8 text-yellow-400" fill="currentColor" />
            </div>
            <div className={`absolute -bottom-2 -left-2 transition-all duration-700 ${
              showAnimation ? 'animate-bounce' : 'opacity-0'
            }`} style={{ animationDelay: '200ms' }}>
              <Sparkles className="w-6 h-6 text-blue-400" fill="currentColor" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-green-100 text-lg">
            Order #{orderId?.slice(-8) || 'ORD' + Date.now()} has been confirmed
          </p>
          {paymentRef && (
            <p className="text-green-200 text-sm mt-2">
              Reference ID: <span className="font-mono break-all">{paymentRef}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Thank you message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              Thank you for your purchase! We've received your order and will process it shortly.
              {orderData?.shippingAddress && (
                <>
                  <br />
                  <span className="text-sm text-gray-500">
                    Delivery to: <b>{orderData.shippingAddress.address}</b>, {orderData.shippingAddress.city}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Order timeline */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-6 border border-blue-100">
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
                  <p className="font-semibold text-gray-900">Payment Confirmed</p>
                  <p className="text-sm text-gray-600">Your payment has been processed successfully</p>
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
                  <p className="text-sm text-gray-600">We're preparing your items for shipment</p>
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
                  <p className="text-sm text-gray-600">Your order will be shipped soon</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewOrder}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Package className="w-5 h-5 mr-2" />
              View Order Details
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleContinueShopping}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </button>
              <button
                onClick={handleGoHome}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;


