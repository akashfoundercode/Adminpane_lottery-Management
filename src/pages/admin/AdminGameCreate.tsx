import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export const AdminGameCreate: React.FC = () => {
  const { createGame, updateGame, games } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const editGame = editId ? games.find(g => g.id === editId) : null;

  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [ticketPrice, setTicketPrice] = useState(100);
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
      setTicketPrice(editGame.ticketPrice || 100);
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
    if (ticketPrice < 1) {
      showToast('Ticket Prize must be at least 1.', 'error');
      return;
    }

    const normalizedGameCode = (gameCode || generateGameCode(name)).toUpperCase();

    try {
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
          facebookLiveUrl
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
          facebookLiveUrl
        });
        showToast('Game created successfully!', 'success');
      }
      navigate('/admin/games');
    } catch (err: any) {
      showToast(err.message || 'Failed to save game.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/games"
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">{editGame ? 'Edit Game' : 'Create New Game'}</h2>
          <p className="text-xs text-text-secondary">{editGame ? `Editing: ${editGame.name}` : 'Add a new lottery draw with specifications'}</p>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Game Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Game Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diwali Super Draw"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Ticket Prize <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                placeholder="e.g. 100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Start Date */}
            <div>
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
            <div>
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
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Draw Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={today}
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Draw Time */}
            <div>
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

            {/* Description */}
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
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
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                YouTube Live Stream URL
              </label>
              <input
                type="url"
                value={youtubeLiveUrl}
                onChange={(e) => setYoutubeLiveUrl(e.target.value)}
                placeholder="https://youtube.com/live/demo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary"
              />
            </div>

            {/* Facebook Live URL */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Facebook Live Stream URL
              </label>
              <input
                type="url"
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
              className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editGame ? 'Update Game' : 'Save Game'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGameCreate;
