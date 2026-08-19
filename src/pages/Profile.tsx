import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { User, Phone, MessageSquare, MapPin, Shield, Calendar, Lock, Save, KeyRound } from 'lucide-react';

export const Profile: React.FC = () => {
  const { agent, updateProfile } = useAgent();
  const { showToast } = useToast();
  const location = useLocation();

  // Selected tab: 'profile' or 'security'
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Edit fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Populate data when agent context loads
  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setMobile(agent.mobile);
      setWhatsapp(agent.whatsapp || '');
      setAddress(agent.address);
    }
  }, [agent]);

  // Sync tab with route query params (?tab=security)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'security') {
      setActiveTab('security');
    } else {
      setActiveTab('profile');
    }
  }, [location.search]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !whatsapp.trim() || !address.trim()) {
      showToast('All contact fields are required.', 'warning');
      return;
    }

    updateProfile({
      name: name.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim()
    });

    showToast('Profile contacts updated successfully.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'warning');
      return;
    }

    if (currentPassword !== '123456') {
      showToast('Incorrect current password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    showToast('Password changed successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!agent) return null;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Profile Settings</h2>
        <p className="text-sm text-text-secondary">Manage your contact details, security credentials, and view agent parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: Agent Summary Card */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex flex-col items-center text-center space-y-4">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 border-2 border-brand-emerald/30 flex items-center justify-center text-brand-emerald font-bold text-2xl font-display">
            {name ? name.split(' ').map(n => n[0]).join('') : 'RK'}
          </div>

          <div>
            <h3 className="text-base font-bold text-text-primary">{name}</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-brand-emerald border border-emerald-100 mt-1">
              {agent.agentType}
            </span>
          </div>

          {/* Core details list */}
          <div className="w-full text-left space-y-2.5 border-t border-border-light pt-4 text-xs font-medium text-text-secondary">
            <div className="flex justify-between">
              <span>Agent ID:</span>
              <strong className="text-text-primary font-mono">{agent.agentId}</strong>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-main" />
                <strong className="text-success-main">{agent.status}</strong>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Joined Date:</span>
              <strong className="text-text-primary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>12 Jan 2026</span>
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit/Security Tabs Form Panel */}
        <div className="lg:col-span-3 bg-white border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Tab Navigation header */}
          <div className="flex border-b border-border-light bg-gray-50/50">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-brand-emerald text-brand-emerald bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Contact Details</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'border-brand-emerald text-brand-emerald bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
          </div>

          {/* Form Content body */}
          <div className="p-6 flex-1">
            {activeTab === 'profile' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                  Update Contacts Info
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      WhatsApp Number
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
                      <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors resize-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-hover text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-emerald/10 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Contact Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                  Change Password
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="e.g. 123456"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-hover text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-emerald/10 cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
