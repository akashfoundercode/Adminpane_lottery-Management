import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Eye, Trash2, Calendar, FileText, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const AdminResults: React.FC = () => {
  const { results, deleteResult, publishResult, unpublishResult, fetchResults } = useAdmin();
  const { showToast } = useToast();

  // Fetch results on component load
  React.useEffect(() => {
    fetchResults();
  }, []);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteResultId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteResultId) {
      deleteResult(deleteResultId);
      showToast('Result record deleted successfully.', 'success');
      setDeleteResultId(null);
    }
  };

  const handlePublishToggle = (id: string, currentStatus: string) => {
    if (currentStatus === 'Draft') {
      publishResult(id);
      showToast('Result published to user interface.', 'success');
    } else {
      unpublishResult(id);
      showToast('Result reverted to draft.', 'success');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Result Management</h2>
          <p className="text-xs text-text-secondary">View and publish winning numbers and board PDF/images</p>
        </div>
        <Link
          to="/admin/results/upload"
          className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Result</span>
        </Link>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.length === 0 ? (
          <div className="bg-white border border-border-light rounded-xl p-8 text-center shadow-sm col-span-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-text-primary">No Results Uploaded</h3>
            <p className="text-xs text-text-secondary mt-1">Upload lucky draw outcome sheets to start publishing.</p>
          </div>
        ) : (
          results.map((result) => (
            <div key={result.id} className="premium-card bg-white border border-border-light shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              {/* IMAGE PREVIEW */}
              <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-border-light">
                <img
                  src={result.image}
                  alt={result.gameName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback in case of broken image URL
                    (e.target as any).src = 'https://images.unsplash.com/photo-1518655061766-48f23af9304a?w=400';
                  }}
                />
                <span className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                  result.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {result.status}
                </span>
              </div>

              {/* DETAILS */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide truncate">{result.gameName}</h4>
                  {result.title && (
                    <p className="text-[11px] font-semibold text-indigo-600 mt-0.5 truncate">{result.title}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-text-secondary text-[11px] mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Draw Date: {result.drawDate}</span>
                  </div>
                  {result.publishedDate && (
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                      Published: {new Date(result.publishedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => handlePublishToggle(result.id, result.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      result.status === 'Published'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{result.status === 'Published' ? 'Unpublish' : 'Publish Result'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={result.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                      title="View Board"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(result.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Result Board"
        description="Are you sure you want to delete this result sheet? Users will no longer be able to view details for this lucky draw on the portal. This action cannot be undone."
        type="danger"
        confirmText="Delete Result"
      />
    </div>
  );
};

export default AdminResults;
