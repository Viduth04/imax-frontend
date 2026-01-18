import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();

  // useMemo prevents recalculating on every re-render unless cart items change
  const cartSummary = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, shipping: 0, total: 0 };

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const shippingThreshold = 10000;
    const shipping = (subtotal >= shippingThreshold || subtotal === 0) ? 0 : 450;
    const total = subtotal + shipping;

    return { subtotal, shipping, total, shippingThreshold };
  }, [cart]);

  const handleQuantityChange = async (productId, currentQuantity, delta, maxStock) => {
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity > maxStock && delta > 0) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    if (newQuantity >= 1) {
      try {
        await updateCartItem(productId, newQuantity);
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
      toast.success("Item removed");
    }
  };

  // Loading State
  if (!cart || (loading && !cart.items)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Syncing your cart...</p>
      </div>
    );
  }

  // Empty State
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 mt-16 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Add some high-quality hardware to get started with your repairs.</p>
            <button
              onClick={() => navigate('/shop')}
              className="w-full flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Explore Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
              Checkout Cart
            </h1>
            <p className="text-slate-500 mt-1">Review your {cart.items.length} items before proceeding</p>
          </div>
          <button
            onClick={() => { if(window.confirm('Clear everything?')) clearCart() }}
            className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear All
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* List of Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <div key={item.product?._id} className="group bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 relative">
                <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-product.png'}
                    alt={item.product?.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.product?.name}</h3>
                      <button 
                        onClick={() => handleRemove(item.product?._id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">{item.product?.brand}</p>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
                      <button
                        onClick={() => handleQuantityChange(item.product?._id, item.quantity, -1, item.product?.quantity)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1 || loading}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-slate-900 w-10 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product?._id, item.quantity, 1, item.product?.quantity)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                        disabled={item.quantity >= (item.product?.quantity || 99) || loading}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-slate-400 line-through">LKR {(item.product?.price * 1.1).toFixed(0)}</p>
                      <p className="text-xl font-black text-slate-900">LKR {(item.product?.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">LKR {cartSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Shipping</span>
                  <span className={cartSummary.shipping === 0 ? "text-green-600 font-bold" : "text-slate-900 font-bold"}>
                    {cartSummary.shipping === 0 ? 'FREE' : `LKR ${cartSummary.shipping}`}
                  </span>
                </div>

                {/* Free Shipping Progress */}
                {cartSummary.subtotal < cartSummary.shippingThreshold && (
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mt-4">
                    <div className="flex items-center text-blue-700 text-xs font-bold mb-2">
                      <Info className="w-3.5 h-3.5 mr-1.5" />
                      FREE SHIPPING GOAL
                    </div>
                    <div className="h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500" 
                        style={{ width: `${(cartSummary.subtotal / cartSummary.shippingThreshold) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-2 text-center uppercase font-bold tracking-tighter">
                      Add LKR {(cartSummary.shippingThreshold - cartSummary.subtotal).toLocaleString()} more for free delivery
                    </p>
                  </div>
                )}

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-slate-900 font-bold text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600">LKR {cartSummary.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                disabled={loading || cart.items.length === 0}
                className="w-full mt-8 flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                Checkout Now
                <ArrowRight className="w-6 h-6 ml-2" />
              </button>

              <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">
                Secure 256-bit SSL encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;