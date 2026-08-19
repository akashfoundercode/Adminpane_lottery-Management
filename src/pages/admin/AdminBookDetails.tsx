import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { ArrowLeft, BookOpen, User, Calendar, Tag, ShieldCheck, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

export const AdminBookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, games, agents, updateBookStatus } = useAdmin();
  const { showToast } = useToast();
  const [statusToUpdate, setStatusToUpdate] = React.useState<'Sold' | 'Unsold' | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const book = books.find(b => b.id === id);
  const game = book ? games.find(g => g.id === book.gameId) : null;
  const agent = book ? agents.find(a => a.id === book.agentId) : null;

  const handleStatusUpdate = async () => {
    if (!book || !statusToUpdate) return;
    setIsUpdatingStatus(true);
    try {
      await updateBookStatus(book.id, statusToUpdate);
      showToast(`Book ${book.id} marked as ${statusToUpdate}.`, 'success');
      setStatusToUpdate(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to update book status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!book) {
    return (
      <div className="bg-white border border-border-light rounded-xl p-8 text-center shadow-sm max-w-md mx-auto mt-12">
        <HelpCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Book Not Found</h3>
        <p className="text-xs text-text-secondary mt-1">We couldn't find a ticket book with ID {id}.</p>
        <Link to="/admin/books" className="inline-block mt-4 text-xs font-semibold text-[#6366f1] hover:underline">
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/books"
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Book {book.id} Details</h2>
          <p className="text-xs text-text-secondary">Serial Number: {book.serialNumber || '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: BOOK & GAME INFORMATION */}
        <div className="space-y-6 lg:col-span-1">
          {/* Book Info */}
          <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
              Book Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Book ID</span>
                <span className="font-bold text-text-primary">{book.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Serial Number</span>
                <span className="font-mono font-bold text-text-primary">{book.serialNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Book Number</span>
                <span className="font-semibold text-text-primary">Book #{book.bookNumber || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Book Value</span>
                <span className="font-bold text-indigo-600">₹{book.bookValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Created Date</span>
                <span className="font-medium text-text-primary">{book.createdDate ? new Date(book.createdDate).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${book.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                    book.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                      book.status === 'Assigned' || book.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                        book.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                  }`}>
                  {book.status}
                </span>
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
            <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
              Game Information
            </h3>
            {game ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Game Name</span>
                  <span className="font-bold text-text-primary">{game.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Game Code</span>
                  <span className="font-mono font-bold text-indigo-600">{game.gameCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Ticket Price</span>
                  <span className="font-bold text-text-primary">₹{game.ticketPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Draw Date</span>
                  <span className="font-medium text-text-primary">{game.drawDate}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary">No associated game information.</p>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: TICKETS LIST */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 flex flex-col shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
            Tickets in this Book ({book.tickets.length})
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2">
            {book.tickets.map((ticketNo, index) => {
              // Status lookup: if Book is Sold, all tickets in it are Sold. If Available, Available. If Assigned, In Progress.
              let tStatus = 'Available';
              if (book.status === 'Sold') tStatus = 'Sold';
              else if (book.status === 'Unsold' || book.status === 'Unsold by Admin') tStatus = 'Unsold';
              else if (book.status === 'Assigned' || book.status === 'In Progress') tStatus = 'Assigned';

              return (
                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text-primary">{ticketNo}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${tStatus === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                      tStatus === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                        tStatus === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                    }`}>
                    {tStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ASSIGNMENT INFORMATION */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 space-y-4 shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2">
            Assignment Information
          </h3>

          {book.agentId ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#6366f1] flex items-center justify-center flex-shrink-0 font-bold border border-indigo-100">
                  {book.agentName ? book.agentName.slice(0, 2).toUpperCase() : 'AG'}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary">{book.agentName}</span>
                  <span className="text-[10px] text-text-secondary">{book.agentId}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Assigned Date</span>
                  <span className="font-bold text-text-primary">
                    {book.assignedDate ? new Date(book.assignedDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Expiry Date</span>
                  <span className="font-bold text-rose-600">
                    {book.expiryDate ? new Date(book.expiryDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Expiry Time</span>
                  <span className="font-bold text-rose-600">
                    {book.expiryDate ? new Date(book.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-text-secondary">
              <p>This book is currently not assigned to any agent.</p>
              <Link
                to={`/admin/book-assignment?bookId=${book.id}`}
                className="inline-block mt-3 bg-[#6366f1] hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors text-[10px]"
              >
                Assign Now
              </Link>
            </div>
          )}

          <div className="border-t border-border-light pt-4 space-y-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Change Status</span>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusToUpdate('Sold')}
                disabled={book.status === 'Sold' || isUpdatingStatus}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Sold
              </button>
              <button
                onClick={() => setStatusToUpdate('Unsold')}
                disabled={book.status === 'Unsold' || isUpdatingStatus}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-3.5 h-3.5" /> Unsold
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={statusToUpdate !== null}
        onClose={() => !isUpdatingStatus && setStatusToUpdate(null)}
        onConfirm={handleStatusUpdate}
        title={`Mark this book as ${statusToUpdate || 'updated'}?`}
        description={`This will change the book status to ${statusToUpdate || 'the selected status'} using the admin API.`}
      />
    </div>
  );
};

export default AdminBookDetails;
