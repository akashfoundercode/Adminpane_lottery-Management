import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Upload, Trophy, Ticket, Image as ImageIcon, Info, Trash2, Loader2 } from 'lucide-react';
import { GamePrize } from '../../types';
import { ValidatedInput } from '../../components/ui/ValidatedInput';

export const AdminGameCreate: React.FC = () => {
  const { createGame, updateGame, games } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const editGame = editId ? games.find(g => g.id === editId) : null;

  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [ticketPrice, setTicketPrice] = useState<number | ''>('');
  const [bookSize, setBookSize] = useState(10);
  const [drawDate, setDrawDate] = useState('');
  const [drawTime, setDrawTime] = useState('18:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Upcoming' | 'Live'>('Upcoming');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('https://youtube.com/live/demo');
  const [facebookLiveUrl, setFacebookLiveUrl] = useState('https://facebook.com/live/demo');
  const [prizes, setPrizes] = useState<GamePrize[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const generateGameCode = (gameName: string) => {
    const prefix = gameName
      .trim()
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'GM';

    return `${prefix}${Date.now().toString().slice(-4)}`;
  };

  useEffect(() => {
    if (editGame) {
      setName(editGame.name || '');
      setGameCode(editGame.gameCode || '');
      setTicketPrice(editGame.ticketPrice || '');
      setBookSize(editGame.bookSize || 10);
      setDrawDate(editGame.drawDate || '');
      setDrawTime(editGame.drawTime?.slice(0, 5) || '18:00');
      setStartDate(editGame.startDate || '');
      setEndDate(editGame.endDate || '');
      setStatus((editGame.status === 'Live' ? 'Live' : 'Upcoming') as any);
      setDescription(editGame.description || '');
      setImage(editGame.image || '');
      setYoutubeLiveUrl(editGame.youtubeLiveUrl || 'https://youtube.com/live/demo');
      setFacebookLiveUrl(editGame.facebookLiveUrl || 'https://facebook.com/live/demo');
      setPrizes(editGame.prizes || []);
    }
  }, [editId, games.length]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrizeImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPrizes(prev => prev.map((prize, itemIndex) => itemIndex === index
      ? { ...prize, imageFile: file, image: reader.result as string }
      : prize));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !drawDate || !startDate || !endDate) {
      showToast('Please fill in all required game fields.', 'error');
      return;
    }
    if (startDate < today || endDate < today || drawDate < today) {
      showToast('Past dates are not allowed. Please select today or a future date.', 'error');
      return;
    }
    if (endDate < startDate) {
      showToast('Sale end date cannot be before sale start date.', 'error');
      return;
    }
    if (drawDate < endDate) {
      showToast('Draw date must be on or after the sale end date.', 'error');
      return;
    }
    if (drawDate === today) {
      const [hours, minutes] = drawTime.split(':').map(Number);
      const drawDateTime = new Date();
      drawDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      if (drawDateTime <= new Date()) {
        showToast('Past draw time is not allowed for today.', 'error');
        return;
      }
    }
    if (ticketPrice === '' || ticketPrice < 1) {
      showToast('Ticket Prize must be at least 1.', 'error');
      return;
    }
    if (!editId && !imageFile) {
      showToast('Game Image: Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
      return;
    }

    if (prizes.length === 0) {
      showToast('Please add at least one prize before saving the game.', 'error');
      return;
    }

    const normalizedGameCode = (gameCode || generateGameCode(name)).toUpperCase();
    const normalizedPrizes = prizes.filter(prize => prize.prizeName.trim()).map((prize, index) => ({
      ...prize,
      rank: Number(prize.rank) || index + 1,
      prizeName: prize.prizeName.trim()
    }));

    if (normalizedPrizes.length === 0) {
      showToast('Please enter a name for at least one prize before saving the game.', 'error');
      return;
    }

    const prizeWithoutImage = normalizedPrizes.findIndex(prize => !prize.imageFile && !prize.image);
    if (prizeWithoutImage !== -1) {
      showToast(`Prize ${prizeWithoutImage + 1} Image: Please upload a prize image.`, 'error');
      return;
    }

    try {
      setIsSaving(true);
      if (editId && editGame) {
        await updateGame(editId, {
          name,
          gameCode: normalizedGameCode,
          ticketPrice: Number(ticketPrice),
          bookSize: Number(bookSize),
          drawDate,
          drawTime,
          startDate,
          endDate,
          status,
          description,
          image: image || editGame.image || 'game1.png',
          imageFile: imageFile || undefined,
          youtubeLiveUrl,
          facebookLiveUrl,
          prizes: normalizedPrizes
        });
        showToast('Game updated successfully!', 'success');
      } else {
        await createGame({
          name,
          gameCode: normalizedGameCode,
          ticketPrice: Number(ticketPrice),
          bookSize: Number(bookSize),
          totalBooks: 0,
          drawDate,
          drawTime,
          startDate,
          endDate,
          status,
          description,
          image: image || 'game1.png',
          imageFile: imageFile || undefined,
          youtubeLiveUrl,
          facebookLiveUrl,
          prizes: normalizedPrizes
        });
        showToast('Game created successfully!', 'success');
      }
      navigate('/admin/games');
    } catch (err: any) {
      showToast(err.message || 'Failed to save game.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPrize = (prize: GamePrize, index: number) => (
    <div key={prize.id || index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
      <label className="text-[10px] font-semibold text-text-secondary uppercase sm:col-span-1">
        Rank
        <input type="number" min="1" value={prize.rank} onChange={e => setPrizes(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, rank: Number(e.target.value) } : item))} className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-text-primary" />
      </label>
      <label className="text-[10px] font-semibold text-text-secondary uppercase sm:col-span-1">
        Prize Name
        <ValidatedInput type="text" validation="requiredText" value={prize.prizeName} onChange={e => setPrizes(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, prizeName: e.target.value } : item))} placeholder="First Prize" className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-text-primary" />
      </label>
      <div className="text-[10px] font-semibold text-text-secondary uppercase sm:col-span-2">
        Prize Image
        <label className="mt-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-2 cursor-pointer text-[10px] text-text-secondary">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => handlePrizeImageChange(index, e)} className="sr-only" />
          <ImageIcon className="w-3.5 h-3.5 text-violet-500" /> {prize.imageFile ? prize.imageFile.name : prize.image ? 'Current image' : 'Choose image'}
        </label>
        {prize.image && <img src={prize.image} alt="Prize preview" className="mt-2 h-12 w-12 object-cover rounded-lg border border-slate-200" />}
      </div>
      <button type="button" aria-label="Remove prize" onClick={() => setPrizes(prev => prev.filter((_, itemIndex) => itemIndex !== index))} className="justify-self-end p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  );

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-6">
      <div className="flex items-center gap-3 px-1">
        <Link
          to="/admin/games"
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">{editGame ? 'Edit Game' : 'Create New Game'}</h2>
          <p className="text-xs text-text-secondary">{editGame ? `Editing: ${editGame.name}` : 'Configure your lottery draw details and prizes'}</p>
        </div>
      </div>

      <div className="bg-transparent">
        <form onSubmit={handleSubmit} className="space-y-5 md:max-h-[calc(100vh-150px)] md:overflow-y-auto md:pr-2">
          <div
            className="relative md:min-h-[980px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] gap-4 lg:gap-5 items-start bg-white border border-border-light rounded-2xl shadow-sm p-4 sm:p-5"
          >
            {/* Game Name */}
            <div className="md:col-span-1 md:col-start-1 lg:col-span-1 lg:col-start-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-9 w-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center"><Info className="w-4 h-4" /></span>
                <div><h3 className="text-sm font-bold text-violet-700">Basic Information</h3><p className="text-[10px] text-text-secondary mt-0.5">Enter the basic details for your lottery game</p></div>
              </div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Game Name <span className="text-rose-500">*</span>
              </label>
              <ValidatedInput
                type="text"
                required
                validation="requiredText"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diwali Super Draw"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Ticket Price */}
            <div className="md:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Ticket Prize <span className="text-rose-500">*</span>
              </label>
              <ValidatedInput
                type="number"
                min="1"
                required
                validation="positiveNumber"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Start Date */}
            <div className="md:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Sale Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* End Date */}
            <div className="md:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Sale End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Draw Date */}
            <div className="md:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Draw Date <span className="text-rose-500">*</span>
              </label>
              <ValidatedInput
                type="date"
                required
                min={today}
                validation="dateAfter"
                compareTo={endDate}
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Draw Time */}
            <div className="md:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Draw Time
              </label>
              <input
                type="time"
                value={drawTime}
                min={drawDate === today ? new Date().toTimeString().slice(0, 5) : undefined}
                onChange={(e) => setDrawTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Game Prizes */}
            <div className="md:absolute md:top-4 md:bottom-4 md:left-1/2 md:right-4 lg:left-[40%] bg-white border border-border-light rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center"><Trophy className="w-4 h-4" /></span>
                  <div><h3 className="text-sm font-bold text-violet-700">Game Prizes</h3><p className="text-[10px] text-text-secondary mt-0.5">Add prizes awarded by book or ticket number</p></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setPrizes(prev => [...prev, { rank: prev.filter(prize => prize.prizeType === 'book_winner').length + 1, prizeName: '', prizeType: 'book_winner' }])} className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap"><Trophy className="w-3.5 h-3.5" /> Add Book Prize</button>
                  <button type="button" onClick={() => setPrizes(prev => [...prev, { rank: prev.filter(prize => prize.prizeType === 'ticket_winner').length + 1, prizeName: '', prizeType: 'ticket_winner' }])} className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap"><Ticket className="w-3.5 h-3.5" /> Add Ticket Prize</button>
                </div>
              </div>
              {prizes.length === 0 ? (
                <p className="text-xs text-text-secondary bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">No prizes added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[820px] overflow-y-auto pr-2 items-start">
                  {(['book_winner', 'ticket_winner'] as const).map((prizeType) => {
                    const groupedPrizes = prizes
                      .map((prize, index) => ({ prize, index }))
                      .filter(({ prize }) => prize.prizeType === prizeType);
                    return (
                      <section key={prizeType} className={`space-y-3 rounded-2xl p-3 sm:p-4 border shadow-sm ${prizeType === 'book_winner' ? 'border-violet-100 bg-violet-50/30' : 'border-sky-100 bg-sky-50/30'}`}>
                        <div className="flex items-center justify-between gap-2 border-b border-white/80 pb-3">
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            {prizeType === 'book_winner' ? 'Book Winner Prizes' : 'Ticket Winner Prizes'}
                          </h4>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${prizeType === 'book_winner' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
                            {groupedPrizes.length} {groupedPrizes.length === 1 ? 'Prize' : 'Prizes'}
                          </span>
                        </div>
                        {groupedPrizes.length === 0 ? (
                          <p className="text-[11px] text-text-secondary">No {prizeType === 'book_winner' ? 'book' : 'ticket'} prizes added.</p>
                        ) : (
                          groupedPrizes.map(({ prize, index }) => renderPrize(prize, index))
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-1 md:col-start-1 lg:col-span-1 lg:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Details about prizes, conditions, etc..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Game Image */}
            <div className="md:col-span-1 md:col-start-1 lg:col-span-1 lg:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Game Image / Banner
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {image ? (
                  <div className="flex flex-col items-center">
                    <img src={image} alt="Game preview" className="h-20 object-contain rounded-lg mb-2 border border-slate-200" />
                    <span className="text-xs text-indigo-600 font-semibold">{imageName}</span>
                    <span className="text-[10px] text-text-secondary mt-1">Click or drag to replace image</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-text-primary">Click to upload game image</span>
                    <span className="text-[10px] text-text-secondary mt-1">Supports PNG, JPG, JPEG (Max: 5MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* YouTube Live URL */}
            <div className="md:col-start-1 lg:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                YouTube Live Stream URL
              </label>
              <ValidatedInput
                type="url"
                validation="url"
                value={youtubeLiveUrl}
                onChange={(e) => setYoutubeLiveUrl(e.target.value)}
                placeholder="https://youtube.com/live/demo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Facebook Live URL */}
            <div className="md:col-start-1 lg:col-start-1">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Facebook Live Stream URL
              </label>
              <ValidatedInput
                type="url"
                validation="url"
                value={facebookLiveUrl}
                onChange={(e) => setFacebookLiveUrl(e.target.value)}
                placeholder="https://facebook.com/live/demo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
            <Link
              to="/admin/games"
              className="px-4 py-2 border border-border-light bg-white rounded-xl text-xs font-semibold text-text-secondary hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? (editGame ? 'Updating...' : 'Saving...') : (editGame ? 'Update Game' : 'Save Game')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGameCreate;
