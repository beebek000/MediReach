import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LiveTrackingMap from '../../components/ui/LiveTrackingMap';
import Breadcrumb from '../../components/ui/Breadcrumb';
import api from '../../services/api';

export default function RiderTrackingPage() {
  const { id: orderId } = useParams();
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    api.getOrder(orderId, accessToken)
      .then((res) => {
        setOrder(res.data?.order ?? null);
      })
      .catch(() => addToast('Order not found', 'error'))
      .finally(() => setLoading(false));

    api.getOrderTracking(orderId, accessToken)
      .then((res) => setTracking(res.data?.tracking ?? null))
      .catch(() => {});
  }, [orderId, accessToken]);

  const handleLocationUpdate = useCallback(
    ({ lat, lng }) => {
      if (!orderId) return;
      api.updateDeliveryLocation(orderId, { lat, lng }, accessToken)
        .then(() => {
          addToast('Location updated successfully', 'success');
        })
        .catch((err) => {
          addToast(err.message || 'Failed to update location', 'error');
        });
    },
    [orderId, accessToken, addToast]
  );

  if (loading) {
    return <div className="page-enter py-12 text-center text-charcoal/60">Loading…</div>;
  }

  if (!order) {
    return (
      <div className="page-enter py-12 text-center">
        <p className="text-charcoal/60">Order not found.</p>
        <Link to="/pharmacist/orders" className="text-primary mt-2 inline-block underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <Breadcrumb
        items={[
          { to: '/pharmacist/dashboard', label: 'Dashboard' },
          { to: '/pharmacist/orders', label: 'Manage Orders' },
          { label: `Track Order #${order.orderNumber}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-fraunces text-2xl font-semibold text-charcoal">Update Rider Location</h2>
          <p className="text-charcoal/60 text-sm mt-1">Order #{order.orderNumber} • {order.shippingAddress}</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium">
          Rider Mode
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
            <span className="text-lg">💡</span>
            <p>
              <strong>Pharmacist Tip:</strong> Click anywhere on the map below to set the current GPS location of the delivery rider. This will update the customer's tracking view in real-time.
            </p>
          </div>

          <LiveTrackingMap
            orderId={orderId}
            orderStatus={order.status}
            deliveryLat={tracking?.deliveryLat ?? order.deliveryLat}
            deliveryLng={tracking?.deliveryLng ?? order.deliveryLng}
            destinationLat={tracking?.destinationLat ?? order.destinationLat}
            destinationLng={tracking?.destinationLng ?? order.destinationLng}
            shippingAddress={order.shippingAddress}
            onLocationUpdate={handleLocationUpdate}
            readOnly={false}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-charcoal/10 bg-white p-5 space-y-4">
            <h3 className="font-fraunces font-semibold text-charcoal border-b border-charcoal/5 pb-2">Delivery Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Status</span>
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Customer</span>
                <span className="font-medium text-right">{order.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Phone</span>
                <span className="font-medium">{order.shippingPhone}</span>
              </div>
              <div className="border-t border-charcoal/5 pt-3">
                <p className="text-charcoal/60 mb-1">Shipping Address</p>
                <p className="font-medium">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <Link
            to="/pharmacist/orders"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-charcoal/20 px-4 py-3 text-center font-medium text-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
