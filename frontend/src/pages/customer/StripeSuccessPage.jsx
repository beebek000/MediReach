import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function StripeSuccessPage() {
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [status, setStatus] = useState('verifying');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('orderId');

    if (!sessionId || !orderId) {
      setStatus('failed');
      addToast('Missing Stripe payment details', 'error');
      return;
    }

    api.verifyStripe({ orderId, sessionId }, accessToken)
      .then(() => {
        setStatus('success');
        addToast('Payment verified successfully!');
      })
      .catch((err) => {
        setStatus('failed');
        addToast(err.message || 'Payment verification failed', 'error');
      });
  }, []);

  if (status === 'verifying') {
    return (
      <div className="max-w-md mx-auto text-center py-16 page-enter">
        <div className="text-5xl mb-4 animate-pulse">⏳</div>
        <h2 className="font-fraunces text-2xl font-semibold text-charcoal">Verifying payment…</h2>
        <p className="text-charcoal/60 mt-2">Please wait while we confirm your Stripe payment.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-16 page-enter">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-fraunces text-2xl font-semibold text-charcoal">Payment successful!</h2>
        <p className="text-charcoal/60 mt-2">Your card payment has been verified. Your order is being processed.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/customer/orders" className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark">
            View My Orders
          </Link>
          <Link to="/medicines" className="rounded-lg border border-primary text-primary px-6 py-2.5 font-medium hover:bg-primary/5">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-16 page-enter">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="font-fraunces text-2xl font-semibold text-charcoal">Payment verification failed</h2>
      <p className="text-charcoal/60 mt-2">We couldn't verify your Stripe payment yet. Please check your orders and try again.</p>
      <div className="flex gap-3 justify-center mt-6">
        <Link to="/customer/orders" className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark">
          View My Orders
        </Link>
        <Link to="/customer" className="rounded-lg border border-charcoal/20 text-charcoal px-6 py-2.5 font-medium hover:bg-charcoal/5">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
