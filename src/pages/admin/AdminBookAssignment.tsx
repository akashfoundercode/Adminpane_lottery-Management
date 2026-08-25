import React, { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { UserCheck, ShieldAlert, XCircle, Search, Calendar, CheckSquare, Square } from 'lucide-react';
import { Book } from '../../types';
import { apiUrl } from '../../config/api';
import { ValidatedInput } from '../../components/ui/ValidatedInput';

export const AdminBookAssignment: React.FC = () => {
  const { games, books, agents, assignBooks, revokeAssignment, fetchBooks, fetchGameLockStatus } = useAdmin();
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

  const [activeAssignedBooks, setActiveAssignedBooks] = useState<Book[]>([]);
  const [loadingActiveAssignments, setLoadingActiveAssignments] = useState(false);

  // Fetch available books for selected game
  const fetchAvailableBooks = (gameId: string) => {
    if (!gameId) { setAvailableBooks([]); setBookCount(''); return; }
    const token = localStorage.getItem('admin_token') || '';
    setLoadingBooks(true);
    setGameWindowExpired(false);
    Promise.all([
      fetch(apiUrl(`/api/v1/admin/books?game_id=${gameId}&status=available&page=1&limit=1000`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).then(r => r.json()),
      fetchGameLockStatus(gameId)
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
  };

  useEffect(() => {
    fetchAvailableBooks(selectedGameId);
  }, [selectedGameId]);

  // Load active assignments from server API & history
  const loadActiveAssignments = async () => {
    const token = localStorage.getItem('admin_token') || '';
    setLoadingActiveAssignments(true);
    try {
      const [resBooks, resHistory] = await Promise.all([
        fetch(apiUrl('/api/v1/admin/books?status=assigned&limit=1000'), {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(apiUrl('/api/v1/admin/book-assignments/history?limit=1000'), {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      const booksMap = new Map<string, Book>();

      if (resHistory?.success && resHistory.data) {
        const rawHistory: any[] = Array.isArray(resHistory.data.data) ? resHistory.data.data
          : Array.isArray(resHistory.data) ? resHistory.data : [];
        rawHistory.forEach((h: any) => {
          const apiStatus = String(h.status || '').toLowerCase();
          if (apiStatus === 'assigned' || apiStatus === 'active' || apiStatus === 'in progress' || apiStatus === 'in_progress') {
            const bookId = h.book?.book_id || h.book_id || `BK${h.id}`;
            const agentIdStr = String(h.agent?.agent_id || h.agent_id || '');
            const agentObj = agents.find(a => String(a.id) === agentIdStr);
            const agentName = h.agent?.agent_name || h.agent_name || agentObj?.name || 'Assigned Agent';
            const gameName = h.game?.game_name || h.book?.game?.game_name || games.find(g => String(g.id) === String(h.game_id || h.book?.game_id))?.name || 'Unknown Game';

            booksMap.set(bookId, {
              id: bookId,
              apiId: Number(h.book_id || h.book?.id || h.id),
              gameId: String(h.game_id || h.book?.game_id || ''),
              gameName,
              bookName: h.book?.book_name || bookId,
              agentId: agentIdStr,
              agentName,
              tickets: [],
              bookValue: 0,
              bookNumber: String(h.book?.id || h.id),
              serialNumber: h.book?.serial_number || h.serial_number || bookId,
              totalTickets: Number(h.game?.book_size || 10),
              soldTickets: 0,
              unsoldTickets: 0,
              assignedDate: h.assigned_at || h.assigned_date || h.created_at || '',
              expiryDate: '',
              status: 'Assigned'
            });
          }
        });
      }

      if (resBooks?.success && resBooks.data) {
        const rawBooks: any[] = Array.isArray(resBooks.data.data) ? resBooks.data.data
          : Array.isArray(resBooks.data) ? resBooks.data : [];
        rawBooks.forEach((b: any) => {
          const apiStatus = String(b.status || '').toLowerCase();
          if (apiStatus === 'assigned' || apiStatus === 'in progress' || apiStatus === 'in_progress') {
            const bookId = b.book_id || `BK${b.id}`;
            const agentIdStr = String(b.agent_id || '');
            const agentObj = agents.find(a => String(a.id) === agentIdStr);
            const agentName = b.agent?.agent_name || b.agent_name || agentObj?.name || 'Assigned Agent';
            const gameName = b.game?.game_name || games.find(g => String(g.id) === String(b.game_id))?.name || 'Unknown Game';

            booksMap.set(bookId, {
              id: bookId,
              apiId: Number(b.id),
              gameId: String(b.game_id),
              gameName,
              bookName: b.book_name || bookId,
              agentId: agentIdStr,
              agentName,
              tickets: [],
              bookValue: 0,
              bookNumber: String(b.id),
              serialNumber: b.book_id || `SN-${b.id}`,
              totalTickets: Number(b.game?.book_size || 10),
              soldTickets: 0,
              unsoldTickets: 0,
              assignedDate: b.assigned_at || b.created_at || '',
              expiryDate: '',
              status: 'Assigned'
            });
          }
        });
      }

      setActiveAssignedBooks(Array.from(booksMap.values()));
    } catch (e) {
      console.error('Failed to load active assignments:', e);
    } finally {
      setLoadingActiveAssignments(false);
    }
  };

  useEffect(() => {
    fetchBooks(1000, 1, false);
    loadActiveAssignments();
  }, [agents, games]);

  const filteredAvailableBooks = useMemo(() => {
    return availableBooks.filter(b =>
      b.id.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      (b.serialNumber && b.serialNumber.toLowerCase().includes(bookSearchTerm.toLowerCase()))
    );
  }, [availableBooks, bookSearchTerm]);

  const getAssignedTimestamp = (b: Book) => {
    if (b.assignedDate) {
      const t = new Date(b.assignedDate).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (b.createdDate) {
      const t = new Date(b.createdDate).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return b.apiId ? b.apiId * 1000 : 0;
  };

  // Current active assignments (Assigned / In Progress) sorted latest assigned FIRST
  const activeAssignments = useMemo(() => {
    const map = new Map<string, Book>();
    activeAssignedBooks.forEach(b => map.set(b.id, b));
    books.filter(b => b.status === 'Assigned' || b.status === 'In Progress').forEach(b => {
      if (!map.has(b.id)) map.set(b.id, b);
    });

    return Array.from(map.values()).sort((a, b) => {
      const timeA = getAssignedTimestamp(a);
      const timeB = getAssignedTimestamp(b);
      if (timeB !== timeA) {
        return timeB - timeA; // Latest timestamp FIRST
      }
      return (b.apiId ?? 0) - (a.apiId ?? 0); // Higher numeric ID first
    });
  }, [activeAssignedBooks, books]);

  const groupedActiveAssignments = useMemo(() => {
    const groups = new Map<string, { agentName: string; maxTime: number; books: Book[] }>();

    activeAssignments.forEach(book => {
      const agentName = book.agentName || 'Unassigned Agent';
      const bookTime = getAssignedTimestamp(book);
      const existing = groups.get(agentName);

      if (!existing) {
        groups.set(agentName, { agentName, maxTime: bookTime, books: [book] });
      } else {
        existing.books.push(book);
        if (bookTime > existing.maxTime) {
          existing.maxTime = bookTime;
        }
      }
    });

    // Agent groups sorted by maxTime descending (agent with newest assignment at top)
    return Array.from(groups.values())
      .sort((g1, g2) => g2.maxTime - g1.maxTime)
      .map(group => ({
        agentName: group.agentName,
        books: group.books.sort((b1, b2) => getAssignedTimestamp(b2) - getAssignedTimestamp(b1))
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
    setSelectedBookIds(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId);
      } else {
        if (prev.length >= 100) {
          showToast('Maximum 100 books can be selected at a time.', 'error');
          return prev;
        }
        return [...prev, bookId];
      }
    });
  };

  const handleSelectAllBooks = () => {
    if (selectedBookIds.length > 0) {
      setSelectedBookIds([]);
    } else {
      if (availableBooks.length > 100) {
        setSelectedBookIds(availableBooks.slice(0, 100).map(b => String(b.apiId ?? b.id)));
        showToast('Selected maximum limit of 100 books.', 'info');
      } else {
        setSelectedBookIds(availableBooks.map(b => String(b.apiId ?? b.id)));
      }
    }
  };

  const handleSelectBookCount = () => {
    if (bookCount === '' || bookCount < 1) {
      showToast('Please enter a book count greater than 0.', 'error');
      return;
    }
    if (bookCount > 100) {
      showToast('Maximum 100 books can be selected at a time.', 'error');
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
    if (selectedBookIds.length > 100) {
      showToast('Maximum 100 books can be selected at a time.', 'error');
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
      setBookCount('');
      setActiveAssignmentsPage(1);

      // Hard refresh page immediately as requested by user
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || 'Assignment failed.', 'error');
    }
  };

  const handleRevoke = async (bookId: string) => {
    if (confirm(`Are you sure you want to revoke assignment for Book ${bookId}?`)) {
      try {
        await revokeAssignment(bookId);
        showToast(`Revoked assignment for Book ${bookId}.`, 'success');
        window.location.reload();
      } catch (err: any) {
        showToast(err.message || 'Failed to revoke assignment.', 'error');
      }
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
                    Select Books ({selectedBookIds.length}/100 max)
                  </label>
                  {availableBooks.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllBooks}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      {selectedBookIds.length > 0 ? 'Deselect All' : (availableBooks.length > 100 ? 'Select First 100' : 'Select All')}
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
                      Book Count (Max 100)
                      <ValidatedInput
                        type="number"
                        min="1"
                        max={Math.min(100, availableBooks.length)}
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
