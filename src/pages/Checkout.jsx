// ✅ src/pages/Checkout.jsx
import { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreditCard, MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import * as Yup from "yup";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import PaymentPopup from "../components/PaymentPopup";
import PaymentSuccessModal from "../components/PaymentSuccessModal";

/** If you already have ../api, replace this with `import api from "../api"` */
const api = axios.create({
  baseURL: "/api", // Vite proxy: /api -> http://localhost:5000
  withCredentials: true,
});

/* ===========================
   Sri Lankan validation rules
   =========================== */
// Allow Sinhala, Tamil, English letters and spaces only
const LETTERS_ONLY_RE = /^[\p{L}\s]+$/u;
// SL phone: 0XXXXXXXXX (10 digits) or +94XXXXXXXXX (country format -> 11 digits after +94)
const SL_PHONE_RE = /^(?:0\d{9}|\+94\d{9})$/;
// SL postal code: exactly 5 digits
const SL_POSTAL_RE = /^\d{5}$/;

// Yup schema (unchanged submit-level logic, but we’ll also run field-level below)
const validationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .matches(LETTERS_ONLY_RE, "Use letters and spaces only")
    .required("Full name is required"),
  phone: Yup.string()
    .trim()
    .matches(SL_PHONE_RE, "Use 0XXXXXXXXX or +94XXXXXXXXX")
    .required("Phone number is required"),
  address: Yup.string()
    .trim()
    .min(5, "Address is too short")
    .max(200, "Address is too long")
    .required("Address is required"),
  city: Yup.string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be under 50 characters")
    .matches(LETTERS_ONLY_RE, "Use letters and spaces only")
    .required("City is required"),
  postalCode: Yup.string()
    .trim()
    .matches(SL_POSTAL_RE, "Postal code must be 5 digits (e.g., 70100)")
    .required("Postal code is required"),
  country: Yup.string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be under 50 characters")
    .matches(LETTERS_ONLY_RE, "Use letters and spaces only")
    .required("Country is required"),
  paymentMethod: Yup.string()
    .oneOf(["credit-card", "debit-card", "paypal", "cash-on-delivery"])
    .required("Payment method is required"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();

  const stripe = useStripe();
  const elements = useElements();

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0),
    [items]
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

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
    country: "",
    paymentMethod: "",
    notes: "",
  });

  /** 🔒 Anti–double-submit guard */
  const isProcessingRef = useRef(false);

  /* ------------------------------
     Live field-level validation
     ------------------------------ */
  const validateField = async (name, value) => {
    try {
      // validate only the single field using Yup
      await Yup.reach(validationSchema, name).validate(value);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return true;
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
      return false;
    }
  };

  /* ------------------------------
     Change handlers (with SL rules)
     ------------------------------ */
  const onChange = (e) => {
    const { name, value } = e.target;

    // soft sanitation by field:
    let next = value;

    if (name === "fullName" || name === "city" || name === "country") {
      // keep letters/spaces only (softly – we don’t delete, we just validate)
      // no transform here to avoid surprising the user while typing
    }

    if (name === "phone") {
      // Allow `+` only at the start; otherwise digits only
      next = next.replace(/[^\d+]/g, "");
      if (next.startsWith("+")) {
        next = "+" + next.slice(1).replace(/\D/g, "");
      } else {
        next = next.replace(/\D/g, "");
      }
    }

    if (name === "postalCode") {
      // digits only, max 5
      next = next.replace(/\D/g, "").slice(0, 5);
    }

    setForm((prev) => ({ ...prev, [name]: next }));

    // validate as they type (optional but requested)
    validateField(name, next);
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  /** 🧾 Submit only when the button is used */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block any accidental submits (Enter, autofill, double clicks)
    if (isProcessingRef.current || loading) return;
    isProcessingRef.current = true;
    setLoading(true);

    try {
      if (items.length === 0) throw new Error("Your cart is empty.");

      // full-form validation
      await validationSchema.validate(form, { abortEarly: false });

      // 1) Create order (unpaid)
      const { data } = await api.post("/orders", {
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });

      const newOrder = data?.order;
      if (!newOrder) throw new Error("Order was not created");

      // 2) COD
      if (form.paymentMethod === "cash-on-delivery") {
        setPaymentRef(`COD-${String(newOrder._id).slice(-6).toUpperCase()}`);
        setOrderId(newOrder._id);
        setOrderSuccess(true);
        toast.success("Order placed (Cash on Delivery)");
        await clearCart();
        return;
      }

      // 3) PayPal (not integrated)
      if (form.paymentMethod === "paypal") {
        toast.error("PayPal is not integrated. Please use Card or COD.");
        return;
      }

      // 4) Stripe Card - open popup
      if (form.paymentMethod === "credit-card" || form.paymentMethod === "debit-card") {
        setCurrentOrder(newOrder);
        setShowPaymentPopup(true);
        return;
      }
    } catch (err) {
      if (err?.name === "ValidationError") {
        const map = {};
        err.inner.forEach((e) => (map[e.path] = e.message));
        setErrors(map);
        toast.error("Please fix the highlighted fields");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          (err?.response?.status ? `Request failed: ${err.response.status}` : "Network error");
        toast.error(msg);
        console.error(err);
      }
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  // Handle payment success from popup
  const handlePaymentSuccess = async (paymentRefId, orderId) => {
    setPaymentRef(paymentRefId);
    setOrderId(orderId);
    setShowSuccessModal(true);
    await clearCart();
    toast.success("Payment successful!");
  };

  /** 🛑 absolutely prevent Enter from submitting anywhere in the form */
  const blockEnterSubmit = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 mt-16">
        <div className="bg-[#1A1A1A] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-gray-300">Complete your order</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Link to="/cart" className="flex items-center text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Cart
          </Link>

          <div className="bg-white border rounded-2xl p-8 text-center">
            <p className="text-lg">Your cart is empty.</p>
            <Link
              to="/shop"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Go to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center mt-16">
        <div className="max-w-md w-full mx-4 bg-white shadow-xl rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Payment Successful</h2>
          {paymentRef && (
            <p className="text-sm text-emerald-700 mb-4">
              Reference ID: <span className="font-mono break-all">{paymentRef}</span>
            </p>
          )}
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Order Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-16">
      <div className="bg-[#1A1A1A] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-300">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Cart
        </button>

        <form onSubmit={handleSubmit} onKeyDownCapture={blockEnterSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" /> Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["fullName", "phone", "postalCode", "address", "city", "country"].map((field) => (
                    <div key={field} className={field === "address" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-semibold mb-2 capitalize">
                        {field.replace(/([A-Z])/g, " $1")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={form[field]}
                        onChange={onChange}
                        onBlur={onBlur}
                        inputMode={
                          field === "phone" || field === "postalCode" ? "numeric" : "text"
                        }
                        pattern={field === "postalCode" ? "\\d{5}" : undefined}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 ${
                          errors[field]
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300 focus:ring-blue-500"
                        }`}
                        placeholder={
                          field === "phone"
                            ? "0XXXXXXXXX or +94XXXXXXXXX"
                            : field === "postalCode"
                            ? "70100"
                            : undefined
                        }
                      />
                      {errors[field] && (
                        <p className="text-sm text-red-600 mt-1">⚠ {errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-blue-600" /> Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    { value: "credit-card", label: "Credit Card 💳" },
                    { value: "debit-card", label: "Debit Card 💳" },
                    { value: "paypal", label: "PayPal 🅿️" },
                    { value: "cash-on-delivery", label: "Cash on Delivery 💵" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer ${
                        form.paymentMethod === m.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={m.value}
                        checked={form.paymentMethod === m.value}
                        onChange={onChange}
                        className="w-5 h-5"
                      />
                      <span className="ml-3 font-semibold">{m.label}</span>
                    </label>
                  ))}
                </div>

                {(form.paymentMethod === "credit-card" ||
                  form.paymentMethod === "debit-card") && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center text-blue-800">
                      <CreditCard className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Card Payment Selected</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Click "Create Payment" to proceed with secure card payment
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <p className="text-slate-700">Subtotal: LKR {subtotal.toFixed(2)}</p>
              <p className="text-slate-700">
                Shipping: {shipping === 0 ? "FREE" : `LKR ${shipping.toFixed(2)}`}
              </p>
              <p className="font-bold text-lg mt-3">Total: LKR {total.toFixed(2)}</p>

              <button
                type="submit"
                disabled={loading || !form.paymentMethod}
                className="w-full mt-6 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : form.paymentMethod === "credit-card" || form.paymentMethod === "debit-card"
                  ? "Create Payment"
                  : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        onPaymentSuccess={handlePaymentSuccess}
        orderData={currentOrder}
        totalAmount={total}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Payment Success Modal */}
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
