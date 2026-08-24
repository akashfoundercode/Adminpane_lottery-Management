import React, { useEffect, useState } from 'react';
import { Edit3, ImagePlus, Save, Trash2, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/PageLoader';
import { StaticBanner } from '../../types';
import { FieldError } from '../../components/ui/FieldError';

export const AdminStaticBanners: React.FC = () => {
    const { fetchStaticBanners, createStaticBanner, updateStaticBanner, deleteStaticBanner } = useAdmin();
    const { showToast } = useToast();
    const [banners, setBanners] = useState<StaticBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [editing, setEditing] = useState<StaticBanner | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [formError, setFormError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            setBanners(await fetchStaticBanners());
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to load static banners.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setFile(null);
        setTitle('');
        setLink('');
        setEditing(null);
        setEditFile(null);
        setFormError('');
    };

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) {
            setFormError('Please select a banner image.');
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            const created = await createStaticBanner(file, title.trim(), link.trim());
            setBanners(prev => [created, ...prev]);
            resetForm();
            showToast('Static banner uploaded successfully.', 'success');
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Failed to upload static banner.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            const updated = await updateStaticBanner(editing.id, { file: editFile || undefined, title: editing.title || '', link: editing.link || '', status: editing.status || 'active' });
            setBanners(prev => prev.map(item => item.id === editing.id ? updated : item));
            resetForm();
            showToast('Static banner updated successfully.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to update static banner.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (banner: StaticBanner) => {
        if (!window.confirm('Delete this static banner?')) return;
        try {
            await deleteStaticBanner(banner.id);
            setBanners(prev => prev.filter(item => item.id !== banner.id));
            showToast('Static banner deleted successfully.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete static banner.', 'error');
        }
    };

    return (
        <div className="space-y-6 font-sans">
            <div>
                <h2 className="text-[20px] font-bold text-text-primary font-display">Static Banners</h2>
                <p className="text-xs text-text-secondary">These banners appear when no game is live.</p>
            </div>

            <form onSubmit={handleCreate} className="bg-white border border-border-light rounded-xl shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-border-light pb-3"><ImagePlus className="w-4 h-4 text-indigo-600" /><h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Upload Static Banner</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="md:col-span-1 flex items-center justify-center min-h-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-text-secondary cursor-pointer hover:border-indigo-400">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFile(event.target.files?.[0] || null)} className="sr-only" />
                        {file ? file.name : 'Choose image'}
                    </label>
                    <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Banner title (optional)" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary" />
                    <input type="url" value={link} onChange={event => setLink(event.target.value)} placeholder="Click URL (optional)" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-text-primary" />
                </div>
                <FieldError message={formError} />
                <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold"><ImagePlus className="w-3.5 h-3.5" />{saving ? 'Uploading...' : 'Upload Banner'}</button>
            </form>

            <div className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
                {loading ? <PageLoader /> : banners.length === 0 ? <div className="p-10 text-center text-xs text-text-secondary">No static banners uploaded.</div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
                    {banners.map(banner => <div key={String(banner.id)} className="border border-border-light rounded-xl overflow-hidden bg-white">
                        <img src={banner.image} alt={banner.title || 'Static banner'} className="w-full h-36 object-cover bg-slate-100" />
                        <div className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-bold text-text-primary truncate">{banner.title || 'Untitled banner'}</p><p className="text-[10px] text-text-secondary truncate">{banner.link || 'No click URL'}</p></div><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${banner.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{banner.status || 'active'}</span></div>
                            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing({ ...banner })} aria-label="Edit static banner" className="p-1.5 rounded-lg bg-slate-50 text-text-secondary hover:text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleDelete(banner)} aria-label="Delete static banner" className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button></div>
                        </div>
                    </div>)}
                </div>}
            </div>

            {editing && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"><form onSubmit={handleUpdate} className="relative w-full max-w-md bg-white rounded-xl p-5 space-y-4 shadow-2xl"><button type="button" onClick={resetForm} aria-label="Close edit banner" className="absolute top-3 right-3 p-1.5 text-text-secondary"><X className="w-4 h-4" /></button><h3 className="text-sm font-bold text-text-primary">Edit Static Banner</h3><input value={editing.title || ''} onChange={event => setEditing({ ...editing, title: event.target.value })} placeholder="Banner title" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs" /><input type="url" value={editing.link || ''} onChange={event => setEditing({ ...editing, link: event.target.value })} placeholder="Click URL" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs" /><select value={editing.status || 'active'} onChange={event => setEditing({ ...editing, status: event.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"><option value="active">Active</option><option value="inactive">Inactive</option></select><label className="block border border-dashed border-slate-200 rounded-lg p-3 text-xs text-text-secondary cursor-pointer"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setEditFile(event.target.files?.[0] || null)} className="sr-only" />{editFile ? editFile.name : 'Replace image (optional)'}</label><FieldError message={formError} /><button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"><Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save Changes'}</button></form></div>}
        </div>
    );
};

export default AdminStaticBanners;
