import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AlertCircle, Calendar, CheckCircle2, Filter, RefreshCw, Search, Unlock, XCircle } from 'lucide-react';
import { PageLoader } from '../../components/PageLoader';

export const AdminSoldUnsold: React.FC = () => {
    const { books, booksTotal, games, booksPagination, agents, fetchBooks, updateBookStatus, unlockBookByAdmin, loadingBooks } = useAdmin();
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = useState<'All' | 'Sold' | 'Unsold' | 'Unsold by Admin'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [gameFilter, setGameFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const currentPageRef = React.useRef(1);
    const [pendingStatus, setPendingStatus] = useState<{ bookId: string; status: 'Sold' | 'Unsold' } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [unlockingBookId, setUnlockingBookId] = useState<string | null>(null);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchBooks(1000, 1, false);
            setLastRefreshed(new Date());
            showToast('Sold / Unsold books refreshed.', 'info');
        } catch {
            showToast('Failed to refresh books.', 'error');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBooks(1000, 1, false);
        setLastRefreshed(new Date());

        if (!autoRefreshEnabled) return;

        const refreshInterval = window.setInterval(() => {
            fetchBooks(1000, currentPageRef.current, false).then(() => {
                setLastRefreshed(new Date());
            });
        }, 5000); // Fast 5-second auto-refresh

        return () => window.clearInterval(refreshInterval);
    }, [autoRefreshEnabled]);

    const getAgentName = (agentId?: string, agentName?: string) => {
        if (agentName) return agentName;
        const agent = agents.find(item => item.id === agentId || String(item.apiId) === agentId);
        return agent?.name || '-';
    };

    const soldUnsoldHistory = useMemo(() => {
        return books.filter(book => {
            const soldUnsoldStatus = book.status;
            const query = searchTerm.toLowerCase();
            const resolvedAgentName = getAgentName(book.agentId, book.agentName);
            const matchesSearch = [book.id, book.bookName, resolvedAgentName, book.agentId]
                .filter(Boolean)
                .some(value => value!.toLowerCase().includes(query));
            const matchesStatus = statusFilter === 'All' || soldUnsoldStatus === statusFilter;
            const matchesGame = gameFilter === 'All' || book.gameName === gameFilter;
            const matchesAgent = agentFilter === 'All' || book.agentId === agentFilter;
            return (soldUnsoldStatus === 'Sold' || soldUnsoldStatus === 'Unsold' || soldUnsoldStatus === 'Unsold by Admin') &&
                matchesSearch && matchesStatus && matchesGame && matchesAgent;
        });
    }, [books, agents, searchTerm, statusFilter, gameFilter, agentFilter]);

    const handleStatusChange = async () => {
        if (!pendingStatus) return;
        setIsUpdating(true);
        try {
            await updateBookStatus(pendingStatus.bookId, pendingStatus.status);
            showToast(`Book marked as ${pendingStatus.status}.`, 'success');
            setPendingStatus(null);
            await fetchBooks(1000, 1, false);
            setLastRefreshed(new Date());
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update book status.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUnlockBook = async (book: typeof books[number]) => {
        setUnlockingBookId(book.id);
        try {
            await unlockBookByAdmin(book.apiId ?? book.id);
            showToast(`Book ${book.id} unlocked for the agent.`, 'success');
            await fetchBooks(1000, booksPagination.currentPage, false);
            setLastRefreshed(new Date());
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to unlock book.', 'error');
        } finally {
            setUnlockingBookId(null);
        }
    };

    return (
        <>
            <div className="space-y-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-[20px] font-bold text-text-primary font-display flex items-center gap-2">
                            Sold / Unsold Books
                            {(loadingBooks || isRefreshing) && (
                                <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" aria-label="Refreshing..." />
                            )}
                        </h2>
                        <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                            Books updated by agents through the Sold or Unsold API
                            {lastRefreshed && (
                                <span className="font-mono text-[11px] text-slate-400">
                                    • Updated: {lastRefreshed.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setAutoRefreshEnabled(prev => !prev)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${autoRefreshEnabled
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {autoRefreshEnabled ? 'Auto Refresh (5s)' : 'Auto Refresh OFF'}
                        </button>

                        <button
                            type="button"
                            onClick={handleManualRefresh}
                            disabled={loadingBooks || isRefreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${(loadingBooks || isRefreshing) ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-border-light shadow-sm">
                    <div className="relative self-start">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={searchTerm}
                            onChange={event => setSearchTerm(event.target.value)}
                            placeholder="Search book, agent or ID..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-text-primary"
                        />
                    </div>
                    <div className="relative self-start">
                        <select value={gameFilter} onChange={event => setGameFilter(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs appearance-none text-text-primary">
                            <option value="All">All Games</option>
                            {games.map(game => <option key={game.id} value={game.name}>{game.name}</option>)}
                        </select>
                        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative self-start">
                        <select value={agentFilter} onChange={event => setAgentFilter(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs appearance-none text-text-primary">
                            <option value="All">All Agents</option>
                            {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                        </select>
                        <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        {(['All', 'Sold', 'Unsold', 'Unsold by Admin'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${statusFilter === status ? 'bg-indigo-600 text-white' : 'text-text-secondary hover:bg-white'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                    {loadingBooks && books.length > 0 && (
                        <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/70 pt-20 backdrop-blur-[1px]" role="status" aria-label="Refreshing books">
                            <PageLoader />
                        </div>
                    )}
                    {loadingBooks && books.length === 0 ? (
                        <PageLoader />
                    ) : soldUnsoldHistory.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                            <p className="text-xs font-semibold text-text-primary">No Sold or Unsold books found</p>
                            <p className="text-[11px] text-text-secondary mt-0.5">Agent status updates will appear here after the API succeeds.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                                        <th className="py-3.5 px-4">S. No.</th>
                                        <th className="py-3.5 px-4">Agent Name</th>
                                        <th className="py-3.5 px-4">Book ID</th>
                                        <th className="py-3.5 px-4">Serial Number</th>
                                        <th className="py-3.5 px-4">Book Name</th>
                                        <th className="py-3.5 px-4">Game Name</th>
                                        <th className="py-3.5 px-4">Updated Date</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Change Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {soldUnsoldHistory.map((book, index) => {
                                        const status = book.status;
                                        return (
                                            <tr key={book.id} className="hover:bg-slate-50/30">
                                                <td className="py-3 px-4 font-semibold text-text-secondary">{index + 1}</td>
                                                <td className="py-3 px-4 font-semibold text-text-primary">{getAgentName(book.agentId, book.agentName)}</td>
                                                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{book.id}</td>
                                                <td className="py-3 px-4 font-mono text-text-secondary">{book.serialNumber || '-'}</td>
                                                <td className="py-3 px-4 font-medium text-text-primary">{book.bookName || book.id}</td>
                                                <td className="py-3 px-4 text-text-primary">{book.gameName || '-'}</td>
                                                <td className="py-3 px-4 text-text-secondary">
                                                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{book.status === 'Sold' ? ((book as any).soldDate || '-') : ((book as any).unsoldDate || '-')}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${status === 'Sold' ? 'bg-emerald-100 text-emerald-800' : status === 'Unsold by Admin' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {status === 'Sold' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => setPendingStatus({ bookId: book.id, status: 'Sold' })}
                                                            disabled={status === 'Sold' || status === 'Unsold by Admin'}
                                                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-bold hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            Sold
                                                        </button>
                                                        <button
                                                            onClick={() => setPendingStatus({ bookId: book.id, status: 'Unsold' })}
                                                            disabled={status === 'Unsold' || status === 'Unsold by Admin'}
                                                            className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[9px] font-bold hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            {status === 'Unsold by Admin' ? 'Locked' : 'Unsold'}
                                                        </button>
                                                        {status === 'Unsold by Admin' && (
                                                            <button
                                                                onClick={() => handleUnlockBook(book)}
                                                                disabled={unlockingBookId === book.id}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 text-sky-700 text-[9px] font-bold hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                <Unlock className="w-3 h-3" />
                                                                {unlockingBookId === book.id ? 'Unlocking...' : 'Unlock'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {booksPagination.hasMore && (
                <div className="flex justify-center border-t border-border-light pt-4">
                    <button
                        onClick={() => {
                            const nextPage = currentPage + 1;
                            currentPageRef.current = nextPage;
                            setCurrentPage(nextPage);
                            fetchBooks(10, nextPage, true);
                        }}
                        className="px-4 py-2 border border-border-light bg-white rounded-lg text-xs font-semibold text-text-primary hover:bg-slate-50"
                    >
                        View More
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={pendingStatus !== null}
                onClose={() => !isUpdating && setPendingStatus(null)}
                onConfirm={handleStatusChange}
                title={`Mark this book as ${pendingStatus?.status || 'updated'}?`}
                description="The admin status API will update this book and refresh the Sold / Unsold list."
            />
        </>
    );
};

export default AdminSoldUnsold;
