import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

export default function EsewaSuccessPage() {
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const { fetchCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const data = searchParams.get('data');
    if (!data) {
      setError('No payment data received from eSewa.');
      setVerifying(false);
      return;
    }

    api.verifyEsewa(data, accessToken)
      .then((res) => {
        addToast('Payment verified successfully!', 'success');
        setOrderId(res.data?.orderId);
        fetchCart(); // Ensure cart is cleared
      })
      .catch((err) => {
        setError(err.message || 'Verification failed');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [searchParams, accessToken, addToast, fetchCart]);

  return (
    <div className="max-w-md mx-auto py-20 px-6 text-center page-enter">
      <div className="glass-morphism rounded-3xl p-8 border border-white/20 shadow-2xl">
        {verifying ? (
          <>
            <div className="flex items-center justify-center mb-6">
              <svg className="animate-spin h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <h1 className="font-fraunces text-3xl font-bold text-charcoal mb-2">Verifying Payment</h1>
            <p className="text-charcoal/60">Please wait while we confirm your transaction with eSewa...</p>
          </>
        ) : error ? (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h1 className="font-fraunces text-3xl font-bold text-charcoal mb-2">Verification Failed</h1>
            <p className="text-charcoal/60 mb-8">{error}</p>
            <div className="flex flex-col gap-3">
              <Link to="/customer/orders" className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg hover:shadow-primary/30 transition-all">
                Check My Orders
              </Link>
              <Link to="/" className="text-charcoal/40 text-sm hover:text-primary transition-colors">
                Back to Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h1 className="font-fraunces text-3xl font-bold text-charcoal mb-2">Payment Success!</h1>
            <p className="text-charcoal/60 mb-8">Thank you for your payment. Your order is now being processed.</p>
            <div className="flex flex-col gap-3">
              <Link 
                to={orderId ? `/customer/orders/${orderId}` : "/customer/orders"} 
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
              >
                View Order Details
              </Link>
              <Link to="/medicines" className="text-charcoal/40 text-sm hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
