import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
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
    if (!selectedGameId) {
      showToast('Please select a game first.', 'error');
      return;
    }
    if (!importFile) {
      showToast('Please upload a spreadsheet file.', 'error');
      return;
    }

    try {
      showToast('Parsing and normalizing spreadsheet columns...', 'info');
      const normalizedFile = await processFileAndNormalize(importFile);

      showToast('Uploading normalized spreadsheet to API...', 'info');
      await importBooks(selectedGameId, normalizedFile);

      showToast('Books and tickets generated successfully via spreadsheet!', 'success');
      if (onUploaded) {
        await onUploaded();
      } else {
        navigate('/admin/books');
      }
    } catch (err: any) {
      showToast(err.message || 'Spreadsheet import failed.', 'error');
    }
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

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload Books</span>
            </button>
          </form>
        </div>

        {/* INSTRUCTIONS PANEL */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 lg:col-span-5 space-y-4">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
            Import Instructions
          </h3>
          <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
            <p>
              Please upload a spreadsheet file containing the books and ticket numbers to generate them on the backend database.
            </p>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-[10px] text-text-primary uppercase tracking-wider block">
                Required Sheet Columns:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li><strong className="text-text-primary">book_id</strong> - Unique book identifier (e.g., BK001)</li>
                <li><strong className="text-text-primary">ticket_numbers</strong> - Ticket numbers/serials contained in the book</li>
                <li><strong className="text-text-primary">total_tickets</strong> - Number of tickets in the book</li>
              </ul>
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
