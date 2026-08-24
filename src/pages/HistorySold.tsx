import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { Search, Filter, Download, ArrowRight, Calendar, Eye, CheckSquare } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const HistorySold: React.FC = () => {
  const { books, games } = useAgent();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter only Sold books
  const soldBooks = useMemo(() => {
    return books.filter(b => b.status === 'Sold');
  }, [books]);

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  // Apply filters
  const filteredBooks = useMemo(() => {
    let result = [...soldBooks];

    // Search by Book ID
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(b => {
        const gameName = getGameName(b.gameId).toLowerCase();
        return b.id.toLowerCase().includes(query) || gameName.includes(query);
      });
    }

    // Game filter
    if (gameFilter !== 'All') {
      result = result.filter(b => b.gameId === gameFilter);
    }

    // Date range filter (soldDate filter)
    if (dateFilter !== 'All') {
      const now = new Date('2026-08-15T13:02:07+05:30');
      result = result.filter(b => {
        if (!(b as any).soldDate) return false;
        const soldTime = new Date((b as any).soldDate);
        const diffMs = now.getTime() - soldTime.getTime();

        if (dateFilter === '7days') {
          return diffMs <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === '30days') {
          return diffMs <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // Sort by sold Date descending
    result.sort((a, b) => {
      const aTime = new Date((a as any).soldDate || 0).getTime();
      const bTime = new Date((b as any).soldDate || 0).getTime();
      return bTime - aTime;
    });

    return result;
  }, [soldBooks, searchTerm, gameFilter, dateFilter]);

  // Paginate
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;

  const handleExport = () => {
    showToast('Exporting sold history to CSV...', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-text-primary">Sold History</h2>
          <p className="text-sm text-text-secondary">Historical logs of books marked as Sold.</p>
        </div>

        {/* CSV Export UI Button */}
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-border-light bg-white hover:bg-gray-50 text-text-primary rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-text-secondary" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="premium-card p-4 bg-white border border-border-light shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Book ID or Game..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
          />
        </div>

        {/* Game Filter */}
        <div className="relative">
          <select
            value={gameFilter}
            onChange={(e) => {
              setGameFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
          >
            <option value="All">All Games</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
          >
            <option value="All">All Sales Dates</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* TABLE */}
      <div className="premium-card bg-white border border-border-light shadow-sm overflow-hidden">
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No Sold History Found"
            description="You haven't marked any assigned books as Sold yet."
            icon={CheckSquare}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-border-light">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Sr. No.</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book ID</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Game</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Sold Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Amount</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-sm">
                  {paginatedBooks.map((book, index) => (
                    <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="p-4 font-mono font-bold text-text-primary">{book.id}</td>
                      <td className="p-4 font-semibold text-text-primary">{getGameName(book.gameId)}</td>
                      <td className="p-4 text-text-secondary text-xs">
                        {new Date((book as any).soldDate).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-bold text-brand-emerald">₹{book.bookValue.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-success-main border border-green-200">
                          {book.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/agent/books/${book.id}`)}
                          className="px-3 py-1 text-xs font-bold text-brand-emerald hover:text-brand-emerald-hover bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border-light p-4 text-xs font-medium bg-white">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-border-light rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-text-secondary">
                  Page <strong className="text-text-primary">{currentPage}</strong> of <strong className="text-text-primary">{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-border-light rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default HistorySold;
