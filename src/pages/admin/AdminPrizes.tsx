import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const AdminPrizes: React.FC = () => {
  const { prizes, createPrize, updatePrize, deletePrize, togglePrizeStatus } = useAdmin();
  const { showToast } = useToast();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePrizeId, setDeletePrizeId] = useState<string | null>(null);

  // Form fields
  const [position, setPosition] = useState('1st Prize');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(100000);
  const [winnersCount, setWinnersCount] = useState(1);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || winnersCount <= 0) {
      showToast('Please enter valid details.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await createPrize({
        position,
        name,
        amount,
        winnersCount,
        status: 'Active'
      });
      showToast('Prize created successfully.', 'success');
      setIsAddOpen(false);
      // Reset fields
      setName('');
      setAmount(100000);
      setWinnersCount(1);
    } catch (err: any) {
      showToast(err.message || 'Failed to create prize.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (prize: any) => {
    setSelectedPrize(prize);
    setPosition(prize.position);
    setName(prize.name);
    setAmount(prize.amount);
    setWinnersCount(prize.winnersCount);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || winnersCount <= 0) {
      showToast('Please enter valid details.', 'error');
      return;
    }
    if (selectedPrize) {
      setIsSaving(true);
      try {
        await updatePrize(selectedPrize.id, {
          position,
          name,
          amount,
          winnersCount
        });
        showToast('Prize updated successfully.', 'success');
        setIsEditOpen(false);
        setSelectedPrize(null);
      } catch (err: any) {
        showToast(err.message || 'Failed to update prize.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletePrizeId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletePrizeId) {
      deletePrize(deletePrizeId);
      showToast('Prize deleted successfully.', 'success');
      setDeletePrizeId(null);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    togglePrizeStatus(id);
    showToast(`Prize is now ${currentStatus === 'Active' ? 'Inactive' : 'Active'}.`, 'success');
  };

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Prize Management</h2>
          <p className="text-xs text-text-secondary">Configure prize positions, reward amounts, and winner distribution counts</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prize Category</span>
        </button>
      </div>

      {/* PRIZES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {prizes.map((prize) => (
          <div key={prize.id} className="premium-card p-5 bg-white border border-border-light shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${prize.position.startsWith('1st') ? 'bg-[#FDF2F2] text-rose-700 border border-rose-100' :
                    prize.position.startsWith('2nd') ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      prize.position.startsWith('3rd') ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                  {prize.position}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${prize.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                  {prize.status}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide truncate">{prize.name}</h4>
                <p className="text-xl font-extrabold text-[#6366f1] mt-1">{formatRupee(prize.amount)}</p>
                <span className="text-[10px] text-text-secondary font-medium block mt-2">
                  Total Winners: <strong className="text-text-primary">{prize.winnersCount}</strong>
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleToggleStatus(prize.id, prize.status)}
                className="text-text-secondary hover:text-indigo-600 transition-colors"
                title="Toggle Status"
              >
                {prize.status === 'Active' ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-slate-300" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditClick(prize)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(prize.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Prize Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-border-light rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b pb-2">
              Add New Prize Category
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Position *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-text-primary font-semibold"
                >
                  <option value="1st Prize">1st Prize</option>
                  <option value="2nd Prize">2nd Prize</option>
                  <option value="3rd Prize">3rd Prize</option>
                  <option value="Consolation Prize">Consolation Prize</option>
                  <option value="Special Draw Prize">Special Draw Prize</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grand Bumper Cash Reward"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Value (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Number of Winners *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary font-semibold"
                />
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
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Prize</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prize Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-border-light rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 border-b pb-2">
              Edit Prize Category
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Position *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-text-primary font-semibold"
                >
                  <option value="1st Prize">1st Prize</option>
                  <option value="2nd Prize">2nd Prize</option>
                  <option value="3rd Prize">3rd Prize</option>
                  <option value="Consolation Prize">Consolation Prize</option>
                  <option value="Special Draw Prize">Special Draw Prize</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Prize Value (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Number of Winners *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-text-primary font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedPrize(null); }}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Prize Tiers"
        description="Are you sure you want to delete this prize category? This will affect draw outputs if the prize position is active. This action cannot be undone."
        type="danger"
        confirmText="Delete Prize"
      />
    </div>
  );
};

export default AdminPrizes;
