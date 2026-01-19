import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api';

const PaymentPopup = ({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  orderData, 
  totalAmount,
  loading,
  setLoading 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      console.error('Stripe not ready');
      return;
    }

    setPaymentProcessing(true);
    
    try {
      // Create PaymentIntent
      const intentRes = await api.post('/payments/create-intent', {
        orderId: orderData._id,
      });

      const clientSecret = intentRes.data?.clientSecret;
      
      if (!clientSecret) {
        throw new Error('Failed to get client secret');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      // Confirm payment on backend
      const confirmRes = await api.post('/payments/confirm', {
        orderId: orderData._id,
        paymentIntentId: paymentIntent.id,
      });

      const confirmData = confirmRes.data;
      
      if (!confirmData?.success) {
        throw new Error(confirmData?.message || 'Payment could not be finalized');
      }

      // Show success animation
      setShowSuccess(true);
      cardElement?.clear();
      
      // Call success callback after animation
      setTimeout(() => {
        onPaymentSuccess(paymentIntent.id, orderData._id);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">Payment Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
            disabled={paymentProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showSuccess ? (
            // Success Animation
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your payment has been processed successfully.</p>
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                Secured by Stripe
              </div>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>LKR {orderData?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>LKR {orderData?.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>LKR {totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Card Information
                </label>
                <div className="border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 transition-colors">
                  <CardElement
                    options={{
                      hidePostalCode: true,
                      disableLink: true,
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                    onKeyDown={(e) => e?.preventDefault?.()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Test Card: 4242 4242 4242 4242 • Any future date • Any CVC
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Secure Payment</p>
                    <p>Your payment information is encrypted and processed securely by Stripe. We never store your card details.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing || loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;
