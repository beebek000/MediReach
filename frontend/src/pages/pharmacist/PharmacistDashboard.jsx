import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';

export default function PharmacistDashboard() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ prescriptionsToVerify: 0, lowStockAlerts: 0, ordersToday: 0, revenueToday: 0 });
  const [pendingRx, setPendingRx] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPharmacistStats(accessToken)
      .then((res) => {
        setStats(res.data.stats);
        setPendingRx(res.data.pendingRx || []);
        setLowStock(res.data.lowStock || []);
      })
      .catch(() => addToast('Failed to load dashboard stats', 'error'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="space-y-8 page-enter">
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-6">
        <h2 className="font-fraunces text-xl font-semibold text-charcoal">Pharmacist Dashboard</h2>
        <p className="text-charcoal/70 mt-1">Verify prescriptions and manage inventory.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/pharmacist/verify" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Prescriptions to Verify" value={stats.prescriptionsToVerify} icon="📄" />
        </Link>
        <Link to="/pharmacist/inventory" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Low Stock Alerts" value={stats.lowStockAlerts} icon="⚠️" />
        </Link>
        <Link to="/pharmacist/orders" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Orders Today" value={stats.ordersToday} icon="📋" />
        </Link>
        <StatCard title="Revenue Today" value={`Rs. ${stats.revenueToday.toLocaleString()}`} icon="💰" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/10">
            <h3 className="font-fraunces font-semibold text-charcoal">Prescription verification queue</h3>
            <Link to="/pharmacist/verify" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-charcoal/5">
            {pendingRx.map((rx) => (
              <li key={rx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-charcoal">{rx.medicine}</p>
                  <p className="text-xs text-charcoal/60">Customer • {rx.date}</p>
                </div>
                <StatusBadge status={rx.status} />
              </li>
            ))}
            {pendingRx.length === 0 && (
              <li className="px-4 py-6 text-center text-charcoal/50 text-sm">No pending prescriptions.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/10">
            <h3 className="font-fraunces font-semibold text-charcoal">Inventory alerts</h3>
            <Link to="/pharmacist/inventory" className="text-sm text-primary font-medium hover:underline">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-charcoal/5">
            {lowStock.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3">
                <p className="font-medium text-charcoal">{m.name}</p>
                <span className="text-sm text-amber font-medium">Stock: {m.stock}</span>
              </li>
            ))}
            {lowStock.length === 0 && (
              <li className="px-4 py-6 text-center text-charcoal/50 text-sm">No low stock items.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
