import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Download, Filter, Award, AlertCircle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const AdminReportsWinning: React.FC = () => {
  const { winnings, games } = useAdmin();

  // Filters
  const [selectedGame, setSelectedGame] = useState('All');
  const [selectedClaimStatus, setSelectedClaimStatus] = useState('All');

  // Filter list
  const filteredWinnings = useMemo(() => {
    return winnings.filter(w => {
      const matchesGame = selectedGame === 'All' || w.game === selectedGame;
      const matchesClaim = selectedClaimStatus === 'All' || w.claimStatus === selectedClaimStatus;
      return matchesGame && matchesClaim;
    });
  }, [winnings, selectedGame, selectedClaimStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalWinners = filteredWinnings.length;
    const totalAmount = filteredWinnings.reduce((acc, curr) => acc + curr.prizeValue, 0);
    const claimed = filteredWinnings.filter(w => w.claimStatus === 'Claimed');
    const claimedAmount = claimed.reduce((acc, curr) => acc + curr.prizeValue, 0);
    const pending = filteredWinnings.filter(w => w.claimStatus === 'Pending');
    const pendingAmount = pending.reduce((acc, curr) => acc + curr.prizeValue, 0);
    const rejected = filteredWinnings.filter(w => w.claimStatus === 'Rejected');

    return { totalWinners, totalAmount, claimedCount: claimed.length, claimedAmount, pendingCount: pending.length, pendingAmount, rejectedCount: rejected.length };
  }, [filteredWinnings]);

  const handleExport = () => {
    alert('Exporting Winning Report...');
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
          <h2 className="text-[20px] font-bold text-text-primary font-display">Winning Reports</h2>
          <p className="text-xs text-text-secondary">Track prize disbursements, claimed payout values, and pending verifications</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Winning Report</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Game Filter */}
        <div>
          <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1.5">Filter by Game</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Games</option>
            {games.map(g => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Claim Filter */}
        <div>
          <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1.5">Filter by Claim Status</label>
          <select
            value={selectedClaimStatus}
            onChange={(e) => setSelectedClaimStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Claimed">Claimed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Winners & Prize */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-[#6366f1] rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Prize Funds</span>
            <span className="text-xl font-bold text-text-primary mt-0.5 block">{formatRupee(stats.totalAmount)}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Distributed over {stats.totalWinners} winners</span>
          </div>
        </div>

        {/* Claimed/Paid */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Claimed & Disbursed</span>
            <span className="text-xl font-bold text-emerald-900 mt-0.5 block">{formatRupee(stats.claimedAmount)}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">{stats.claimedCount} claims fully paid out</span>
          </div>
        </div>

        {/* Pending Claim */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Pending Verification</span>
            <span className="text-xl font-bold text-amber-900 mt-0.5 block">{formatRupee(stats.pendingAmount)}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">{stats.pendingCount} tickets awaiting review</span>
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b p-4 bg-slate-50/50">
          Payout Distribution Ledger
        </h3>
        <div className="overflow-x-auto">
          {filteredWinnings.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-xs">No records matching search.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 font-mono">Ticket Number</th>
                  <th className="py-3.5 px-4">Winner Name</th>
                  <th className="py-3.5 px-4">Game</th>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Prize Position</th>
                  <th className="py-3.5 px-4 text-right">Prize Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredWinnings.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{w.ticketNumber}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{w.winner}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{w.game}</td>
                    <td className="py-3 px-4 text-text-secondary font-medium">{w.agentId} - {w.agentType}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700">
                        {w.prize}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-primary">{formatRupee(w.prizeValue)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        w.claimStatus === 'Claimed' ? 'bg-emerald-100 text-emerald-800' :
                        w.claimStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {w.claimStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsWinning;
