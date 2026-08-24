import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { Search, Filter, AlertCircle, Eye } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const HistoryExpired: React.FC = () => {
  const { books, games } = useAgent();
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter only Unsold by Admin books (Expired)
  const expiredBooks = useMemo(() => {
    return books.filter(b => b.status === 'Unsold by Admin');
  }, [books]);

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  // Apply filters
  const filteredBooks = useMemo(() => {
    let result = [...expiredBooks];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(b => {
        const gameName = getGameName(b.gameId).toLowerCase();
        return b.id.toLowerCase().includes(query) || gameName.includes(query);
      });
    }

    if (gameFilter !== 'All') {
      result = result.filter(b => b.gameId === gameFilter);
    }

    // Sort by expiryDate descending
    result.sort((a, b) => {
      const aTime = new Date(a.expiryDate).getTime();
      const bTime = new Date(b.expiryDate).getTime();
      return bTime - aTime;
    });

    return result;
  }, [expiredBooks, searchTerm, gameFilter]);

  // Paginate
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Unsold by Admin History</h2>
        <p className="text-sm text-text-secondary">Books automatically reclaimed by the administrator after timing out.</p>
      </div>

      {/* Explanatory Alert Notice */}
      <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs text-danger-main flex items-start gap-2.5 shadow-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Automatic Expiry Rule</h4>
          <p className="mt-0.5 leading-relaxed text-text-secondary">
            These books were automatically marked <strong className="text-danger-main">Unsold by Admin</strong> because no sales updates (Sold/Unsold) were confirmed by you before the expiry deadline. These records are locked and cannot be updated.
          </p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="premium-card p-4 bg-white border border-border-light shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      {/* TABLE / LIST */}
      <div className="premium-card bg-white border border-border-light shadow-sm overflow-hidden">
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No Expired Books Found"
            description="Good news! None of your books have timed out to 'Unsold by Admin'."
            icon={AlertCircle}
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
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Assigned Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Expiry Date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Expired Date</th>
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
                        {new Date(book.assignedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-text-secondary text-xs">
                        {new Date(book.expiryDate).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 text-danger-main text-xs">
                        {new Date((book as any).expiredDate || book.expiryDate).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-danger-main border border-red-200">
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
export default HistoryExpired;
