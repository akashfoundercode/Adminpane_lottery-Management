import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { UserCheck, ShieldAlert, XCircle, Search, Calendar, CheckSquare, Square } from 'lucide-react';
import { Book } from '../../types';
import { apiUrl } from '../../config/api';
import { ValidatedInput } from '../../components/ui/ValidatedInput';

export const AdminBookAssignment: React.FC = () => {
  const { games, books, agents, assignBooks, revokeAssignment, fetchGameLockStatus } = useAdmin();
  const { showToast } = useToast();

  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [expiryDate] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [bookCount, setBookCount] = useState<number | ''>('');
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [gameWindowExpired, setGameWindowExpired] = useState(false);
  const [activeAssignmentsPage, setActiveAssignmentsPage] = useState(1);
  const activeAssignmentsPerPage = 20;

  // Derived agent
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Fetch available books from API when game changes
  useEffect(() => {
    if (!selectedGameId) { setAvailableBooks([]); setBookCount(''); return; }
    const token = localStorage.getItem('admin_token') || '';
    setLoadingBooks(true);
    setGameWindowExpired(false);
    Promise.all([
      fetch(apiUrl(`/api/v1/admin/books?game_id=${selectedGameId}&status=available&page=1&limit=200`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).then(r => r.json()),
      fetchGameLockStatus(selectedGameId)
    ])
      .then(([json, lockStatus]) => {
        if (lockStatus.is_locked) {
          setGameWindowExpired(true);
          setAvailableBooks([]);
          return;
        }
        const raw: any[] = Array.isArray(json.data?.data) ? json.data.data
          : Array.isArray(json.data) ? json.data : [];
        const mapped: Book[] = raw
          .filter((b: any) => String(b.status).toLowerCase() === 'available')
          .map((b: any) => ({
            id: b.book_id || `BK${b.id}`,
            apiId: Number(b.id),
            gameId: String(b.game_id),
            gameName: b.game?.game_name || '',
            bookName: b.book_name || b.book_id || `BK${b.id}`,
            agentId: '',
            agentName: '',
            tickets: [],
            bookValue: 0,
            bookNumber: String(b.id),
            serialNumber: b.book_id || `SN-${b.id}`,
            totalTickets: Number(b.game?.book_size || 10),
            soldTickets: 0,
            unsoldTickets: 0,
            assignedDate: '',
            expiryDate: '',
            createdDate: b.created_at || '',
            status: 'Available' as const
          }));
        setAvailableBooks(mapped);
      })
      .catch(() => {
        setAvailableBooks([]);
        setGameWindowExpired(false);
      })
      .finally(() => setLoadingBooks(false));
  }, [selectedGameId]);

  const filteredAvailableBooks = useMemo(() => {
    return availableBooks.filter(b =>
      b.id.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      (b.serialNumber && b.serialNumber.toLowerCase().includes(bookSearchTerm.toLowerCase()))
    );
  }, [availableBooks, bookSearchTerm]);

  // Current active assignments (Assigned / In Progress)
  const activeAssignments = useMemo(() => {
    return books.filter(b => b.status === 'Assigned' || b.status === 'In Progress');
  }, [books]);

  const groupedActiveAssignments = useMemo(() => {
    const groups = new Map<string, Book[]>();
    activeAssignments.forEach(book => {
      const agentName = book.agentName || 'Unassigned Agent';
      const group = groups.get(agentName) || [];
      group.push(book);
      groups.set(agentName, group);
    });

    return Array.from(groups.entries())
      .sort(([firstAgent], [secondAgent]) => firstAgent.localeCompare(secondAgent))
      .map(([agentName, agentBooks]) => ({
        agentName,
        books: agentBooks.sort((firstBook, secondBook) =>
          (firstBook.serialNumber || firstBook.id).localeCompare(
            secondBook.serialNumber || secondBook.id,
            undefined,
            { numeric: true, sensitivity: 'base' }
          )
        )
      }));
  }, [activeAssignments]);

  const paginatedActiveAssignments = useMemo(() => {
    const orderedAssignments = groupedActiveAssignments.flatMap(group => group.books);
    const start = (activeAssignmentsPage - 1) * activeAssignmentsPerPage;
    return orderedAssignments.slice(start, start + activeAssignmentsPerPage);
  }, [groupedActiveAssignments, activeAssignmentsPage]);

  const paginatedAssignmentGroups = useMemo(() => {
    const groups = new Map<string, Book[]>();
    paginatedActiveAssignments.forEach(book => {
      const agentName = book.agentName || 'Unassigned Agent';
      groups.set(agentName, [...(groups.get(agentName) || []), book]);
    });
    return Array.from(groups.entries()).map(([agentName, agentBooks]) => ({ agentName, books: agentBooks }));
  }, [paginatedActiveAssignments]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(activeAssignments.length / activeAssignmentsPerPage));
    setActiveAssignmentsPage(page => Math.min(page, lastPage));
  }, [activeAssignments.length]);

  // Toggle book selection
  const handleToggleBook = (bookId: string) => {
    setSelectedBookIds(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAllBooks = () => {
    if (selectedBookIds.length === availableBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(availableBooks.map(b => String(b.apiId ?? b.id)));
    }
  };

  const handleSelectBookCount = () => {
    if (bookCount === '' || bookCount < 1) {
      showToast('Please enter a book count greater than 0.', 'error');
      return;
    }
    if (bookCount > availableBooks.length) {
      showToast(`Only ${availableBooks.length} available books can be selected.`, 'error');
      return;
    }
    setSelectedBookIds(availableBooks.slice(0, bookCount).map(book => String(book.apiId ?? book.id)));
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) {
      showToast('Please select a game.', 'error');
      return;
    }
    if (gameWindowExpired) {
      showToast('This game\'s 1-hour live update window has expired. Select a new game to assign books.', 'error');
      return;
    }
    if (selectedBookIds.length === 0) {
      showToast('Please select at least one book to assign.', 'error');
      return;
    }
    if (!selectedAgentId) {
      showToast('Please select an agent.', 'error');
      return;
    }

    try {
      showToast('Processing assignment on server...', 'info');
      await assignBooks(selectedGameId, selectedBookIds, selectedAgentId);
      showToast(`Successfully assigned ${selectedBookIds.length} books to ${selectedAgent?.name}.`, 'success');
      setSelectedBookIds([]);
    } catch (err: any) {
      showToast(err.message || 'Assignment failed.', 'error');
    }
  };

  const handleRevoke = (bookId: string) => {
    if (confirm(`Are you sure you want to revoke assignment for Book ${bookId}?`)) {
      revokeAssignment(bookId);
      showToast(`Revoked assignment for Book ${bookId}.`, 'success');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Book Assignment</h2>
        <p className="text-xs text-text-secondary">Assign generated available lottery books to registered agents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ASSIGNMENT FORM */}
        <div className="bg-white border border-border-light rounded-xl shadow-sm p-6 lg:col-span-5 space-y-5">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2">
            New Assignment Form
          </h3>

          <form onSubmit={handleAssign} className="space-y-4">
            {/* Select Game */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Select Game
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => { setSelectedGameId(e.target.value); setSelectedBookIds([]); setBookSearchTerm(''); }}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-semibold cursor-pointer"
              >
                <option value="">Choose Game</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.gameCode})</option>
                ))}
              </select>
            </div>

            {/* Select Agent */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Assign to Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-semibold cursor-pointer"
              >
                <option value="">Choose Agent</option>
                {agents.filter(a => a.status === 'Active').map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.agentType})</option>
                ))}
              </select>
            </div>

            {selectedAgent && (
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Agent Type
                </label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary select-none">
                  {selectedAgent.agentType}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={selectedBookIds.length === 0 || !selectedAgentId}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign {selectedBookIds.length} Books</span>
            </button>

            {/* Select Available Books */}
            {selectedGameId && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Select Books ({selectedBookIds.length} selected)
                  </label>
                  {availableBooks.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllBooks}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      {selectedBookIds.length === availableBooks.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {/* Book Search Bar */}
                {availableBooks.length > 0 && (
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search book by ID or Serial..."
                      value={bookSearchTerm}
                      onChange={(e) => setBookSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                )}

                {availableBooks.length > 0 && (
                  <div className="flex items-end gap-2 mb-3">
                    <label className="flex-1 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Book Count
                      <ValidatedInput
                        type="number"
                        min="1"
                        max={availableBooks.length}
                        value={bookCount}
                        onChange={(e) => setBookCount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 10"
                        validation="positiveNumber"
                        className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectBookCount}
                      className="shrink-0 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      Select Books
                    </button>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-[480px] overflow-y-auto space-y-1.5">
                  {loadingBooks ? (
                    <div className="text-center py-6 text-text-secondary text-[11px] italic">Loading books...</div>
                  ) : gameWindowExpired ? (
                    <div className="text-center py-6 text-rose-600 text-[11px] font-semibold">
                      This game's 1-hour live update window has expired. Select a new game.
                    </div>
                  ) : availableBooks.length === 0 ? (
                    <div className="text-center py-6 text-text-secondary text-[11px] italic">
                      No available books found. Upload books first!
                    </div>
                  ) : filteredAvailableBooks.length === 0 ? (
                    <div className="text-center py-6 text-text-secondary text-[11px] italic">
                      No matching books found.
                    </div>
                  ) : (
                    filteredAvailableBooks.map(b => {
                      const selectionId = String(b.apiId ?? b.id);
                      const isSelected = selectedBookIds.includes(selectionId);
                      return (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => handleToggleBook(selectionId)}
                          className={`flex items-center gap-2 w-full p-2 rounded-lg text-left text-xs transition-colors border ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold' : 'bg-white border-slate-100 text-slate-700'
                            }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <div className="flex-1 flex justify-between">
                            <span>{b.id}</span>
                            <span className="font-mono text-[10px] text-slate-400">{b.serialNumber}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </form>
        </div>

        {/* ACTIVE ASSIGNMENTS SUBTABLE */}
        <div className="premium-card p-6 bg-white border border-border-light lg:col-span-7 flex flex-col">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
            Active Assignments ({activeAssignments.length})
          </h3>

          <div className="flex-1 overflow-x-auto">
            {activeAssignments.length === 0 ? (
              <div className="text-center py-10 text-xs text-text-secondary italic">
                No active assignments. Form a new assignment on the left!
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Book ID</th>
                    <th className="py-2.5 px-3">Game Name</th>
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3">Agent Type</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {paginatedAssignmentGroups.map(({ agentName, books: agentBooks }) => (
                    <React.Fragment key={agentName}>
                      <tr className="bg-indigo-50/60 border-y border-indigo-100">
                        <td colSpan={5} className="py-2 px-3 text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                          {agentName} <span className="font-medium text-indigo-500">({agentBooks.length} books)</span>
                        </td>
                      </tr>
                      {agentBooks.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-text-primary">{b.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-text-primary max-w-[130px] truncate">{b.gameName}</td>
                          <td className="py-2.5 px-3 font-medium text-text-primary">{b.agentName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${b.id.includes('BK110') ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                              {b.id.includes('BK110') ? 'Third Party' : 'First Party'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleRevoke(b.id)}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {activeAssignments.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-light pt-4 text-[11px] text-text-secondary">
              <span>
                Showing {(activeAssignmentsPage - 1) * activeAssignmentsPerPage + 1}-{Math.min(activeAssignmentsPage * activeAssignmentsPerPage, activeAssignments.length)} of {activeAssignments.length} assignments
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeAssignmentsPage === 1}
                  onClick={() => setActiveAssignmentsPage(page => Math.max(1, page - 1))}
                  className="rounded-lg border border-border-light bg-white px-3 py-1.5 font-semibold text-text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-bold text-indigo-700">Page {activeAssignmentsPage}</span>
                <button
                  type="button"
                  disabled={activeAssignmentsPage >= Math.ceil(activeAssignments.length / activeAssignmentsPerPage)}
                  onClick={() => setActiveAssignmentsPage(page => page + 1)}
                  className="rounded-lg border border-border-light bg-white px-3 py-1.5 font-semibold text-text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookAssignment;
