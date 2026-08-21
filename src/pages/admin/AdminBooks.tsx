import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, Eye, AlertCircle, UploadCloud, X } from 'lucide-react';
import AdminGenerateBooks from './AdminGenerateBooks';
import { PageLoader } from '../../components/PageLoader';

export const AdminBooks: React.FC = () => {
    const { books, booksPagination, games, fetchBooks, loadingBooks } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [gameFilter, setGameFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const LIMIT = 50;
    const PAGE_WINDOW = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [windowStart, setWindowStart] = useState(1);

    const totalPages = booksPagination.lastPage || 1;

    useEffect(() => {
        fetchBooks(LIMIT, 1, false);
    }, []);

    const filteredBooks = useMemo(() => books.filter(book => {
        const query = searchTerm.toLowerCase();
        return (book.id.toLowerCase().includes(query) ||
            (book.serialNumber || '').toLowerCase().includes(query) ||
            (book.agentName || '').toLowerCase().includes(query)) &&
            (gameFilter === 'All' || book.gameId === gameFilter) &&
            (statusFilter === 'All' || book.status === statusFilter);
    }), [books, searchTerm, gameFilter, statusFilter]);

    const resetList = () => { setCurrentPage(1); setWindowStart(1); fetchBooks(LIMIT, 1, false); };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        fetchBooks(LIMIT, page, false);
    };

    const handleWindowPrev = () => {
        const newStart = Math.max(1, windowStart - PAGE_WINDOW);
        setWindowStart(newStart);
        goToPage(newStart);
    };

    const handleWindowNext = () => {
        const newStart = windowStart + PAGE_WINDOW;
        setWindowStart(newStart);
        goToPage(newStart);
    };

    const visiblePages = Array.from(
        { length: Math.min(PAGE_WINDOW, totalPages - windowStart + 1) },
        (_, i) => windowStart + i
    );

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary font-display">Books Management</h2>
                    <p className="text-xs text-text-secondary">Search, view and manage all generated ticket books</p>
                </div>
                <button onClick={() => setIsUploadOpen(true)} className="inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors">
                    <UploadCloud className="w-4 h-4" /> Upload Books
                </button>
            </div>

            {/* Game Filter Pills */}
            <div className="flex flex-wrap gap-2 bg-white px-4 pt-4 pb-2 rounded-xl border border-border-light shadow-sm">
                <button
                    onClick={() => { setGameFilter('All'); resetList(); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        gameFilter === 'All'
                            ? 'bg-[#6366f1] text-white'
                            : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                    }`}
                >
                    All Games
                </button>
                {games.map(game => (
                    <button
                        key={game.id}
                        onClick={() => { setGameFilter(game.id); resetList(); }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                            gameFilter === game.id
                                ? 'bg-[#6366f1] text-white'
                                : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                        }`}
                    >
                        {game.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-border-light shadow-sm">
                <div className="relative">
                    <input type="text" placeholder="Search by ID, SN, Agent..." value={searchTerm} onChange={event => { setSearchTerm(event.target.value); resetList(); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-slate-400" />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="relative">
                    <select value={gameFilter} onChange={event => { setGameFilter(event.target.value); resetList(); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary appearance-none">
                        <option value="All">All Games</option>
                        {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
                    </select>
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); resetList(); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary appearance-none">
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
                {loadingBooks ? <PageLoader /> : filteredBooks.length === 0 ? (
                    <div className="p-8 text-center"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-xs font-semibold text-text-primary">No books found</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead><tr className="bg-slate-50/50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold"><th className="py-3.5 px-4">Book ID</th><th className="py-3.5 px-4">Game</th><th className="py-3.5 px-4">Serial Number</th><th className="py-3.5 px-4 text-center">Book No</th><th className="py-3.5 px-4 text-right">Total Tickets</th><th className="py-3.5 px-4 text-right">Sold Tickets</th><th className="py-3.5 px-4 text-right">Unsold Tickets</th><th className="py-3.5 px-4">Status</th><th className="py-3.5 px-4">Assigned Agent</th><th className="py-3.5 px-4 text-center">Action</th></tr></thead>
                            <tbody className="divide-y divide-border-light">
                                {filteredBooks.map(book => <tr key={book.id} className="hover:bg-slate-50/30"><td className="py-3 px-4 font-bold text-text-primary">{book.id}</td><td className="py-3 px-4 font-semibold text-text-primary">{book.gameName}</td><td className="py-3 px-4 font-mono text-text-secondary">{book.serialNumber || '-'}</td><td className="py-3 px-4 text-center text-text-secondary">{book.bookNumber || '-'}</td><td className="py-3 px-4 text-right text-text-secondary">{book.tickets.length}</td><td className="py-3 px-4 text-right font-semibold text-emerald-600">{book.status === 'Sold' ? book.tickets.length : 0}</td><td className="py-3 px-4 text-right font-semibold text-rose-600">{book.status === 'Unsold' || book.status === 'Unsold by Admin' ? book.tickets.length : 0}</td><td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${book.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' : book.status === 'Available' ? 'bg-blue-100 text-blue-800' : book.status === 'Unsold' ? 'bg-amber-100 text-amber-800' : book.status === 'Assigned' || book.status === 'In Progress' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'}`}>{book.status}</span></td><td className="py-3 px-4 text-text-primary">{book.agentName || '-'}</td><td className="py-3 px-4 text-center"><Link to={`/admin/books/${book.id}`} title="View Details" className="inline-flex p-1.5 text-text-secondary hover:text-indigo-600"><Eye className="w-4 h-4" /></Link></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
                {booksPagination.total > 0 && (
                    <div className="px-4 py-3 border-t border-border-light bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-text-secondary">
                            Showing {(currentPage - 1) * LIMIT + 1}–{Math.min(currentPage * LIMIT, booksPagination.total)} of {booksPagination.total} books
                        </span>
                        <div className="flex items-center gap-1">
                            <button onClick={handleWindowPrev} disabled={windowStart === 1} className="px-2.5 py-1.5 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                            {visiblePages.map(page => (
                                <button key={page} onClick={() => goToPage(page)} className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-semibold transition-colors ${
                                    page === currentPage
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'border-border-light bg-white text-text-primary hover:bg-slate-50'
                                }`}>{page}</button>
                            ))}
                            <button onClick={handleWindowNext} disabled={windowStart + PAGE_WINDOW > totalPages} className="px-2.5 py-1.5 border border-border-light bg-white rounded-lg text-[10px] font-semibold text-text-primary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                        </div>
                    </div>
                )}
            </div>

            {isUploadOpen && <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8" onMouseDown={event => { if (event.target === event.currentTarget) setIsUploadOpen(false); }}><div className="relative w-full max-w-5xl bg-[#F7F9FC] rounded-2xl shadow-2xl p-4 sm:p-6"><button type="button" onClick={() => setIsUploadOpen(false)} aria-label="Close upload books modal" className="absolute right-5 top-5 z-10 p-2 rounded-lg bg-white border border-border-light text-text-secondary"><X className="w-4 h-4" /></button><AdminGenerateBooks onUploaded={async () => { await fetchBooks(LIMIT, 1, false); setIsUploadOpen(false); }} /></div></div>}
        </div>
    );
};

export default AdminBooks;
