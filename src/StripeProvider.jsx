import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

export default function StripeProvider({ children }) {
  if (!pk) {
    console.warn('VITE_STRIPE_PUBLISHABLE_KEY is missing. Rendering without Stripe.');
    return <>{children}</>;
  }
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
