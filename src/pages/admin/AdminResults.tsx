import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Result } from '../../types';
import {
  Plus, Trash2, Calendar, Globe, AlertCircle, UploadCloud, X,
  Eye, ChevronDown, ChevronUp, Trophy, Image as ImageIcon, Save, RotateCcw, Pencil, ListFilter
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { PageLoader } from '../../components/PageLoader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultPrizeRow {
  rank: number;
  prize_name: string;
  book_prize_amount: string;
  ticket_prize_amount: string;
  prize_image: File | null;
  prize_image_preview: string;
}

type PrizeCategory = 'book' | 'ticket';

const rankLabel = (r: number) => ['1st', '2nd', '3rd'][r - 1] || `${r}th`;

const formatErrorMessage = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message : String(error || '');
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    const errors = parsed.errors || parsed.error;
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const firstKey = Object.keys(errors)[0];
      const firstValue = errors[firstKey];
      const firstMessage = Array.isArray(firstValue) ? firstValue[0] : firstValue;
      if (firstMessage) {
        const field = firstKey
          .replace(/\[[^\]]*\]/g, '')
          .replace(/_/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, char => char.toUpperCase());
        return field ? `${field}: ${firstMessage}` : String(firstMessage);
      }
    }
    return parsed.message || fallback;
  } catch {
    return raw.length > 180 ? `${raw.slice(0, 180)}...` : raw;
  }
};

const emptyPrizeRow = (rank: number): ResultPrizeRow => ({
  rank,
  prize_name: '',
  book_prize_amount: '',
  ticket_prize_amount: '',
  prize_image: null,
  prize_image_preview: ''
});

// ─── Upload / Create Modal ────────────────────────────────────────────────────

const UploadModal: React.FC<{
  onClose: () => void;
  onSaved: () => void;
  editResult?: Result | null;
}> = ({ onClose, onSaved, editResult }) => {
  const { games, createResult, updateResult } = useAdmin();
  const { showToast } = useToast();
  const isEdit = !!editResult;
  const existingPrizes = editResult?.prizes || [];
  const existingBookPrizes = existingPrizes.filter(p =>
    p.prize_type === 'book_winner' || (!p.prize_type && (p.book_prize_name || Number(p.book_prize_amount) > 0))
  );
  const existingTicketPrizes = existingPrizes.filter(p =>
    p.prize_type === 'ticket_winner' || (!p.prize_type && (p.ticket_prize_name || Number(p.ticket_prize_amount) > 0))
  );

  const [gameId, setGameId] = useState(editResult?.gameId || '');
  const [title, setTitle] = useState(editResult?.title || '');
  const [resultDate, setResultDate] = useState(editResult?.drawDate || '');
  const [resultImage, setResultImage] = useState<File | null>(null);
  const [resultImagePreview, setResultImagePreview] = useState(editResult?.image || '');
  const [bookPrizes, setBookPrizes] = useState<ResultPrizeRow[]>(
    existingBookPrizes.length > 0
      ? existingBookPrizes.map(p => ({ rank: p.rank, prize_name: p.book_prize_name || p.prize_name || '', book_prize_amount: String(p.book_prize_amount || ''), ticket_prize_amount: '', prize_image: null, prize_image_preview: (p as any).prize_image_url || (typeof p.prize_image === 'string' ? p.prize_image : '') }))
      : [emptyPrizeRow(1)]
  );
  const [ticketPrizes, setTicketPrizes] = useState<ResultPrizeRow[]>(
    existingTicketPrizes.length > 0
      ? existingTicketPrizes.map(p => ({ rank: p.rank, prize_name: p.ticket_prize_name || p.prize_name || '', book_prize_amount: '', ticket_prize_amount: String(p.ticket_prize_amount || ''), prize_image: null, prize_image_preview: (p as any).prize_image_url || (typeof p.prize_image === 'string' ? p.prize_image : '') }))
      : [emptyPrizeRow(1)]
  );
  const [saving, setSaving] = useState(false);

  const selectedGame = games.find(g => g.id === gameId);

  const handleResultImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setResultImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateCategoryPrizes = (category: PrizeCategory, updater: (prev: ResultPrizeRow[]) => ResultPrizeRow[]) => {
    if (category === 'book') {
      setBookPrizes(updater);
      return;
    }
    setTicketPrizes(updater);
  };

  const handlePrizeImage = (category: PrizeCategory, idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCategoryPrizes(category, prev => prev.map((p, i) =>
        i === idx ? { ...p, prize_image: file, prize_image_preview: reader.result as string } : p
      ));
    };
    reader.readAsDataURL(file);
  };

  const addPrize = (category: PrizeCategory) => updateCategoryPrizes(category, prev => [
      ...prev,
      emptyPrizeRow(prev.length + 1)
    ]);

  const removePrize = (category: PrizeCategory, idx: number) => updateCategoryPrizes(category, prev =>
    prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, rank: i + 1 }))
  );

  const updatePrize = (category: PrizeCategory, idx: number, field: keyof ResultPrizeRow, value: any) =>
    updateCategoryPrizes(category, prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));

  const handleSave = async () => {
    if (!gameId || !title || !resultDate) {
      showToast('Game, title and result date are required.', 'error');
      return;
    }
    if (!isEdit && !resultImage) {
      showToast('Please upload a result board image.', 'error');
      return;
    }
    try {
      setSaving(true);
      const typedPrizes = [
  ...bookPrizes
    .filter(
      p =>
        p.prize_name ||
        Number(p.book_prize_amount) > 0 ||
        p.prize_image ||
        p.prize_image_preview
    )
    .map((p, index) => ({
      rank: p.rank || index + 1,
      prize_type: 'book_winner' as const,
      prize_name:
        p.prize_name || `${rankLabel(p.rank || index + 1)} Prize`,
      book_prize_amount: Number(p.book_prize_amount) || 0,
      prize_image: p.prize_image instanceof File ? p.prize_image : null,
    })),

  ...ticketPrizes
    .filter(
      p =>
        p.prize_name ||
        Number(p.ticket_prize_amount) > 0 ||
        p.prize_image ||
        p.prize_image_preview
    )
    .map((p, index) => ({
      rank: p.rank || index + 1,
      prize_type: 'ticket_winner' as const,
      prize_name:
        p.prize_name || `${rankLabel(p.rank || index + 1)} Prize`,
      ticket_prize_amount: Number(p.ticket_prize_amount) || 0,
      prize_image: p.prize_image instanceof File ? p.prize_image : null,
    })),
];
      if (isEdit && editResult) {
        await updateResult(
          editResult.id,
          { gameId, drawDate: resultDate, image: resultImagePreview || '', imageFile: resultImage || undefined, title },
          typedPrizes
        );
        showToast('Result updated successfully.', 'success');
      } else {
        await createResult(
          { gameId, drawDate: resultDate, image: resultImagePreview || '', imageFile: resultImage || undefined, title },
          typedPrizes
        );
        showToast('Result saved successfully.', 'success');
      }
      onSaved();
    } catch (err: any) {
      showToast(formatErrorMessage(err, 'Failed to save result.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderPrizeCategory = (category: PrizeCategory, rows: ResultPrizeRow[]) => {
    const isBook = category === 'book';
    return (
      <div className="bg-white border border-border-light rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              {isBook ? 'Book Winner Prize' : 'Ticket Winner Prize'}
            </p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              Add {rankLabel(1)}, {rankLabel(2)}, {rankLabel(3)}, {rankLabel(4)}, {rankLabel(5)}... prizes
            </p>
          </div>
          <button
            onClick={() => addPrize(category)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              isBook
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Add Rank
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((prize, idx) => (
            <div key={`${category}-${idx}`} className="border border-slate-100 bg-slate-50/60 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Trophy className={`w-3.5 h-3.5 ${isBook ? 'text-emerald-500' : 'text-sky-500'}`} />
                  {rankLabel(prize.rank)} Prize
                </span>
                {rows.length > 1 && (
                  <button onClick={() => removePrize(category, idx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Prize Name</label>
                  <input
                    type="text"
                    value={prize.prize_name}
                    onChange={e => updatePrize(category, idx, 'prize_name', e.target.value)}
                    placeholder={isBook ? 'e.g. Book Bumper Prize' : 'e.g. Ticket Bumper Prize'}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary"
                  />
                </div>
              </div>

              {selectedGame && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg px-2.5 py-2 border border-slate-100">
                    <span className="text-[10px] text-text-secondary font-semibold block">{isBook ? 'Total Books Sold' : 'Total Tickets'}</span>
                    <span className="text-xs font-bold text-text-primary">
                      {isBook ? selectedGame.totalBooks : selectedGame.totalBooks * selectedGame.bookSize} (auto)
                    </span>
                  </div>
                  <div className="bg-white rounded-lg px-2.5 py-2 border border-slate-100">
                    <span className="text-[10px] text-text-secondary font-semibold block">{isBook ? 'Book Price' : 'Ticket Price'}</span>
                    <span className="text-xs font-bold text-text-primary">
                      ₹{isBook ? selectedGame.ticketPrice * selectedGame.bookSize : selectedGame.ticketPrice}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Prize Image (optional)</label>
                <label className="flex items-center gap-2 border border-dashed border-slate-200 hover:border-indigo-300 bg-white rounded-lg px-3 py-2 cursor-pointer transition-colors relative">
                  <input type="file" accept="image/*" onChange={e => handlePrizeImage(category, idx, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {prize.prize_image_preview ? (
                    <img src={prize.prize_image_preview} alt="prize" className="h-12 w-12 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-[11px] text-text-secondary">{prize.prize_image ? prize.prize_image.name : prize.prize_image_preview ? 'Current image' : 'Upload image'}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-4xl bg-[#F7F9FC] rounded-2xl shadow-2xl p-5 sm:p-7 my-4">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-lg bg-white border border-border-light text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-[18px] font-bold text-text-primary font-display mb-1">{isEdit ? 'Edit Result' : 'Upload Draw Result'}</h2>
        <p className="text-xs text-text-secondary mb-6">Fill result details and add separate rank-wise prizes for book winners and ticket winners</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — Result Info */}
          <div className="space-y-4">
            <div className="bg-white border border-border-light rounded-xl p-4 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Result Info</p>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Summer Lucky Draw Result"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary"
                />
              </div>

              {/* Game */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Game <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gameId}
                  onChange={e => setGameId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary cursor-pointer"
                >
                  <option value="">Select Game</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.gameCode})</option>
                  ))}
                </select>
              </div>

              {/* Result Date */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Result Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={resultDate}
                  onChange={e => setResultDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-text-primary"
                />
              </div>

              {/* Result Image */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">Result Board Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-xl p-4 cursor-pointer transition-colors relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleResultImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {resultImagePreview ? (
                    <img src={resultImagePreview} alt="preview" className="h-24 object-contain rounded" />
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                      <span className="text-[11px] text-text-secondary">Click to upload image</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Auto-filled game info */}
            {selectedGame && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Book Price</span>
                  <span className="text-sm font-bold text-indigo-700">₹{selectedGame.ticketPrice * selectedGame.bookSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Ticket Price</span>
                  <span className="text-sm font-bold text-indigo-700">₹{selectedGame.ticketPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Total Books</span>
                  <span className="text-sm font-bold text-indigo-700">{selectedGame.totalBooks}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Total Tickets</span>
                  <span className="text-sm font-bold text-indigo-700">{selectedGame.totalBooks * selectedGame.bookSize}</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Prize Rows */}
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {renderPrizeCategory('book', bookPrizes)}
            {renderPrizeCategory('ticket', ticketPrizes)}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-border-light">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-light bg-white rounded-xl text-xs font-semibold text-text-secondary hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Result' : 'Save Result'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminResults: React.FC = () => {
  const { games, results, resultsPagination, deleteResult, toggleResultStatus, restoreResult, fetchResults, loadingResults } = useAdmin();
  const { showToast } = useToast();

  React.useEffect(() => { fetchResults(10, 0, false); }, []);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editResult, setEditResult] = useState<Result | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState('all');

  const gameResultFilters = React.useMemo(() => {
    const byGame = new Map<string, { id: string; name: string; code?: string; count: number }>();

    results.forEach(result => {
      const existing = byGame.get(result.gameId);
      byGame.set(result.gameId, {
        id: result.gameId,
        name: existing?.name || result.gameName || 'Unknown Game',
        code: existing?.code,
        count: (existing?.count || 0) + 1
      });
    });

    games.forEach(game => {
      const existing = byGame.get(game.id);
      if (existing) {
        byGame.set(game.id, {
          ...existing,
          name: game.name || existing.name,
          code: game.gameCode
        });
      }
    });

    return Array.from(byGame.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [games, results]);

  const filteredResults = selectedGameId === 'all'
    ? results
    : results.filter(result => result.gameId === selectedGameId);

  const selectGameFilter = (gameId: string) => {
    setSelectedGameId(gameId);
    setExpandedId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteResult(deleteId);
      showToast('Result deleted.', 'success');
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleResultStatus(id);
      showToast('Status updated.', 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreResult(id);
      showToast('Result restored.', 'success');
    } catch {
      showToast('Failed to restore result.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Result Management</h2>
          <p className="text-xs text-text-secondary">Manage draw results and prize distributions</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Result
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white border border-border-light rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                <ListFilter className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Game Results</p>
                <p className="text-[10px] text-text-secondary">Select a game to view only its uploaded results</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-text-secondary bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
              {filteredResults.length} shown
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => selectGameFilter('all')}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                selectedGameId === 'all'
                  ? 'bg-[#6366f1] text-white border-[#6366f1] shadow-sm'
                  : 'bg-white text-text-secondary border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>All Games</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                selectedGameId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-text-secondary'
              }`}>
                {results.length}
              </span>
            </button>

            {gameResultFilters.map(game => (
              <button
                key={game.id}
                onClick={() => selectGameFilter(game.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                  selectedGameId === game.id
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${selectedGameId === game.id ? 'bg-emerald-300' : 'bg-indigo-400'}`} />
                <span className="max-w-[180px] truncate">{game.name}</span>
                {game.code && <span className={selectedGameId === game.id ? 'text-white/60' : 'text-slate-400'}>{game.code}</span>}
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  selectedGameId === game.id ? 'bg-white/15 text-white' : 'bg-slate-100 text-text-secondary'
                }`}>
                  {game.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
        {loadingResults ? (
          <div className="p-8"><PageLoader /></div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No Results Yet</p>
            <p className="text-xs text-text-secondary mt-1">Upload a result to get started.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-text-primary">No Results for This Game</p>
            <p className="text-xs text-text-secondary mt-1">Choose another game or upload a result for this game.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border-light">
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Title</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Game</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Result Image</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Result Date</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Created At</th>
                  <th className="text-left px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Updated At</th>
                  <th className="text-right px-4 py-3 font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredResults.map(result => (
                  <React.Fragment key={result.id}>
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-mono text-[11px] text-indigo-600 font-bold whitespace-nowrap">#{result.id}</td>

                      {/* Title */}
                      <td className="px-4 py-3 font-semibold text-text-primary max-w-[160px] truncate whitespace-nowrap">
                        {result.title || '—'}
                      </td>

                      {/* Game */}
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{result.gameName}</td>

                      {/* Result Image */}
                      <td className="px-4 py-3">
                        {result.image ? (
                          <a href={result.image} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-semibold">
                            <Eye className="w-3.5 h-3.5" /> View
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Result Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {result.drawDate || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          result.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${result.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          {result.status}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                        {result.publishedDate ? new Date(result.publishedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* Updated At */}
                      <td className="px-4 py-3 text-text-secondary whitespace-nowrap">—</td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                            title="View Prizes"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            {expandedId === result.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditResult(result)}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(result.id)}
                            title={result.status === 'Published' ? 'Set Inactive' : 'Set Active'}
                            className={`p-1.5 rounded transition-colors ${
                              result.status === 'Published'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                          {result.deletedAt && (
                            <button
                              onClick={() => handleRestore(result.id)}
                              title="Restore"
                              className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(result.id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Prize Rows */}
                    {expandedId === result.id && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50/80 px-6 py-4 border-b border-border-light">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Prize Distribution
                          </p>
                          {result.prizes && result.prizes.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <div className="bg-white border border-slate-100 rounded-xl p-3 overflow-x-auto">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2">Book Winner Prize</p>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-left">
                                      {['Rank', 'Prize Name', 'Prize Image'].map(h => (
                                        <th key={h} className="pb-2 pr-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {result.prizes.filter(p => p.prize_type === 'book_winner').map(p => (
                                      <tr key={`book-${p.id ?? p.rank}`} className="text-text-secondary">
                                        <td className="py-2 pr-4 font-bold text-text-primary whitespace-nowrap">{rankLabel(p.rank)}</td>
                                        <td className="py-2 pr-4 text-text-primary font-semibold whitespace-nowrap">{p.prize_name || '—'}</td>
                                        <td className="py-2 pr-4 whitespace-nowrap">
                                          {p.prize_image
                                            ? <img src={String(p.prize_image)} alt="prize" className="h-10 w-10 object-cover rounded-lg border border-slate-200" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                            : <span className="text-slate-400">—</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-white border border-slate-100 rounded-xl p-3 overflow-x-auto">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-2">Ticket Winner Prize</p>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-left">
                                      {['Rank', 'Prize Name', 'Prize Image'].map(h => (
                                        <th key={h} className="pb-2 pr-4 font-bold text-text-secondary uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {result.prizes.filter(p => p.prize_type === 'ticket_winner').map(p => (
                                      <tr key={`ticket-${p.id ?? p.rank}`} className="text-text-secondary">
                                        <td className="py-2 pr-4 font-bold text-text-primary whitespace-nowrap">{rankLabel(p.rank)}</td>
                                        <td className="py-2 pr-4 text-text-primary font-semibold whitespace-nowrap">{p.prize_name || '—'}</td>
                                        <td className="py-2 pr-4 whitespace-nowrap">
                                          {p.prize_image
                                            ? <img src={String(p.prize_image)} alt="prize" className="h-10 w-10 object-cover rounded-lg border border-slate-200" onError={e => { e.currentTarget.style.display = 'none'; }} />
                                            : <span className="text-slate-400">—</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No prize data available for this result.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Load More */}
      {resultsPagination.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchResults(10, resultsPagination.currentPage * 10, true)}
            className="px-5 py-2 border border-border-light bg-white rounded-xl text-xs font-semibold text-text-primary hover:bg-slate-50 shadow-sm"
          >
            Load More
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Result"
        description="Are you sure you want to delete this result? This action cannot be undone."
        type="danger"
        confirmText="Delete Result"
      />

      {/* Upload / Edit Modal */}
      {(isUploadOpen || editResult) && (
        <UploadModal
          editResult={editResult}
          onClose={() => { setIsUploadOpen(false); setEditResult(null); }}
          onSaved={async () => {
            await fetchResults();
            setIsUploadOpen(false);
            setEditResult(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminResults;
