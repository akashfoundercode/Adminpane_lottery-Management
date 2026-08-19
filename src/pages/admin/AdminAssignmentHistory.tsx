import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, AlertCircle, Calendar } from 'lucide-react';

export const AdminAssignmentHistory: React.FC = () => {
  const { assignmentHistory, games, agents, fetchAssignmentHistory } = useAdmin();

  // Fetch assignment history on mount
  React.useEffect(() => {
    fetchAssignmentHistory();
  }, []);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter list
  const filteredHistory = useMemo(() => {
    return assignmentHistory.filter(h => {
      const matchesSearch = h.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            h.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = gameFilter === 'All' || h.gameName === gameFilter;
      const matchesAgent = agentFilter === 'All' || h.agentName === agentFilter;
      const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
      return matchesSearch && matchesGame && matchesAgent && matchesStatus;
    });
  }, [assignmentHistory, searchTerm, gameFilter, agentFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Assignment History</h2>
        <p className="text-xs text-text-secondary">View complete history logs of ticket book assignments and status transitions</p>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search Book ID or Agent..."
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

        {/* Filter Agent */}
        <div className="relative w-full">
          <select
            value={agentFilter}
            onChange={(e) => { setAgentFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Agent Type */}
        <div className="relative w-full">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Sold">Sold</option>
            <option value="Unsold">Unsold</option>
            <option value="Unsold by Admin">Expired</option>
            <option value="Unassigned">Revoked</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Label Display */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-text-secondary">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Complete Logs</span>
        </div>
      </div>

      {/* HISTORIC TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No assignment logs found</p>
            <p className="text-[11px] text-text-secondary mt-0.5">Try widening your filter selections</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4 font-mono">Book ID</th>
                  <th className="py-3.5 px-4">Game Name</th>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Agent Type</th>
                  <th className="py-3.5 px-4">Assigned Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status / Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedHistory.map((log, index) => (
                  <tr key={`${log.id}-${index}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-secondary">{log.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{log.bookId}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{log.gameName}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{log.agentName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        log.agentType === 'Third Party' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {log.agentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-text-secondary">
                      {log.assignedDate ? new Date(log.assignedDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-secondary">
                      {log.expiryDate ? new Date(log.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        log.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        log.status === 'Unassigned' ? 'bg-slate-100 text-slate-800' :
                        log.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
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
              Showing <strong className="font-semibold text-text-primary">{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong className="font-semibold text-text-primary">{Math.min(currentPage * itemsPerPage, filteredHistory.length)}</strong> of <strong className="font-semibold text-text-primary">{filteredHistory.length}</strong> logs
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

export default AdminAssignmentHistory;
