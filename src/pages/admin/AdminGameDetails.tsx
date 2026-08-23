import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Calendar, Layers, AlertCircle, Trash2, Lock, RefreshCw } from 'lucide-react';
import type { Book } from '../../types';
import { apiUrl } from '../../config/api';

export const AdminGameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { games, deleteGame, fetchGameLockStatus, unlockBookByAdmin } = useAdmin();
  const navigate = useNavigate();

  const game = games.find(g => g.id === id);

  const [gameBooks, setGameBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksPagination, setBooksPagination] = useState({ total: 0, currentPage: 1, lastPage: 1 });
  const [lockStatus, setLockStatus] = useState<{ is_locked: boolean; remaining_minutes: number; lock_deadline_at: string | null; status: string } | null>(null);
  const [lockStatusLoading, setLockStatusLoading] = useState(false);
  const [unlockingBookId, setUnlockingBookId] = useState<string | null>(null);

  const fetchGameBooks = async (page = 1) => {
    if (!game) return;
    setBooksLoading(true);
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/books?page=${page}&limit=50&game_id=${game.id}`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.success) {
        const bookSize = Number(json.data[0]?.game?.book_size || game.bookSize || 10);
        const mapped: Book[] = (json.data || []).map((b: any) => ({
          id: b.book_id || `BK${b.id}`,
          apiId: Number(b.id),
          gameId: String(b.game_id),
          gameName: b.game?.game_name || game.name,
          bookName: b.book_id || `BK${b.id}`,
          agentId: b.agent_id ? String(b.agent_id) : '',
          agentName: b.agent?.agent_name || '',
          tickets: Array.from({ length: bookSize }, (_, i) => String(50000 + b.id * bookSize + i)),
          bookValue: bookSize * Number(b.game?.ticket_price || game.ticketPrice || 100),
          bookNumber: String(b.id),
          serialNumber: `SN-${b.book_id || b.id}`,
          totalTickets: bookSize,
          soldTickets: 0,
          unsoldTickets: 0,
          assignedDate: b.assigned_at || '',
          expiryDate: b.expiry_at || '',
          createdDate: b.created_at || '',
          status: (() => {
            const s = String(b.status).toLowerCase();
            if (s === 'assigned') return 'Assigned';
            if (s === 'sold') return 'Sold';
            if (s === 'unsold') return 'Unsold';
            if (s === 'unsold by admin') return 'Unsold by Admin';
            if (s === 'in progress') return 'In Progress';
            return 'Available';
          })() as Book['status']
        }));
        setGameBooks(page === 1 ? mapped : prev => [...prev, ...mapped]);
        const pg = json.pagination || {};
        setBooksPagination({ total: pg.total || 0, currentPage: pg.current_page || page, lastPage: pg.last_page || 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBooksLoading(false);
    }
  };

  useEffect(() => {
    if (game) fetchGameBooks(1);
  }, [id, games.length]);

  useEffect(() => {
    if (!game) return;
    let mounted = true;
    const checkLockStatus = async () => {
      setLockStatusLoading(true);
      try {
        const status = await fetchGameLockStatus(game.id);
        if (mounted) setLockStatus(status);
      } catch (error) {
        if (mounted) console.error('Failed to fetch game lock status:', error);
      } finally {
        if (mounted) setLockStatusLoading(false);
      }
    };
    checkLockStatus();
    const intervalId = window.setInterval(checkLockStatus, 30000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [game?.id]);

  // Derived stats
  const totalBooks = booksPagination.total || gameBooks.length;
  const soldBooks = gameBooks.filter(b => b.status === 'Sold').length;
  const unsoldBooks = gameBooks.filter(b => b.status === 'Unsold').length;
  const expiredBooks = gameBooks.filter(b => b.status === 'Unsold by Admin').length;
  const assignedBooks = gameBooks.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length;
  const availableBooks = gameBooks.filter(b => b.status === 'Available').length;

  const handleUnlockBook = async (book: Book) => {
    setUnlockingBookId(book.id);
    try {
      await unlockBookByAdmin(book.apiId ?? book.id);
      setGameBooks(prev => prev.map(item => item.id === book.id ? { ...item, status: 'Unsold by Admin' } : item));
    } catch (error) {
      console.error('Failed to mark book as unsold by admin:', error);
    } finally {
      setUnlockingBookId(null);
    }
  };

  if (!game) {
    return (
      <div className="p-8 bg-white border border-border-light rounded-xl text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Game Not Found</h3>
        <p className="text-xs text-text-secondary mt-1">The game ID is invalid or has been deleted.</p>
        <Link to="/admin/games" className="inline-block mt-4 text-xs font-semibold text-[#6366f1] hover:underline">
          Back to Games List
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this game?')) {
      deleteGame(game.id);
      navigate('/admin/games');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/games"
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">{game.name} Details</h2>
          <p className="text-xs text-text-secondary">Code: {game.gameCode} | Status: {game.status}</p>
        </div>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${lockStatus?.is_locked ? 'border-rose-200 bg-rose-50' : 'border-sky-200 bg-sky-50'}`}>
        <div className="flex items-center gap-2">
          <Lock className={`w-4 h-4 ${lockStatus?.is_locked ? 'text-rose-600' : 'text-sky-600'}`} />
          <div>
            <p className="font-bold text-text-primary">{lockStatus?.is_locked ? 'Book lock is active' : 'Book lock window is open'}</p>
            <p className="text-[11px] text-text-secondary">
              {lockStatus?.is_locked ? 'Uncompleted assigned books can be marked Unsold by Admin.' : `${lockStatus?.remaining_minutes ?? '-'} minutes remaining`}
            </p>
          </div>
        </div>
        {lockStatusLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-text-secondary" />}
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Generated Books */}
        <div className="premium-card p-4 bg-white border border-border-light shadow-sm">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Generated Books</span>
          <span className="text-lg font-bold text-text-primary mt-1 block">{totalBooks}</span>
        </div>
        {/* Available Books */}
        <div className="premium-card p-4 bg-blue-50 border border-blue-100 shadow-sm">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Available Books</span>
          <span className="text-lg font-bold text-blue-900 mt-1 block">{availableBooks}</span>
        </div>
        {/* Assigned Books */}
        <div className="premium-card p-4 bg-purple-50 border border-purple-100 shadow-sm">
          <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">Assigned Books</span>
          <span className="text-lg font-bold text-purple-900 mt-1 block">{assignedBooks}</span>
        </div>
        {/* Sold Books */}
        <div className="premium-card p-4 bg-emerald-50 border border-emerald-100 shadow-sm">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Sold Books</span>
          <span className="text-lg font-bold text-emerald-900 mt-1 block">{soldBooks}</span>
        </div>
        {/* Unsold Books */}
        <div className="premium-card p-4 bg-amber-50 border border-amber-100 shadow-sm">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Unsold Books</span>
          <span className="text-lg font-bold text-amber-900 mt-1 block">{unsoldBooks}</span>
        </div>
        {/* Expired Books */}
        <div className="premium-card p-4 bg-rose-50 border border-rose-100 shadow-sm">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Unsold by Admin</span>
          <span className="text-lg font-bold text-rose-900 mt-1 block">{expiredBooks}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SPECIFICATIONS */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 space-y-4">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2">
            Specifications
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Game Code</span>
              <span className="font-mono font-bold text-indigo-600">{game.gameCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Ticket Price</span>
              <span className="font-bold text-text-primary">₹{game.ticketPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Book Size</span>
              <span className="font-bold text-text-primary">{game.bookSize} Tickets</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Draw Date</span>
              <span className="font-bold text-text-primary">{game.drawDate} at {game.drawTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Sales Start Date</span>
              <span className="font-bold text-text-primary">{game.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Sales End Date</span>
              <span className="font-bold text-text-primary">{game.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <span className="font-bold text-indigo-600">{game.status}</span>
            </div>
            {game.description && (
              <div className="pt-2 border-t border-border-light">
                <span className="text-text-secondary block mb-1">Description</span>
                <p className="text-[11px] text-text-primary leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{game.description}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Link
              to={`/admin/generate-books?gameId=${game.id}`}
              className="flex-1 text-center bg-[#6366f1] hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors text-xs"
            >
              Upload Books
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 border border-rose-200 hover:border-rose-300 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATED BOOKS SUBTABLE */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-2 flex flex-col">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
            Generated Books ({totalBooks})
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {booksLoading && gameBooks.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-xs">Loading books...</div>
            ) : gameBooks.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-xs">
                No books uploaded for this game yet. Upload books using the button on the left.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-text-secondary uppercase font-bold border-b border-border-light">
                    <th className="py-2.5 px-3">Book ID</th>
                    <th className="py-2.5 px-3">Serial Number</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assigned Agent</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {gameBooks.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-text-primary">
                        <Link to={`/admin/books/${b.id}`} className="text-indigo-600 hover:underline">
                          {b.id}
                        </Link>
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-text-secondary">{b.serialNumber}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${b.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                            b.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                          }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-text-primary font-medium">{b.agentName || '-'}</td>
                      <td className="py-2 px-3 text-right">
                        {lockStatus?.is_locked && (b.status === 'Assigned' || b.status === 'In Progress') && (
                          <button
                            type="button"
                            onClick={() => handleUnlockBook(b)}
                            disabled={unlockingBookId === b.id}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[9px] font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Lock className="w-3 h-3" />
                            {unlockingBookId === b.id ? 'Updating...' : 'Unsold by Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {booksPagination.currentPage < booksPagination.lastPage && (
            <button
              onClick={() => fetchGameBooks(booksPagination.currentPage + 1)}
              disabled={booksLoading}
              className="mt-3 w-full py-2 text-[10px] font-semibold text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {booksLoading ? 'Loading...' : `Load More (${gameBooks.length} / ${booksPagination.total})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGameDetails;
