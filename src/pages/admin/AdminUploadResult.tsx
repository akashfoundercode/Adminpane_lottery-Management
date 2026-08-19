import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Save, Check } from 'lucide-react';

interface AdminUploadResultProps {
  onUploaded?: () => void | Promise<void>;
}

export const AdminUploadResult: React.FC<AdminUploadResultProps> = ({ onUploaded }) => {
  const { games, createResult, publishResult, results } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedGameId, setSelectedGameId] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [title, setTitle] = useState('');
  const [resultImageFile, setResultImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync draw date when game changes
  useEffect(() => {
    const game = games.find(g => g.id === selectedGameId);
    if (game) {
      setDrawDate(game.drawDate);
    }
  }, [selectedGameId, games]);

  // Handle file upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResultImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      showToast('Image selected successfully.', 'success');
    }
  };

  const handleSave = async (publishImmediately: boolean) => {
    if (isSaving) return;
    if (!selectedGameId || !drawDate) {
      showToast('Please select a game.', 'error');
      return;
    }
    if (!title) {
      showToast('Please enter a result title.', 'error');
      return;
    }
    if (!resultImageFile) {
      showToast('Please upload a result board image.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      showToast('Uploading result sheet to server...', 'info');

      // Call context to create result
      await createResult({
        gameId: selectedGameId,
        drawDate,
        image: imageUrl,
        imageFile: resultImageFile,
        title: title
      });

      showToast(publishImmediately ? 'Result uploaded and published immediately!' : 'Result saved as Draft.', 'success');
      if (onUploaded) {
        await onUploaded();
      } else {
        navigate('/admin/results');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload result.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/results"
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Upload Draw Result</h2>
          <p className="text-xs text-text-secondary">Input game draw outcomes and upload the official board PDF or image sheet</p>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* FORM FIELDS */}
          <div className="md:col-span-7 space-y-4">
            {/* Result Title */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Result Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter result title (e.g. Daily Lottery Result)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-semibold"
              />
            </div>

            {/* Select Game */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Select Game <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-semibold cursor-pointer"
              >
                <option value="">Choose Game</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.gameCode})</option>
                ))}
              </select>
            </div>

            {/* Draw Date (Read-only sync) */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Draw Date
              </label>
              <input
                type="date"
                disabled
                value={drawDate}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-text-secondary font-semibold cursor-not-allowed"
              />
            </div>

            {/* Upload File Input */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Upload Result Board Image / PDF *
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-text-primary">Click to upload file</span>
                <span className="text-[10px] text-text-secondary mt-1">Supports PNG, JPG, JPEG (Max: 5MB)</span>
              </div>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="md:col-span-5 border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between min-h-[260px]">
            <div>
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">
                Result Sheet Preview
              </span>
              <div className="bg-white border rounded-xl overflow-hidden h-[180px] flex items-center justify-center text-slate-400 text-xs">
                {previewImage || imageUrl ? (
                  <img
                    src={previewImage || imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <span>No image uploaded</span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-text-secondary block mt-3 italic leading-normal">
              Note: Result sheets contain the winning matrix, prize distributions, and agent details. Make sure numbers are readable.
            </span>
          </div>
        </div>

        {/* BUTTON ACTION GATE */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
          <Link
            to="/admin/results"
            className="px-4 py-2 border border-border-light bg-white rounded-xl text-xs font-semibold text-text-secondary hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || !selectedGameId}
            className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-text-primary px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-text-secondary" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || !selectedGameId}
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Uploading...' : 'Publish Immediately'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadResult;
