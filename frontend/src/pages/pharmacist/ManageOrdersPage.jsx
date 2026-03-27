import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ORDER_STATUSES } from '../../data/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

export default function ManageOrdersPage() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = statusFilter ? `status=${statusFilter}` : '';
    api.getAllOrders(params, accessToken)
      .then((res) => setOrders(res.data?.orders ?? []))
      .catch(() => addToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [accessToken, statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status: newStatus }, accessToken);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      addToast('Status updated');
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Manage orders</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !statusFilter ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                statusFilter === s ? 'bg-primary text-white' : 'bg-charcoal/10 text-charcoal'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-charcoal/60">Loading…</div>
      ) : (
        <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal/5 text-left">
                  <th className="px-4 py-3 font-medium text-charcoal">Order #</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Total</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Payment</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Date</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Status</th>
                  <th className="px-4 py-3 font-medium text-charcoal">Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-charcoal/5">
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3">Rs. {o.grandTotal}</td>
                    <td className="px-4 py-3 uppercase text-xs">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-charcoal/70">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="rounded border border-charcoal/20 px-2 py-1 text-xs focus:border-primary outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                      {o.status === 'shipped' && (
                        <Link
                          to={`/pharmacist/orders/${o.id}/track`}
                          className="ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <span className="text-sm">🛵</span> Track
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <div className="p-8 text-center text-charcoal/50">No orders found.</div>}
        </div>
      )}
    </div>
  );
}
