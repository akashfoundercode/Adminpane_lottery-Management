import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { Book } from '../types';
import { Search, Filter, ArrowUpDown, Eye, BookOpen, AlertTriangle } from 'lucide-react';

export const Books: React.FC = () => {
  const { books, games, booksPagination, fetchAgentBooks } = useAgent();
  const location = useLocation();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<'expiryDate' | 'bookValue' | 'assignedDate'>('expiryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Expiry window filter
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'soon' | 'past'>('all');

  const itemsPerPage = 50;
  const [offset, setOffset] = useState(0);

  // Sync with topbar quick search parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  useEffect(() => {
    setOffset(0);
    fetchAgentBooks(itemsPerPage, 0, false);
  }, [searchTerm, gameFilter, statusFilter, expiryFilter, sortField, sortOrder]);

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sold':
        return 'bg-green-50 text-success-main border-green-200';
      case 'Unsold':
        return 'bg-amber-50 text-warning-main border-amber-200';
      case 'Unsold by Admin':
        return 'bg-red-50 text-danger-main border-red-200';
      case 'Assigned':
        return 'bg-blue-50 text-info-main border-blue-200';
      default:
        return 'bg-gray-50 text-text-secondary border-border-light';
    }
  };

  // Filter & Sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search by Book ID or Game name
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(book => {
        const gameName = getGameName(book.gameId).toLowerCase();
        return book.id.toLowerCase().includes(query) || gameName.includes(query);
      });
    }

    // Filter by Game
    if (gameFilter !== 'All') {
      result = result.filter(book => book.gameId === gameFilter);
    }

    // Filter by Status
    if (statusFilter !== 'All') {
      result = result.filter(book => book.status === statusFilter);
    }

    // Expiry filters
    const now = new Date().getTime();
    if (expiryFilter === 'soon') {
      // Expiring in less than 24 hours (86400000 ms) and not already expired/sold
      result = result.filter(book => {
        if (book.status !== 'Assigned' && book.status !== 'In Progress') return false;
        const expiry = new Date(book.expiryDate).getTime();
        const diff = expiry - now;
        return diff > 0 && diff <= 24 * 60 * 60 * 1000;
      });
    } else if (expiryFilter === 'past') {
      result = result.filter(book => new Date(book.expiryDate).getTime() <= now);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'expiryDate' || sortField === 'assignedDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [books, searchTerm, gameFilter, statusFilter, sortField, sortOrder, expiryFilter]);

  const paginatedBooks = filteredBooks;

  const toggleSort = (field: 'expiryDate' | 'bookValue' | 'assignedDate') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-text-primary">Assigned Books</h2>
        <p className="text-sm text-text-secondary">Books assigned to you by Admin for offline ticket sales.</p>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="premium-card p-4 bg-white border border-border-light shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Book ID or Game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          {/* Game filter dropdown */}
          <div className="relative">
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
            >
              <option value="All">All Games</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Sold">Sold</option>
              <option value="Unsold">Unsold</option>
              <option value="Unsold by Admin">Unsold by Admin</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Expiry filter dropdown */}
          <div className="relative">
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as any)}
              className="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-light rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-emerald appearance-none cursor-pointer"
            >
              <option value="all">Any Expiration</option>
              <option value="soon">Expiring Soon (&lt;24 Hours)</option>
              <option value="past">Already Expired</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Sorting options toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-light text-xs font-medium">
          <div className="flex items-center gap-2 text-text-secondary">
            <span>Sort by:</span>
            <button
              onClick={() => toggleSort('expiryDate')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${sortField === 'expiryDate' ? 'border-brand-emerald bg-emerald-50 text-brand-emerald' : 'border-border-light bg-white hover:bg-gray-50'
                }`}
            >
              <span>Expiry Date</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('bookValue')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${sortField === 'bookValue' ? 'border-brand-emerald bg-emerald-50 text-brand-emerald' : 'border-border-light bg-white hover:bg-gray-50'
                }`}
            >
              <span>Book Value</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('assignedDate')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${sortField === 'assignedDate' ? 'border-brand-emerald bg-emerald-50 text-brand-emerald' : 'border-border-light bg-white hover:bg-gray-50'
                }`}
            >
              <span>Assigned Date</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
          <div className="text-text-secondary">
            Showing <strong className="text-text-primary">{filteredBooks.length}</strong> books found
          </div>
        </div>
      </div>

      {/* BOOK LISTINGS: DESKTOP TABLE */}
      <div className="hidden md:block premium-card bg-white border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Game</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-center">Tickets</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book Value</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Assigned Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Expiry Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-sm">
              {paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-secondary">
                    No books matched your criteria.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-text-primary">{book.id}</td>
                    <td className="p-4 font-semibold text-text-primary">{getGameName(book.gameId)}</td>
                    <td className="p-4 text-center font-medium text-text-secondary">{book.tickets.length}</td>
                    <td className="p-4 font-semibold text-text-primary">₹{book.bookValue.toLocaleString('en-IN')}</td>
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
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(book.status)}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/agent/books/${book.id}`)}
                        className="px-3.5 py-1.5 text-xs font-bold text-brand-emerald hover:text-brand-emerald-hover bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOK LISTINGS: MOBILE RESPONSIVE CARDS */}
      <div className="block md:hidden space-y-4">
        {paginatedBooks.length === 0 ? (
          <div className="premium-card p-6 bg-white text-center text-text-secondary text-sm">
            No books matched your criteria.
          </div>
        ) : (
          paginatedBooks.map((book) => (
            <div key={book.id} className="premium-card p-4 bg-white border border-border-light shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm text-text-primary">{book.id}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(book.status)}`}>
                  {book.status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-secondary font-medium">Game Name</p>
                <p className="text-sm font-semibold text-text-primary">{getGameName(book.gameId)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-light pt-2">
                <div>
                  <p className="text-text-secondary font-medium">Book Value</p>
                  <p className="font-bold text-text-primary mt-0.5">₹{book.bookValue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium">Tickets Count</p>
                  <p className="font-bold text-text-primary mt-0.5">{book.tickets.length}</p>
                </div>
              </div>

              <div className="text-xs space-y-1 border-t border-border-light pt-2 text-text-secondary">
                <p>Assigned: {new Date(book.assignedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                <p>Expiry: {new Date(book.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              <button
                onClick={() => navigate(`/agent/books/${book.id}`)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald hover:text-brand-emerald-hover text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION TOOLBAR */}
      {(offset > 0 || booksPagination.hasMore) && (
        <div className="flex items-center justify-between border-t border-border-light pt-4 text-xs font-medium">
          <button
            onClick={() => {
              const previousOffset = Math.max(offset - itemsPerPage, 0);
              setOffset(previousOffset);
              fetchAgentBooks(itemsPerPage, previousOffset, false);
            }}
            disabled={offset === 0}
            className="px-3 py-1.5 border border-border-light rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-text-secondary">
            Showing <strong className="text-text-primary">{Math.min(offset + itemsPerPage, booksPagination.total || offset + paginatedBooks.length)}</strong> of <strong className="text-text-primary">{booksPagination.total || paginatedBooks.length}</strong>
          </span>
          <button
            onClick={() => {
              const nextOffset = offset + itemsPerPage;
              setOffset(nextOffset);
              fetchAgentBooks(itemsPerPage, nextOffset, false);
            }}
            disabled={!booksPagination.hasMore}
            className="px-3 py-1.5 border border-border-light rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default Books;
