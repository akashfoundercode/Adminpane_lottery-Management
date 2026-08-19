import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Eye, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const AdminGames: React.FC = () => {
  const { games, gamesPagination, deleteGame, toggleGameStatus, fetchGames } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Fetch games on mount
  React.useEffect(() => {
    fetchGames(10, 0, false);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.gameCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || game.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [games, searchTerm, statusFilter]);

  // Pagination
  const paginatedGames = filteredGames;

  const handleDeleteClick = (id: string) => {
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

  const handleStatusToggle = (id: string, name: string) => {
    toggleGameStatus(id);
    showToast(`Status updated for game ${name}.`, 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Games Management</h2>
          <p className="text-xs text-text-secondary">View, create, edit and manage lucky draw games</p>
        </div>
        <Link
          to="/admin/games/create"
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Game</span>
        </Link>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Status */}
        <div className="relative w-full sm:w-48 sm:ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Live">Live</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* LIST TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No games found</p>
            <p className="text-[11px] text-text-secondary mt-0.5">Try adjusting your search term or filter options</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Game Code</th>
                  <th className="py-3.5 px-4">Game Name</th>
                  <th className="py-3.5 px-4">Ticket Price</th>
                  <th className="py-3.5 px-4 text-center">Book Size</th>
                  <th className="py-3.5 px-4 text-center">Total Books</th>
                  <th className="py-3.5 px-4">Draw Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedGames.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{game.gameCode}</td>
                    <td className="py-3 px-4 font-semibold text-text-primary">{game.name}</td>
                    <td className="py-3 px-4 font-bold text-text-primary">₹{game.ticketPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-text-secondary font-medium">{game.bookSize}</td>
                    <td className="py-3 px-4 text-center text-text-secondary font-medium">{game.totalBooks || 0}</td>
                    <td className="py-3 px-4 font-medium text-text-primary flex items-center gap-1.5 mt-1.5">
                      <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                      <span>{game.drawDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${game.status === 'Live' ? 'bg-emerald-100 text-emerald-800' :
                          game.status === 'Upcoming' ? 'bg-sky-100 text-sky-800' :
                            game.status === 'Completed' ? 'bg-violet-100 text-violet-800' :
                              'bg-rose-100 text-rose-800'
                        }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleStatusToggle(game.id, game.name)}
                          title="Toggle Status"
                          className="text-text-secondary hover:text-indigo-600 transition-colors"
                        >
                          {game.status === 'Live' ? (
                            <ToggleRight className="w-[18px] h-[18px] text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-[18px] h-[18px]" />
                          )}
                        </button>
                        <Link
                          to={`/admin/games/${game.id}`}
                          title="View Details"
                          className="text-text-secondary hover:text-indigo-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(game.id)}
                          title="Delete"
                          className="text-text-secondary hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {gamesPagination.hasMore && (
          <div className="px-4 py-3 border-t border-border-light bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-text-secondary">Showing {games.length} of {gamesPagination.total || games.length} games</span>
            <button onClick={() => fetchGames(itemsPerPage, gamesPagination.currentPage * itemsPerPage, true)} className="px-4 py-2 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50">View More</button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Game"
        description="Are you sure you want to delete this game? This will permanently remove all generated books and assignments for this game. This action cannot be undone."
        type="danger"
        confirmText="Delete Game"
      />
    </div>
  );
};

export default AdminGames;
