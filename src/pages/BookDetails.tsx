import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Layers,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  Ticket as TicketIcon,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, games, winnings, markBookAsSold, markBookAsUnsold } = useAgent();
  const { showToast } = useToast();

  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [isUnsoldModalOpen, setIsUnsoldModalOpen] = useState(false);

  // Retrieve book details
  const book = useMemo(() => {
    return books.find(b => b.id === id);
  }, [books, id]);

  // Retrieve game details
  const game = useMemo(() => {
    if (!book) return null;
    return games.find(g => g.id === book.gameId);
  }, [games, book]);

  if (!book || !game) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-border-light p-6">
        <h3 className="text-lg font-bold text-text-primary">Book Not Found</h3>
        <p className="text-sm text-text-secondary mt-1">The book ID you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/agent/books')}
          className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded-lg text-xs font-semibold hover:bg-brand-emerald-hover cursor-pointer"
        >
          Back to Books
        </button>
      </div>
    );
  }

  // Check if a ticket has winning prizes
  const getTicketStatus = (ticketNum: string) => {
    const isWin = winnings.some(w => w.bookId === book.id && w.ticketNumber === ticketNum);
    if (isWin) return 'Winning';

    if (book.status === 'Sold') return 'Sold';
    if (book.status === 'Unsold') return 'Unsold';
    if (book.status === 'Unsold by Admin') return 'Expired';
    return 'Available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sold':
        return 'bg-green-50 text-success-main border-green-200';
      case 'Unsold':
        return 'bg-amber-50 text-warning-main border-amber-200';
      case 'Unsold by Admin':
        return 'bg-red-50 text-danger-main border-red-200';
      case 'Assigned':
        return 'bg-blue-50 text-info-main border-blue-200';
      default:
        return 'bg-gray-50 text-text-secondary border-border-light';
    }
  };

  // Perform Book Updates
  const handleConfirmSold = async () => {
    try {
      await markBookAsSold(book.id);
      setIsSoldModalOpen(false);
      showToast(`Book ${book.id} marked as Sold.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to mark book as Sold.', 'error');
    }
  };

  const handleConfirmUnsold = async () => {
    try {
      await markBookAsUnsold(book.id);
      setIsUnsoldModalOpen(false);
      showToast(`Book ${book.id} marked as Unsold.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to mark book as Unsold.', 'error');
    }
  };

  const isActionsAllowed = book.status === 'Assigned' || book.status === 'In Progress';
  const now = new Date().getTime();
  const isExpired = new Date(book.expiryDate).getTime() < now;

  return (
    <div className="space-y-6">
      {/* Back navigation header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-border-light rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-display text-text-primary">Book {book.id}</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(book.status)}`}>
              {book.status === 'Unsold by Admin' && <Lock className="w-3 h-3" />}
              {book.status}
            </span>
          </div>
          <p className="text-xs text-text-secondary">Assigned game: {game.name}</p>
        </div>
      </div>

      {/* CORE SPEC GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specs Table */}
        <div className="lg:col-span-2 premium-card p-5 bg-white border border-border-light shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Book Specifications</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Game Title</span>
              <span className="text-sm font-bold text-text-primary block mt-1">{game.name}</span>
            </div>

            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Ticket Price</span>
              <span className="text-sm font-bold text-text-primary block mt-1">₹{game.ticketPrice}</span>
            </div>

            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Book Size</span>
              <span className="text-sm font-bold text-text-primary block mt-1">{book.tickets.length} Tickets</span>
            </div>

            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Book Value</span>
              <span className="text-sm font-bold text-brand-emerald block mt-1">₹{book.bookValue}</span>
            </div>

            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Assigned Date</span>
              <span className="text-xs font-semibold text-text-primary block mt-1.5">
                {new Date(book.assignedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="p-3 bg-bg-app rounded-xl border border-border-light">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Expiry Deadline</span>
              <span className="text-xs font-semibold text-text-primary block mt-1.5">
                {new Date(book.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary pt-2 border-t border-border-light">
            <User className="w-4 h-4" />
            <span>Assigned By: <strong>Admin</strong></span>
          </div>
        </div>

        {/* Action Panel Card */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Status Actions</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Verify your offline book sales count and submit the confirmation below. Expired books are marked as <strong>Unsold by Admin</strong> and cannot be updated.
            </p>

            {book.status === 'Unsold by Admin' && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-danger-main flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>This book was automatically marked Unsold because no status was updated before expiry.</p>
              </div>
            )}

            {isActionsAllowed && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-border-light mt-3">
                <span className="text-xs font-medium text-text-secondary">Time remaining:</span>
                <CountdownTimer expiryDate={book.expiryDate} />
              </div>
            )}
          </div>

          <div className="space-y-2 mt-6">
            {isActionsAllowed ? (
              <>
                <button
                  onClick={() => setIsSoldModalOpen(true)}
                  className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-emerald/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Sold</span>
                </button>
                <button
                  onClick={() => setIsUnsoldModalOpen(true)}
                  className="w-full py-2.5 bg-white border border-border-light hover:bg-amber-50 hover:text-warning-main text-text-primary rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Mark as Unsold</span>
                </button>
              </>
            ) : (
              <div className="p-3 bg-gray-50 border border-border-light rounded-xl text-center text-xs font-semibold text-text-secondary">
                Actions Disabled (Status: {book.status})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TICKET DETAILS LIST */}
      <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TicketIcon className="w-5 h-5 text-brand-emerald" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Ticket Registry</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {book.tickets.map((ticket) => {
            const status = getTicketStatus(ticket);

            let statusStyle = 'border-gray-200 bg-white text-text-primary';
            if (status === 'Sold') {
              statusStyle = 'border-green-200 bg-green-50/50 text-success-main';
            } else if (status === 'Unsold') {
              statusStyle = 'border-amber-200 bg-amber-50/30 text-warning-main';
            } else if (status === 'Expired') {
              statusStyle = 'border-red-200 bg-red-50/30 text-danger-main';
            } else if (status === 'Winning') {
              statusStyle = 'border-blue-200 bg-blue-50 text-info-main font-bold animate-pulse';
            }

            return (
              <div
                key={ticket}
                className={`p-3 border rounded-xl text-center transition-all ${statusStyle}`}
              >
                <span className="font-mono text-sm tracking-wider font-semibold block">{ticket}</span>
                <span className="text-[9px] uppercase tracking-wider mt-1 block opacity-80">{status}</span>

                {status === 'Winning' && (
                  <div className="flex justify-center mt-1 text-info-main">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRMATION MODALS */}
      {/* Mark as Sold Modal */}
      <ConfirmationModal
        isOpen={isSoldModalOpen}
        onClose={() => setIsSoldModalOpen(false)}
        onConfirm={handleConfirmSold}
        title="Mark this book as sold?"
        description="Please confirm that this book has been sold offline. This action will update all tickets to Sold status."
      >
        <div className="mt-3 p-3 bg-gray-50 border border-border-light rounded-xl space-y-1.5 text-xs">
          <p className="text-text-secondary">Book ID: <strong className="font-mono text-text-primary">{book.id}</strong></p>
          <p className="text-text-secondary">Game Name: <strong className="text-text-primary">{game.name}</strong></p>
          <p className="text-text-secondary">Total Value: <strong className="text-brand-emerald">₹{book.bookValue}</strong></p>
        </div>
      </ConfirmationModal>

      {/* Mark as Unsold Modal */}
      <ConfirmationModal
        isOpen={isUnsoldModalOpen}
        onClose={() => setIsUnsoldModalOpen(false)}
        onConfirm={handleConfirmUnsold}
        title="Are you sure you want to mark this book as unsold?"
        description="Confirm if this book has not been sold. The book will be returned as unsold, and action is irreversible."
        type="warning"
        confirmText="Confirm Unsold"
      >
        <div className="mt-3 p-3 bg-gray-50 border border-border-light rounded-xl space-y-1.5 text-xs">
          <p className="text-text-secondary">Book ID: <strong className="font-mono text-text-primary">{book.id}</strong></p>
          <p className="text-text-secondary">Game Name: <strong className="text-text-primary">{game.name}</strong></p>
          <p className="text-text-secondary">Total Value: <strong className="text-text-primary">₹{book.bookValue}</strong></p>
        </div>
      </ConfirmationModal>
    </div>
  );
};
export default BookDetails;
