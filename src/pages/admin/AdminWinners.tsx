import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Search, Filter, AlertCircle, Award } from 'lucide-react';

export const AdminWinners: React.FC = () => {
  const { winnings, updateWinnerClaimStatus, games, agents } = useAdmin();
  const { showToast } = useToast();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter list
  const filteredWinners = useMemo(() => {
    return winnings.filter(w => {
      const matchesSearch = w.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            w.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            w.bookId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = gameFilter === 'All' || w.game === gameFilter;
      const matchesStatus = statusFilter === 'All' || w.claimStatus === statusFilter;
      return matchesSearch && matchesGame && matchesStatus;
    });
  }, [winnings, searchTerm, gameFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredWinners.length / itemsPerPage);
  const paginatedWinners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWinners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWinners, currentPage]);

  const handleStatusChange = (ticketNumber: string, bookId: string, name: string, newStatus: 'Pending' | 'Claimed' | 'Rejected') => {
    updateWinnerClaimStatus(ticketNumber, bookId, newStatus);
    showToast(`Claim status updated to ${newStatus} for ticket #${ticketNumber} (${name}).`, 'success');
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
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Winner Management</h2>
        <p className="text-xs text-text-secondary">Verify claims, update payout statuses, and audit big payouts</p>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by ticket or winner..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Game */}
        <div className="relative w-full">
          <select
            value={gameFilter}
            onChange={(e) => { setGameFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Games</option>
            {games.map(g => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Status */}
        <div className="relative w-full">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Claim Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Claimed">Claimed / Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* WINNERS TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredWinners.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No winner records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 font-mono">Ticket Number</th>
                  <th className="py-3.5 px-4">Winner Name</th>
                  <th className="py-3.5 px-4">Game</th>
                  <th className="py-3.5 px-4 font-mono">Book ID</th>
                  <th className="py-3.5 px-4">Prize Category</th>
                  <th className="py-3.5 px-4 text-right">Prize Amount</th>
                  <th className="py-3.5 px-4">Claim Status</th>
                  <th className="py-3.5 px-4 text-center">Action Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedWinners.map((winner, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{winner.ticketNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{winner.winner}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{winner.game}</td>
                    <td className="py-3 px-4 font-mono text-text-secondary">{winner.bookId}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        winner.prize.startsWith('1st') ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'
                      }`}>
                        {winner.prize}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-primary">{formatRupee(winner.prizeValue)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        winner.claimStatus === 'Claimed' ? 'bg-emerald-100 text-emerald-800' :
                        winner.claimStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {winner.claimStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={winner.claimStatus}
                        onChange={(e) => handleStatusChange(winner.ticketNumber, winner.bookId, winner.winner, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 text-text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Claimed">Claimed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border-light bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">
              Showing <strong className="font-semibold text-text-primary">{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong className="font-semibold text-text-primary">{Math.min(currentPage * itemsPerPage, filteredWinners.length)}</strong> of <strong className="font-semibold text-text-primary">{filteredWinners.length}</strong> winners
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#6366f1] text-white shadow-sm'
                      : 'border border-border-light bg-white text-text-primary hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWinners;
