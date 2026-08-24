import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { PageLoader } from '../../components/PageLoader';

export const AdminAssignmentHistory: React.FC = () => {
  const { assignmentHistory, assignmentHistoryPagination, games, agents, fetchAssignmentHistory, loadingHistory } = useAdmin();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch one API page at a time.
  React.useEffect(() => {
    fetchAssignmentHistory(itemsPerPage, (currentPage - 1) * itemsPerPage, false, gameFilter === 'All' ? undefined : gameFilter);
  }, [currentPage, gameFilter]);

  // Filter list (client-side for search/agent/status/game)
  const filteredHistory = useMemo(() => {
    return assignmentHistory.filter(h => {
      const matchesSearch = h.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = gameFilter === 'All' || h.gameName === games.find(g => g.id === gameFilter)?.name;
      const matchesAgent = agentFilter === 'All' || h.agentName === agentFilter;
      const matchesStatus = statusFilter === 'All' || h.status === statusFilter;
      return matchesSearch && matchesGame && matchesAgent && matchesStatus;
    });
  }, [assignmentHistory, searchTerm, gameFilter, agentFilter, statusFilter, games]);

  // Pagination
  const paginatedHistory = filteredHistory.slice(0, itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Assignment History</h2>
        <p className="text-xs text-text-secondary">View complete history logs of ticket book assignments and status transitions</p>
      </div>

      {/* GAME FILTER PILLS */}
      <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setGameFilter('All'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${gameFilter === 'All'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 text-text-secondary border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
          >
            All Games
          </button>
          {games.map(g => (
            <button
              key={g.id}
              onClick={() => { setGameFilter(g.id); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${gameFilter === g.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-text-secondary border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Search + Agent + Status filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Book ID or Agent..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
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
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Sold">Sold</option>
              <option value="Unsold">Unsold</option>
              <option value="Unsold by Admin">Unsold by Admin</option>
              <option value="Unassigned">Unassigned</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* HISTORIC TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {loadingHistory ? <PageLoader /> : filteredHistory.length === 0 ? (
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
                  <th className="py-3.5 px-4">S. No.</th>
                  <th className="py-3.5 px-4 font-mono">Book ID</th>
                  <th className="py-3.5 px-4">Game Name</th>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Agent Type</th>
                  <th className="py-3.5 px-4">Assigned Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Sold / Unsold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedHistory.map((log, index) => (
                  <tr key={`${log.id}-${index}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{log.bookId}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{log.gameName}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{log.agentName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${log.agentType === 'Third Party' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${log.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                          log.status === 'Unassigned' ? 'bg-slate-100 text-slate-800' :
                            log.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                        }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'Sold' || log.status === 'Unsold' || log.status === 'Unsold by Admin' ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${log.status === 'Sold'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}>
                          {log.status === 'Sold' ? 'Sold' : 'Unsold'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {(assignmentHistoryPagination.total > 0 || assignmentHistoryPagination.hasMore) && (
          <div className="px-4 py-3 border-t border-border-light bg-slate-50/50 flex items-center justify-between gap-3">
            <span className="text-[11px] text-text-secondary">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{(currentPage - 1) * itemsPerPage + paginatedHistory.length} of {assignmentHistoryPagination.total || assignmentHistory.length} logs
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1 || loadingHistory}
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                className="px-3 py-2 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[10px] font-bold text-indigo-700 whitespace-nowrap">Page {currentPage}</span>
              <button
                type="button"
                disabled={!assignmentHistoryPagination.hasMore || loadingHistory}
                onClick={() => setCurrentPage(page => page + 1)}
                className="px-3 py-2 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
