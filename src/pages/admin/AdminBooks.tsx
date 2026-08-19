import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, Eye, AlertCircle, Calendar } from 'lucide-react';

export const AdminBooks: React.FC = () => {
  const { books, games, fetchBooks } = useAdmin();

  // Fetch books on mount to guarantee fresh records
  React.useEffect(() => {
    fetchBooks();
  }, []);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.serialNumber && b.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (b.agentName && b.agentName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGame = gameFilter === 'All' || b.gameId === gameFilter;
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesSearch && matchesGame && matchesStatus;
    });
  }, [books, searchTerm, gameFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBooks, currentPage]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Books Management</h2>
          <p className="text-xs text-text-secondary">Search, view and manage all generated ticket books</p>
        </div>
        <Link
          to="/admin/generate-books"
          className="bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
        >
          Generate New Books
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by ID, SN, Agent..."
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
              <option key={g.id} value={g.id}>{g.name}</option>
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
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Sold">Sold</option>
            <option value="Unsold">Unsold (Agent)</option>
            <option value="Unsold by Admin">Unsold by Admin (Expired)</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredBooks.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No books found</p>
            <p className="text-[11px] text-text-secondary mt-0.5">Try modifying filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Book ID</th>
                  <th className="py-3.5 px-4">Game</th>
                  <th className="py-3.5 px-4 font-mono">Serial Number</th>
                  <th className="py-3.5 px-4 text-center">Book No</th>
                  <th className="py-3.5 px-4 text-right">Total Tickets</th>
                  <th className="py-3.5 px-4 text-right">Sold Tickets</th>
                  <th className="py-3.5 px-4 text-right">Unsold Tickets</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-text-primary">{book.id}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary truncate max-w-[140px]">{book.gameName}</td>
                    <td className="py-3 px-4 font-mono font-medium text-text-secondary">{book.serialNumber || '-'}</td>
                    <td className="py-3 px-4 text-center text-text-secondary font-medium">{book.bookNumber || '-'}</td>
                    <td className="py-3 px-4 text-right text-text-secondary font-medium">{book.tickets.length}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{book.status === 'Sold' ? book.tickets.length : 0}</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">
                      {book.status === 'Unsold' || book.status === 'Unsold by Admin' ? book.tickets.length : 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        book.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                        book.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                        book.status === 'Assigned' || book.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                        book.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">{book.agentName || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Link
                          to={`/admin/books/${book.id}`}
                          title="View Details"
                          className="text-text-secondary hover:text-indigo-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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
              Showing <strong className="font-semibold text-text-primary">{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong className="font-semibold text-text-primary">{Math.min(currentPage * itemsPerPage, filteredBooks.length)}</strong> of <strong className="font-semibold text-text-primary">{filteredBooks.length}</strong> books
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                // simple pagination range, capped at 5 pages visible
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                      currentPage === pageNumber
                        ? 'bg-[#6366f1] text-white shadow-sm'
                        : 'border border-border-light bg-white text-text-primary hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
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

export default AdminBooks;
