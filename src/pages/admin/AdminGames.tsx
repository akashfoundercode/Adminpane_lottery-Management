import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, BookOpen, CalendarDays, Clock, IndianRupee, ChevronRight, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/PageLoader';

export const AdminGames: React.FC = () => {
  const { games, gamesPagination, deleteGame, toggleGameStatus, fetchGames, loadingGames } = useAdmin();
  const { showToast } = useToast();

  const GAME_LOAD_LIMIT = 10000;

  React.useEffect(() => { fetchGames(GAME_LOAD_LIMIT, 0, false); }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const parseGameDate = (date: string, time = '00:00') => {
    const safeTime = time.split(':').slice(0, 2).join(':') || '00:00';
    const parsed = new Date(`${date}T${safeTime}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (date: string) => {
    const parsed = parseGameDate(date);
    if (!parsed) return date || '-';
    return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (time: string) => {
    const parsed = parseGameDate('2026-01-01', time);
    if (!parsed) return time || '-';
    return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getDrawLabel = (date: string, time: string, status: string) => {
    if (status === 'Completed') return 'Draw completed';
    if (status === 'Cancelled') return 'Draw cancelled';

    const draw = parseGameDate(date, time);
    if (!draw) return 'Date pending';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const drawDay = new Date(draw);
    drawDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((drawDay.getTime() - today.getTime()) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const filteredGames = useMemo(() => {
    const statusRank: Record<string, number> = { Live: 0, Upcoming: 1, Completed: 2, Cancelled: 3 };

    return games
      .filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.gameCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || game.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const statusDiff = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
        if (statusDiff !== 0) return statusDiff;

        const aTime = parseGameDate(a.drawDate, a.drawTime)?.getTime() ?? 0;
        const bTime = parseGameDate(b.drawDate, b.drawTime)?.getTime() ?? 0;
        return a.status === 'Completed' ? bTime - aTime : aTime - bTime;
      });
  }, [games, searchTerm, statusFilter]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedGameId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedGameId) {
      deleteGame(selectedGameId);
      showToast('Game deleted successfully.', 'success');
      setSelectedGameId(null);
    }
  };

  const handleStatusToggle = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    try {
      await toggleGameStatus(id);
      showToast(`Status updated for ${name}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update game status.', 'error');
    }
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    Live:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Upcoming:  { bg: 'bg-sky-50',      text: 'text-sky-700',     dot: 'bg-sky-500' },
    Completed: { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-500' },
    Cancelled: { bg: 'bg-rose-50',     text: 'text-rose-700',    dot: 'bg-rose-500' },
  };

  const statuses = ['All', 'Live', 'Upcoming', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Games Management</h2>
          <p className="text-xs text-text-secondary">Sorted by status and draw date so the next game is easy to find</p>
        </div>
        <Link
          to="/admin/games/create"
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Game</span>
        </Link>
      </div>

      {/* SEARCH + STATUS PILLS */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm p-4 space-y-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#6366f1] text-white shadow-sm'
                  : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
              }`}
            >
              {s === 'All' ? `All (${games.length})` : `${s} (${games.filter(g => g.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* GAME CARDS GRID */}
      {loadingGames ? <PageLoader /> : filteredGames.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light shadow-sm p-10 text-center flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-text-primary">No games found</p>
          <p className="text-[11px] text-text-secondary mt-0.5">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
          {filteredGames.map(game => {
            const sc = statusColors[game.status] || statusColors['Upcoming'];
            const hasBooks = (game.totalBooks || 0) > 0;
            const drawLabel = getDrawLabel(game.drawDate, game.drawTime, game.status);

            return (
              <div
                key={game.id}
                className={`group bg-white rounded-lg border border-border-light shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden flex flex-col ${hasBooks ? '' : 'opacity-75'}`}
              >
                {/* TOP COLOR BAR */}
                <div className={`h-1 w-full ${game.status === 'Live' ? 'bg-emerald-400' : game.status === 'Upcoming' ? 'bg-sky-400' : game.status === 'Completed' ? 'bg-violet-400' : 'bg-rose-400'}`} />

                <div className="p-3.5 flex flex-col gap-3 flex-1">
                  {/* TITLE ROW */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <img
                        src={game.image || 'game1.png'}
                        alt={game.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="font-mono text-[10px] font-bold text-indigo-600 tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                            {game.gameCode}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {game.status}
                          </span>
                        </div>
                        <h3 className="text-[13px] font-bold text-text-primary leading-tight line-clamp-2">{game.name}</h3>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-bold text-indigo-600">{drawLabel}</p>
                      <p className="text-[12px] font-bold text-text-primary">{formatDate(game.drawDate)}</p>
                      <p className="text-[10px] font-semibold text-text-secondary">{formatTime(game.drawTime)}</p>
                    </div>
                  </div>

                  {/* SCHEDULE + STATS ROW */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CalendarDays className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider">Sale End</span>
                      </div>
                      <span className="text-[11px] font-bold text-text-primary">{formatDate(game.endDate || game.drawDate)}</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider">Books</span>
                      </div>
                      <span className="text-[11px] font-bold text-text-primary">{(game.totalBooks || 0).toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <IndianRupee className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider">Ticket</span>
                      </div>
                      <span className="text-[11px] font-bold text-text-primary">₹{Number(game.ticketPrice || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-secondary">
                    <span>
                      Sale: <strong className="text-text-primary">{formatDate(game.startDate)}</strong> to <strong className="text-text-primary">{formatDate(game.endDate || game.drawDate)}</strong>
                    </span>
                    <span>
                      Size: <strong className="text-text-primary">{game.bookSize || '-'} tickets</strong>
                    </span>
                  </div>

                  {/* ACTIONS ROW */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-light mt-auto">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={e => handleStatusToggle(e, game.id, game.name)}
                        title="Toggle Status"
                        className="text-text-secondary hover:text-indigo-600 transition-colors"
                      >
                        {game.status === 'Live'
                          ? <ToggleRight className="w-4.5 h-4.5 text-emerald-500" />
                          : <ToggleLeft className="w-4.5 h-4.5" />}
                      </button>
                      <Link
                        to={`/admin/games/create?edit=${game.id}`}
                        title="Edit Game"
                        className="text-text-secondary hover:text-amber-500 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={e => handleDeleteClick(e, game.id)}
                        title="Delete"
                        className="text-text-secondary hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {hasBooks ? (
                      <Link
                        to={`/admin/games/${game.id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        View Books <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-300">
                        No Books <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOAD MORE */}
      {gamesPagination.hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchGames(GAME_LOAD_LIMIT, gamesPagination.currentPage * GAME_LOAD_LIMIT, true)}
            className="px-6 py-2.5 border border-border-light bg-white rounded-xl text-xs font-semibold text-text-primary hover:bg-slate-50 shadow-sm transition-colors"
          >
            Load More Games
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Game"
        description="Are you sure you want to delete this game? This action cannot be undone."
        type="danger"
        confirmText="Delete Game"
      />
    </div>
  );
};

export default AdminGames;
