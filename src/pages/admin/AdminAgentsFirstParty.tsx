import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Eye, AlertCircle, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { PageLoader } from '../../components/PageLoader';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { PasswordInput, ValidatedInput } from '../../components/ui/ValidatedInput';

export const AdminAgentsFirstParty: React.FC = () => {
  const { agents, agentsPagination, createAgent, updateAgent, deleteAgent, toggleAgentStatus, fetchAgents, loadingAgents } = useAdmin();
  const { showToast } = useToast();

  React.useEffect(() => {
    fetchAgents(1000, 0, false);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const normalizeContactNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  };

  const isValidContactNumber = (value: string) => /^\d{10}$/.test(normalizeContactNumber(value));

  // Filter First Party Agents
  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      const isFirstParty = a.agentType === 'First Party';
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());
      return isFirstParty && matchesSearch;
    });
  }, [agents, searchTerm]);

  // Pagination
  const paginatedAgents = filteredAgents;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim() || !whatsapp.trim() || !address.trim() || !password.trim()) {
      showToast('Please complete all agent fields.', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!isValidContactNumber(mobile) || !isValidContactNumber(whatsapp)) {
      showToast('Mobile and WhatsApp numbers must be exactly 10 digits.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAgent({
        name,
        email,
        mobile,
        whatsapp,
        address,
        agentType: 'First Party',
        password,
        status
      });
      await fetchAgents(1000, 0, false);
      showToast('Agent added successfully.', 'success');
      setIsAddOpen(false);
      // Reset form
      setName('');
      setEmail('');
      setMobile('');
      setWhatsapp('');
      setAddress('');
      setPassword('');
      setStatus('Active');
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (err: any) {
      showToast(err.message || 'Failed to create agent.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (agent: any) => {
    setSelectedAgent(agent);
    setName(agent.name);
    setEmail(agent.email);
    setMobile(normalizeContactNumber(agent.mobile));
    setWhatsapp(normalizeContactNumber(agent.whatsapp || agent.mobile || ''));
    setAddress(agent.address);
    setPassword('');
    setStatus(agent.status || 'Active');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim() || !whatsapp.trim() || !address.trim()) {
      showToast('Please complete all agent fields.', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || !isValidContactNumber(mobile) || !isValidContactNumber(whatsapp)) {
      showToast('Mobile and WhatsApp numbers must be exactly 10 digits.', 'error');
      return;
    }
    if (password && password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (selectedAgent) {
      setIsSubmitting(true);
      try {
        await updateAgent(selectedAgent.id, {
          name,
          email,
          mobile,
          whatsapp,
          address,
          ...(password ? { password } : {}),
          status
        });
        await fetchAgents(1000, 0, false);
        showToast('Agent details updated.', 'success');
        setIsEditOpen(false);
        setSelectedAgent(null);
        setTimeout(() => {
          window.location.reload();
        }, 400);
      } catch (err: any) {
        showToast(err.message || 'Failed to update agent.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleAgentStatus(id);
    showToast(`Agent status updated to ${currentStatus === 'Active' ? 'Inactive' : 'Active'}.`, 'success');
  };

  const handleConfirmDelete = async () => {
    if (!deleteAgentId) return;
    try {
      await deleteAgent(deleteAgentId);
      showToast('Agent deleted successfully.', 'success');
      setDeleteAgentId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete agent.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">First Party Agents</h2>
          <p className="text-xs text-text-secondary">View, edit, and toggle active status for in-house agents</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Party Agent</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* AGENTS LIST */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {loadingAgents ? <PageLoader /> : filteredAgents.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No First Party agents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">S. No.</th>
                  <th className="py-3.5 px-4">Agent ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedAgents.map((agent, index) => (
                  <tr key={agent.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-secondary">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{agent.id}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{agent.name}</td>
                    <td className="py-3 px-4 text-text-secondary font-medium">{agent.email}</td>
                    <td className="py-3 px-4 text-text-secondary font-medium">{agent.mobile}</td>
                    <td className="py-3 px-4 text-text-secondary max-w-[180px] truncate">{agent.address}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${agent.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(agent.id, agent.status)}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${agent.status === 'Active' ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                        >
                          {agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/admin/agents/${agent.id}`}
                          className="text-text-secondary hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditClick(agent)}
                          className="text-text-secondary hover:text-indigo-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAgentId(agent.id)}
                          aria-label={`Delete ${agent.name}`}
                          className="text-text-secondary hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {agentsPagination.hasMore && (
          <div className="px-4 py-3 border-t border-border-light bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">Showing {agents.length} of {agentsPagination.total || agents.length} agents</span>
            <button onClick={() => fetchAgents(10, agentsPagination.currentPage * 10, true)} className="px-4 py-2 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50">View More</button>
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-border-light rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b pb-2">
              Add First Party Agent
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Agent Name *</label>
                <ValidatedInput
                  type="text"
                  required
                  validation="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Email *</label>
                <ValidatedInput
                  type="email"
                  required
                  validation="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Mobile Number *</label>
                <ValidatedInput
                  type="text"
                  required
                  validation="phone"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">WhatsApp Number *</label>
                <ValidatedInput
                  type="text"
                  required
                  validation="phone"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address *</label>
                <ValidatedInput
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Password *</label>
                <PasswordInput
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Agent</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-border-light rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b pb-2">
              Edit Agent Details
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Agent Name *</label>
                <ValidatedInput
                  type="text"
                  required
                  validation="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Email *</label>
                <ValidatedInput
                  type="email"
                  required
                  validation="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Mobile *</label>
                <ValidatedInput
                  type="text"
                  required
                  validation="phone"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">WhatsApp Number *</label>
                <ValidatedInput type="text" required validation="phone" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="numeric" maxLength={10} pattern="[0-9]{10}" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address</label>
                <ValidatedInput
                  type="text"
                  validation="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Password (optional)</label>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Status *</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedAgent(null); }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteAgentId !== null}
        onClose={() => setDeleteAgentId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        description="Are you sure you want to delete this agent? This action cannot be undone."
        type="danger"
        confirmText="Delete Agent"
      />
    </div>
  );
};

export default AdminAgentsFirstParty;
