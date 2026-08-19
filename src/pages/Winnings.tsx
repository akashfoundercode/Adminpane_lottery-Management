import React, { useState, useMemo } from 'react';
import { useAgent } from '../context/AgentContext';
import { Winning } from '../types';
import { Search, Trophy, CheckCircle, Clock, Eye, X, Calendar, User, ShieldAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Winnings: React.FC = () => {
  const { winnings, games } = useAgent();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [claimFilter, setClaimFilter] = useState('All');
  
  // Modal selection state
  const [selectedWinning, setSelectedWinning] = useState<Winning | null>(null);

  const getGameDrawDate = (gameName: string) => {
    const game = games.find(g => g.name === gameName);
    if (!game) return '2026-08-15';
    return `${game.drawDate} at ${game.drawTime}`;
  };

  // Filter winnings list
  const filteredWinnings = useMemo(() => {
    return winnings.filter(win => {
      const matchesSearch =
        win.ticketNumber.includes(searchTerm) ||
        win.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        win.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        win.game.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClaim =
        claimFilter === 'All' || win.claimStatus === claimFilter;

      return matchesSearch && matchesClaim;
    });
  }, [winnings, searchTerm, claimFilter]);

  const getClaimBadge = (status: string) => {
    if (status === 'Claimed') {
      return 'bg-green-50 text-success-main border-green-200';
    }
    return 'bg-amber-50 text-warning-main border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Winning History</h2>
        <p className="text-sm text-text-secondary">Winning tickets and prize distributions associated with your offline books.</p>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="premium-card p-4 bg-white border border-border-light shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Ticket, Book ID, Game or Winner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
          />
        </div>

        {/* Claim Status Filter */}
        <div className="relative">
          <select
            value={claimFilter}
            onChange={(e) => setClaimFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
          >
            <option value="All">All Claim Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Claimed">Claimed</option>
          </select>
          <Trophy className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* WINNINGS DATA TABLE */}
      <div className="premium-card bg-white border border-border-light shadow-sm overflow-hidden">
        {filteredWinnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-light rounded-xl bg-white/50 m-4">
            <div className="p-3 bg-gray-50 border border-border-light rounded-2xl text-text-secondary mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">No Winnings Records</h3>
            <p className="mt-1 text-sm text-text-secondary max-w-sm">No ticket numbers matched winnings or searches in your history logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border-light">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Ticket Number</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book ID</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Game</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Agent Type</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Prize Class</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Prize Value</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Winner</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Claim Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {filteredWinnings.map((win) => (
                  <tr key={win.ticketNumber} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-emerald">
                      <span className="bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{win.ticketNumber}</span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-text-primary">{win.bookId}</td>
                    <td className="p-4 font-semibold text-text-primary">{win.game}</td>
                    <td className="p-4 text-text-secondary text-xs">{win.agentType}</td>
                    <td className="p-4 font-semibold text-text-primary">{win.prize}</td>
                    <td className="p-4 font-bold text-text-primary">₹{win.prizeValue.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-medium text-text-primary">{win.winner}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getClaimBadge(win.claimStatus)}`}>
                        {win.claimStatus === 'Claimed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{win.claimStatus}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedWinning(win)}
                        className="px-3 py-1.5 text-xs font-bold text-brand-emerald hover:text-brand-emerald-hover bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED DIALOG MODAL FOR SELECTED WINNING TICKET */}
      <AnimatePresence>
        {selectedWinning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWinning(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-border-light rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-light pb-3">
                <div className="flex items-center gap-2 text-brand-emerald">
                  <Trophy className="w-5 h-5" />
                  <h3 className="text-lg font-bold font-display text-text-primary leading-none">Winning Ticket Details</h3>
                </div>
                <button
                  onClick={() => setSelectedWinning(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-bg-app border border-border-light rounded-xl col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Ticket Number</span>
                    <span className="text-xl font-mono font-bold text-brand-emerald mt-1 block">{selectedWinning.ticketNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Book ID</span>
                    <span className="text-sm font-mono font-bold text-text-primary mt-1 block">{selectedWinning.bookId}</span>
                  </div>
                </div>

                <div className="p-3 bg-bg-app border border-border-light rounded-xl">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Game Name</span>
                  <span className="text-xs font-semibold text-text-primary mt-1 block">{selectedWinning.game}</span>
                </div>

                <div className="p-3 bg-bg-app border border-border-light rounded-xl">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Draw Date & Time</span>
                  <span className="text-xs font-semibold text-text-primary mt-1.5 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                    <span>{getGameDrawDate(selectedWinning.game)}</span>
                  </span>
                </div>

                <div className="p-3 bg-bg-app border border-border-light rounded-xl">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Prize Details</span>
                  <span className="text-xs font-bold text-text-primary mt-1 block">{selectedWinning.prize}</span>
                </div>

                <div className="p-3 bg-bg-app border border-border-light rounded-xl">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Prize Value</span>
                  <span className="text-sm font-bold text-brand-emerald mt-1 block">₹{selectedWinning.prizeValue.toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 bg-bg-app border border-border-light rounded-xl col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-text-secondary text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Winner Customer</span>
                      <span className="text-xs font-bold text-text-primary block">{selectedWinning.winner}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getClaimBadge(selectedWinning.claimStatus)}`}>
                    {selectedWinning.claimStatus === 'Claimed' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{selectedWinning.claimStatus}</span>
                  </span>
                </div>
              </div>

              {/* Informative footer, no action buttons as payouts are managed offline / admin */}
              <div className="p-3 rounded-xl bg-gray-50 border border-border-light text-[11px] text-text-secondary flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
                <p>This winning ticket was generated from an offline sale assigned to you. Claim verification is handled by Admin. Payout operations cannot be completed on this panel.</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedWinning(null)}
                  className="px-4 py-2 bg-text-primary hover:bg-gray-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Winnings;
