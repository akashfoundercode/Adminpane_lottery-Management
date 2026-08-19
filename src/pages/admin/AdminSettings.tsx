import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Save, RefreshCw, LogOut, ShieldAlert, Settings, User, Key, Bell, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminSettings: React.FC = () => {
  const { adminUser, updateSettings, resetSystem, adminLogout } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile Form state
  const [name, setName] = useState(adminUser?.name || 'Admin User');
  const [email, setEmail] = useState(adminUser?.email || 'admin@gmail.com');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications state
  const [notifSales, setNotifSales] = useState(true);
  const [notifWinner, setNotifWinner] = useState(true);
  const [notifAgent, setNotifAgent] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ name, email });
    showToast('Admin profile settings updated successfully.', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    // Simulate save
    showToast('Admin password updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetSystem = () => {
    if (confirm('CRITICAL WARNING: This will permanently wipe all local storage data, resetting games, books, agents, winners, and assignment history. Are you sure you want to proceed?')) {
      resetSystem();
      showToast('System database has been reset to defaults.', 'success');
      navigate('/admin/dashboard');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    showToast('Logged out successfully.', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">System Settings</h2>
        <p className="text-xs text-text-secondary">Configure admin profile settings, access credentials, and database utilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: NAVIGATION ACCORDIONS / TABS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="premium-card p-4 bg-white border border-border-light shadow-sm space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
              <Settings className="w-4 h-4" />
              <span>General Settings</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout Admin</span>
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex gap-2.5 text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider">Critical Zone</span>
                <p className="text-[10px] text-rose-700 leading-normal mt-1">
                  Resetting the database wipes all generated books, agent assignments, and uploaded outcomes. Ensure you have backups.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetSystem}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Reset Local Database</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROFILE FORM */}
          <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Admin Profile Details</span>
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-500" />
              <span>Change Security Password</span>
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* NOTIFICATION SETTINGS */}
          <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Email & Alert Channels</span>
            </h3>
            <div className="space-y-3.5 text-xs text-text-primary">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifSales}
                  onChange={(e) => setNotifSales(e.target.checked)}
                  className="rounded text-[#6366f1] focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Sales Milestones</span>
                  <span className="text-[10px] text-text-secondary">Get email notifications when agents achieve 100% sales on a book</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifWinner}
                  onChange={(e) => setNotifWinner(e.target.checked)}
                  className="rounded text-[#6366f1] focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Claim Verifications</span>
                  <span className="text-[10px] text-text-secondary">Notify super-admin immediately when a 1st prize claim is submitted</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifAgent}
                  onChange={(e) => setNotifAgent(e.target.checked)}
                  className="rounded text-[#6366f1] focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Agent Onboarding alerts</span>
                  <span className="text-[10px] text-text-secondary">Email log every time a Third Party agent activates their device key</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
