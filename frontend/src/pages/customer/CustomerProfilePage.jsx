import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function CustomerProfilePage() {
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateProfile(form, accessToken);
      if (res.success) {
        addToast('Profile updated successfully');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!password.current || !password.new) {
      addToast('Please fill all password fields', 'error');
      return;
    }
    if (password.new !== password.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setPassLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword: password.current,
        newPassword: password.new
      }, accessToken);
      
      if (res.success) {
        addToast('Password updated successfully');
        setPassword({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 page-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size="lg" />
          <div>
            <h2 className="font-fraunces text-xl font-semibold text-charcoal">{user?.name}</h2>
            <p className="text-charcoal/60">{user?.email}</p>
            {user?.phone && <p className="text-charcoal/60 text-sm mt-0.5 flex items-center gap-1.5"><span className="opacity-50">📱</span> {user.phone}</p>}
            {user?.address && <p className="text-charcoal/60 text-sm flex items-center gap-1.5"><span className="opacity-50">📍</span> {user.address}</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="rounded-xl border border-charcoal/10 bg-white p-6 space-y-4">
        <h3 className="font-fraunces font-semibold text-charcoal">Personal info</h3>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none resize-none"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="rounded-xl border border-charcoal/10 bg-white p-6 space-y-4">
        <h3 className="font-fraunces font-semibold text-charcoal">Change password</h3>
        
        {/* Hidden username field helps browsers correctly associate the password change */}
        <input type="text" name="username" value={user?.email || ''} readOnly className="hidden" autoComplete="username" />
        
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Current password</label>
          <input
            type="password"
            value={password.current}
            onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">New password</label>
          <input
            type="password"
            value={password.new}
            onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Confirm new password</label>
          <input
            type="password"
            value={password.confirm}
            onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
            className="w-full rounded-lg border border-charcoal/20 px-4 py-2.5 focus:border-primary outline-none"
            autoComplete="new-password"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={passLoading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {passLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {user?.role === 'customer' && (
        <div className="rounded-xl border border-charcoal/10 bg-white p-6">
          <h3 className="font-fraunces font-semibold text-charcoal mb-3">Notification preferences</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="rounded text-primary"
            />
            <span className="text-sm text-charcoal">Email me order updates and offers</span>
          </label>
        </div>
      )}
    </div>
  );
}
