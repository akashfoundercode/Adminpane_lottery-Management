import React, { useEffect, useState } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { ReopenRequest } from '../../types';
import { PageLoader } from '../../components/PageLoader';
import { useToast } from '../../context/ToastContext';

const readList = (json: any): any[] => {
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    return [];
};

const mapRequest = (item: any): ReopenRequest => ({
    id: String(item.request_id ?? item.id),
    agentId: String(item.agent_id ?? item.agent?.agent_id ?? ''),
    agentName: item.agent_name ?? item.agent?.agent_name ?? 'Unknown agent',
    bookId: String(item.book_id ?? item.book?.book_id ?? ''),
    bookNumber: item.book_number ?? item.book?.book_number,
    gameId: String(item.game_id ?? item.game?.id ?? ''),
    assignmentId: item.assignment_id,
    currentBookStatus: item.current_book_status ?? item.book?.status ?? 'Unsold by Admin',
    reason: item.reason ?? '',
    status: item.status ?? 'Pending',
    requestedAt: item.requested_at ?? item.created_at ?? '',
    reviewedAt: item.reviewed_at,
    reviewedBy: item.reviewed_by,
    adminReason: item.admin_reason
});

export const AdminReopenRequests: React.FC = () => {
    const { showToast } = useToast();
    const [requests, setRequests] = useState<ReopenRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const loadRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(apiUrl('/api/v1/admin/reopen-requests'), {
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            });
            const json = await response.json().catch(() => null);
            if (!response.ok || json?.success === false) throw new Error(json?.message || 'Failed to load reopen requests.');
            setRequests(readList(json).map(mapRequest));
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to load reopen requests.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRequests(); }, []);

    const review = async (request: ReopenRequest, action: 'approve' | 'reject') => {
        if (action === 'reject' && !rejectReason.trim()) return;
        setProcessingId(request.id);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(apiUrl(`/api/v1/admin/reopen-requests/${encodeURIComponent(request.id)}/${action}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                ...(action === 'reject' ? { body: JSON.stringify({ reason: rejectReason.trim() }) } : {})
            });
            const json = await response.json().catch(() => null);
            if (!response.ok || json?.success === false) throw new Error(json?.message || `Failed to ${action} reopen request.`);
            showToast(json?.message || `Reopen request ${action}d successfully.`, 'success');
            setRejectingId(null);
            setRejectReason('');
            await loadRequests();
        } catch (error) {
            showToast(error instanceof Error ? error.message : `Failed to ${action} reopen request.`, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = requests.filter(request => request.status.toLowerCase() === 'pending');

    return (
        <div className="space-y-6 font-sans">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-[20px] font-bold text-text-primary font-display">Reopen Requests</h2>
                    <p className="text-xs text-text-secondary">Review books locked as Unsold by Admin.</p>
                </div>
                <button onClick={loadRequests} disabled={loading} aria-label="Refresh reopen requests" className="p-2 rounded-lg border border-border-light bg-white text-text-secondary hover:text-text-primary disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
            <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                {loading && requests.length === 0 ? <PageLoader /> : pendingRequests.length === 0 ? (
                    <div className="p-8 text-center text-xs text-text-secondary">No pending reopen requests.</div>
                ) : (
                    <div className="divide-y divide-border-light">
                        {pendingRequests.map(request => (
                            <div key={request.id} className="p-4 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                    <div><span className="block text-[10px] text-text-secondary uppercase">Agent</span><strong>{request.agentName}</strong><span className="block text-text-secondary">{request.agentId}</span></div>
                                    <div><span className="block text-[10px] text-text-secondary uppercase">Book</span><strong>{request.bookId}</strong><span className="block text-text-secondary">No. {request.bookNumber || '-'}</span></div>
                                    <div><span className="block text-[10px] text-text-secondary uppercase">Game</span><strong>{request.gameId}</strong></div>
                                    <div><span className="block text-[10px] text-text-secondary uppercase">Status</span><span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">{request.currentBookStatus}</span></div>
                                    <div><span className="block text-[10px] text-text-secondary uppercase">Requested</span><span>{request.requestedAt ? new Date(request.requestedAt).toLocaleString() : '-'}</span></div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 text-xs text-text-secondary"><strong className="text-text-primary">Reason: </strong>{request.reason || '-'}</div>
                                {rejectingId === request.id && <input autoFocus value={rejectReason} onChange={event => setRejectReason(event.target.value)} placeholder="Rejection reason" className="w-full px-3 py-2 text-xs border border-border-light rounded-lg" />}
                                <div className="flex justify-end gap-2">
                                    {rejectingId === request.id ? <button onClick={() => review(request, 'reject')} disabled={!rejectReason.trim() || processingId === request.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50"><X className="w-3.5 h-3.5" />Confirm Reject</button> : <button onClick={() => { setRejectingId(request.id); setRejectReason(''); }} disabled={processingId === request.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold disabled:opacity-50"><X className="w-3.5 h-3.5" />Reject</button>}
                                    <button onClick={() => review(request, 'approve')} disabled={processingId === request.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"><Check className="w-3.5 h-3.5" />Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReopenRequests;
