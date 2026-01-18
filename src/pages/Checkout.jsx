import { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, MapPin, ArrowLeft, CheckCircle, ShieldCheck, Truck, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import * as Yup from "yup";
import axios from "axios";
import PaymentPopup from "../components/PaymentPopup";
import PaymentSuccessModal from "../components/PaymentSuccessModal";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/* Validation Constants */
const LETTERS_ONLY_RE = /^[\p{L}\s]+$/u;
const SL_PHONE_RE = /^(?:0\d{9}|\+94\d{9})$/;
const SL_POSTAL_RE = /^\d{5}$/;

const validationSchema = Yup.object({
  fullName: Yup.string().trim().min(2).max(100).matches(LETTERS_ONLY_RE, "Use letters only").required("Required"),
  phone: Yup.string().trim().matches(SL_PHONE_RE, "Invalid SL format").required("Required"),
  address: Yup.string().trim().min(5).required("Required"),
  city: Yup.string().trim().matches(LETTERS_ONLY_RE, "Use letters only").required("Required"),
  postalCode: Yup.string().trim().matches(SL_POSTAL_RE, "Must be 5 digits").required("Required"),
  country: Yup.string().required("Required"),
  paymentMethod: Yup.string().required("Select a payment method"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const isProcessingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [errors, setErrors] = useState({});
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
    paymentMethod: "",
    notes: "",
  });

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0), [items]);
  const shipping = subtotal > 10000 ? 0 : 450;
  const total = subtotal + shipping;

  const onChange = async (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "phone") nextValue = value.replace(/[^\d+]/g, "");
    if (name === "postalCode") nextValue = value.replace(/\D/g, "").slice(0, 5);

    setForm(prev => ({ ...prev, [name]: nextValue }));
    
    // Live individual field validation
    try {
      await Yup.reach(validationSchema, name).validate(nextValue);
      setErrors(prev => { const n = {...prev}; delete n[name]; return n; });
    } catch (err) {
      setErrors(prev => ({ ...prev, [name]: err.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessingRef.current || loading) return;

    try {
      setLoading(true);
      isProcessingRef.current = true;
      await validationSchema.validate(form, { abortEarly: false });

      const { data } = await api.post("/orders", {
        shippingAddress: form,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });

      const newOrder = data?.order;
      if (form.paymentMethod === "cash-on-delivery") {
        setPaymentRef(`COD-${String(newOrder._id).slice(-6).toUpperCase()}`);
        setOrderId(newOrder._id);
        setOrderSuccess(true);
        await clearCart();
      } else {
        setCurrentOrder(newOrder);
        setShowPaymentPopup(true);
      }
    } catch (err) {
      if (err.inner) {
        const map = {};
        err.inner.forEach(e => map[e.path] = e.message);
        setErrors(map);
        toast.error("Please check the form fields");
      } else {
        toast.error(err.response?.data?.message || "Order failed");
      }
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/cart")} className="flex items-center text-slate-500 hover:text-slate-900 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Cart
          </button>
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span className="text-blue-600">Cart</span>
            <span className="w-8 h-[2px] bg-slate-200"></span>
            <span className="text-blue-600">Checkout</span>
            <span className="w-8 h-[2px] bg-slate-200"></span>
            <span>Success</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Delivery Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { id: "fullName", label: "Full Name", placeholder: "e.g. Kamal Perera" },
                  { id: "phone", label: "Phone Number", placeholder: "077 123 4567" },
                  { id: "address", label: "Street Address", full: true },
                  { id: "city", label: "City" },
                  { id: "postalCode", label: "Postal Code", placeholder: "70100" }
                ].map((input) => (
                  <div key={input.id} className={input.full ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{input.label}</label>
                    <input
                      type="text"
                      name={input.id}
                      value={form[input.id]}
                      onChange={onChange}
                      placeholder={input.placeholder}
                      className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border transition-all outline-none focus:ring-4 ${
                        errors[input.id] ? "border-red-200 focus:ring-red-50" : "border-slate-100 focus:border-blue-500 focus:ring-blue-50"
                      }`}
                    />
                    {errors[input.id] && <p className="text-red-500 text-xs mt-2 font-bold italic">{errors[input.id]}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-4">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "credit-card", label: "Card Payment", desc: "Visa, Mastercard, AMEX" },
                  { id: "cash-on-delivery", label: "Cash on Delivery", desc: "Pay when you receive" }
                ].map((method) => (
                  <label key={method.id} className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    form.paymentMethod === method.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}>
                    <input type="radio" name="paymentMethod" value={method.id} onChange={onChange} className="absolute top-4 right-4 w-5 h-5 accent-blue-600" />
                    <span className="font-bold text-slate-900">{method.label}</span>
                    <span className="text-xs text-slate-500 mt-1">{method.desc}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 sticky top-28">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-blue-400" /> Order Summary
              </h3>
              
              <div className="space-y-4 border-b border-white/10 pb-6 mb-6 text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className={shipping === 0 ? "text-emerald-400" : "text-white"}>
                    {shipping === 0 ? "FREE" : `LKR ${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Payable</span>
                <span className="text-3xl font-black text-white">LKR {total.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading || !form.paymentMethod}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
              >
                {loading ? "PROCESSING..." : form.paymentMethod === "cash-on-delivery" ? "CONFIRM ORDER" : "GO TO PAYMENT"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 opacity-50">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4 items-center">
              <Truck className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-800 font-medium">
                Estimated delivery within <span className="font-bold">2-4 business days</span> for island-wide shipping.
              </p>
            </div>
          </div>
        </form>
      </div>

      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        onPaymentSuccess={handlePaymentSuccess}
        orderData={currentOrder}
        totalAmount={total}
        loading={loading}
        setLoading={setLoading}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={orderId}
        paymentRef={paymentRef}
        orderData={currentOrder}
      />
    </div>
  );
};

export default Checkout;