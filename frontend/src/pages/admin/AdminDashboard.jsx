import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';

export default function AdminDashboard() {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, ordersToday: 0, medicinesListed: 0, activePharmacists: 0, pendingPrescriptions: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats(accessToken)
      .then((res) => {
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
      })
      .catch(() => addToast('Failed to load dashboard stats', 'error'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="space-y-8 page-enter">
      <div className="rounded-2xl bg-gradient-to-r from-charcoal to-charcoal/90 text-cream p-6">
        <h2 className="font-fraunces text-xl font-semibold">Admin Dashboard</h2>
        <p className="text-cream/70 mt-1">Overview of platform metrics.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/users" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" />
        </Link>
        <Link to="/admin/analytics" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Total Revenue" value={`Rs. ${(stats.totalRevenue / 1000).toFixed(0)}K`} icon="💰" />
        </Link>
        <Link to="/admin/orders" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Orders Today" value={stats.ordersToday} icon="📋" />
        </Link>
        <Link to="/admin/medicines" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Medicines Listed" value={stats.medicinesListed} icon="💊" />
        </Link>
        <Link to="/admin/users" className="block hover:opacity-80 transition-all hover:-translate-y-1">
          <StatCard title="Active Pharmacists" value={stats.activePharmacists} icon="🏥" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-charcoal/10 bg-white p-6">
          <h3 className="font-fraunces font-semibold text-charcoal mb-4">Charts placeholder</h3>
          <div className="h-64 rounded-lg bg-charcoal/5 flex items-center justify-center text-charcoal/40 text-sm">
            Weekly sales / Revenue chart (use Analytics page for full charts)
          </div>
        </div>
        <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
          <h3 className="font-fraunces font-semibold text-charcoal px-4 py-3 border-b border-charcoal/10">Recent activity</h3>
          <ul className="divide-y divide-charcoal/5">
            {recentActivity.map((a) => (
              <li key={a.id} className="px-4 py-3 text-sm">
                <p className="text-charcoal">{a.text}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{a.time}</p>
              </li>
            ))}
            {recentActivity.length === 0 && (
              <li className="px-4 py-6 text-center text-charcoal/50 text-sm">No recent activity yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
