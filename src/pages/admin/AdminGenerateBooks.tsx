import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ArrowLeft, CheckCircle, HelpCircle, AlertCircle, Loader2, Download } from 'lucide-react';
// @ts-ignore
import * as XLSX from 'xlsx';

interface AdminGenerateBooksProps {
  onUploaded?: () => void | Promise<void>;
}

export const AdminGenerateBooks: React.FC<AdminGenerateBooksProps> = ({ onUploaded }) => {
  const { games, importBooks } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected game
  const [selectedGameId, setSelectedGameId] = useState('');

  // File import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportFileName(file.name);
    }
  };

  const processFileAndNormalize = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Could not read file data.'));
            return;
          }
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Get rows as array of arrays (including header row)
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rows.length === 0) {
            reject(new Error('Spreadsheet is empty.'));
            return;
          }

          const originalHeaders: string[] = rows[0].map(h => String(h || '').trim());
          const normalizedHeaders = originalHeaders.map(header => {
            const hLower = header.toLowerCase();

            // Map common patterns to backend expected header names
            if (hLower === 'ticket_number' || hLower === 'ticket_numbers' || hLower === 'ticketnumber' || hLower.includes('coupon')) {
              return 'ticket_number';
            }
            if (hLower === 'book_id' || hLower === 'book_number' || hLower === 'bookid') {
              return 'book_id';
            }
            if (hLower === 'total_tickets' || hLower === 'total_ticket' || hLower === 'tickets_count') {
              return 'total_tickets';
            }

            // Fallback heuristics
            if (hLower.includes('ticket') || hLower.includes('serial') || hLower.includes('number')) {
              return 'ticket_number';
            }
            if (hLower.includes('book')) {
              return 'book_id';
            }
            if (hLower.includes('total') || hLower.includes('count') || hLower.includes('size')) {
              return 'total_tickets';
            }
            return header;
          });

          // Check if we found ticket_number. If not, default mapping based on index.
          if (!normalizedHeaders.includes('ticket_number')) {
            if (normalizedHeaders.length >= 2) {
              normalizedHeaders[0] = 'book_id';
              normalizedHeaders[1] = 'ticket_number';
              if (normalizedHeaders.length >= 3) {
                normalizedHeaders[2] = 'total_tickets';
              }
            } else {
              normalizedHeaders[0] = 'ticket_number';
            }
          }

          // Convert rows back to CSV string
          const csvRows = [];

          // Add normalized headers
          csvRows.push(normalizedHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

          // Add value rows
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const csvRow = normalizedHeaders.map((_, colIdx) => {
              const val = String(row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : '').trim();
              return `"${val.replace(/"/g, '""')}"`;
            });
            csvRows.push(csvRow.join(','));
          }

          const csvContent = csvRows.join('\n');
          const normalizedFile = new File([csvContent], 'normalized_import.csv', { type: 'text/csv' });
          resolve(normalizedFile);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId) { showToast('Please select a game first.', 'error'); return; }
    if (!importFile) { showToast('Please upload a spreadsheet file.', 'error'); return; }
    setErrors([]);
    setUploading(true);
    try {
      const normalizedFile = await processFileAndNormalize(importFile);
      await importBooks(selectedGameId, normalizedFile);
      showToast('Books uploaded successfully!', 'success');
      if (onUploaded) await onUploaded();
      else navigate('/admin/books');
    } catch (err: any) {
      const msg: string = err.message || 'Spreadsheet import failed.';
      // Parse multiple errors — split by newline or sentence
      const lines = msg.split(/\n|(?<=\.)\.?\s+(?=[A-Z(])/).map((s: string) => s.trim()).filter(Boolean);
      setErrors(lines.length > 1 ? lines : [msg]);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const ticketsPerBook = 10;
    const rows = [['SL NO', 'BOOK NO', 'ticket_no']];
    for (let b = 1; b <= 10; b++) {
      const bookNo = String(100000 + b);
      const tickets = Array.from({ length: ticketsPerBook }, (_, i) => String(100000 + (b - 1) * ticketsPerBook + i + 1)).join(', ');
      rows.push([String(b), bookNo, tickets]);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_books.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync game ID from query param if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gId = params.get('gameId');
    if (gId) {
      setSelectedGameId(gId);
    } else if (games.length > 0) {
      setSelectedGameId(games[0].id);
    }
  }, [location.search, games]);

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Upload Ticket Books</h2>
          <p className="text-xs text-text-secondary">Upload serial-numbered books and tickets in batch for a game</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM PANEL */}
        <div className="bg-white border border-border-light rounded-xl shadow-sm p-6 lg:col-span-7">
          <form onSubmit={handleImportSubmit} className="space-y-5">
            {/* Select Game */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Select Game <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-semibold appearance-none cursor-pointer"
              >
                <option value="" disabled>Choose Game</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.gameCode})</option>
                ))}
              </select>
            </div>

            {/* Upload Spreadsheet */}
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Upload Excel / Spreadsheet File <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center relative group">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {importFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-xs text-indigo-600 font-semibold">{importFileName}</span>
                    <span className="text-[10px] text-text-secondary mt-1">Click or drag to replace file</span>
                  </div>
                ) : (
                  <>
                    <HelpCircle className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                    <span className="text-xs font-semibold text-text-primary">Click to upload spreadsheet</span>
                    <span className="text-[10px] text-text-secondary mt-1">Supports XLSX, XLS, CSV (Max: 10MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* Error List */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-1.5">
                {errors.map((err, i) => {
                  const LIMIT = 80;
                  const isLong = err.length > LIMIT;
                  const expanded = expandedErrors.has(i);
                  const displayed = isLong && !expanded ? err.slice(0, LIMIT) + '…' : err;
                  return (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-rose-700">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        {displayed}
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => setExpandedErrors(prev => {
                              const next = new Set(prev);
                              expanded ? next.delete(i) : next.add(i);
                              return next;
                            })}
                            className="ml-1 underline font-semibold text-rose-600 hover:text-rose-800"
                          >
                            {expanded ? 'View less' : 'View more'}
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{uploading ? 'Uploading...' : 'Upload Books'}</span>
            </button>
          </form>
        </div>

        {/* INSTRUCTIONS PANEL */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider">
              Import Instructions
            </h3>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <Download className="w-3 h-3" />
              Sample CSV
            </button>
          </div>
          <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
            <p>
              Please upload a spreadsheet file containing the books and ticket numbers to generate them on the backend database.
            </p>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">
                Required Sheet Columns:
              </span>
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-2 py-1 text-center font-semibold text-text-primary">SL NO</th>
                    <th className="border border-slate-200 px-2 py-1 text-center font-semibold text-text-primary">BOOK NO</th>
                    <th className="border border-slate-200 px-2 py-1 text-center font-semibold text-text-primary">ticket_no</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2].map(b => (
                    <tr key={b}>
                      <td className="border border-slate-200 px-2 py-1 text-center text-text-secondary">{b}</td>
                      <td className="border border-slate-200 px-2 py-1 text-center text-text-secondary">{100000 + b}</td>
                      <td className="border border-slate-200 px-2 py-1 text-center text-text-secondary">
                        {Array.from({ length: 10 }, (_, i) => 100000 + (b - 1) * 10 + i + 1).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-[10px] text-indigo-800 flex gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                Books will be saved in Available status. You can assign these generated books to agents from the **Book Assignment** module.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGenerateBooks;
