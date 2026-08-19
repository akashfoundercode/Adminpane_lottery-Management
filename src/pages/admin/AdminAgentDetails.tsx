import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, User, Mail, Phone, MapPin, Award, BookOpen, AlertCircle, ShoppingCart } from 'lucide-react';

export const AdminAgentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { agents, books, winnings } = useAdmin();

  const agent = agents.find(a => a.id === id);

  // Derived metrics
  const agentBooks = books.filter(b => b.agentId === id);
  const totalAssigned = agentBooks.length;
  const soldBooks = agentBooks.filter(b => b.status === 'Sold').length;
  const unsoldBooks = agentBooks.filter(b => b.status === 'Unsold').length;
  const expiredBooks = agentBooks.filter(b => b.status === 'Unsold by Admin').length;

  const agentWinnings = winnings.filter(w => w.agentId === id);

  // Compute total sales
  // Assume each book has a value, or sum b.bookValue for sold books
  const totalSales = agentBooks
    .filter(b => b.status === 'Sold')
    .reduce((acc, curr) => acc + (curr.bookValue || 1000), 0);

  if (!agent) {
    return (
      <div className="bg-white border border-border-light rounded-xl p-8 text-center shadow-sm max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-text-primary">Agent Not Found</h3>
        <p className="text-xs text-text-secondary mt-1">We couldn't find an agent with ID {id}.</p>
        <Link to="/admin/agents/first-party" className="inline-block mt-4 text-xs font-semibold text-[#6366f1] hover:underline">
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          to={agent.agentType === 'First Party' ? '/admin/agents/first-party' : '/admin/agents/third-party'}
          className="p-2 rounded-lg bg-white border border-border-light hover:bg-slate-50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">{agent.name} Profile</h2>
          <p className="text-xs text-text-secondary">Type: {agent.agentType} | Agent ID: {agent.id}</p>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="premium-card p-4 bg-white border border-border-light shadow-sm">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Sales</span>
          <span className="text-lg font-bold text-text-primary mt-1 block">₹{totalSales.toLocaleString()}</span>
        </div>
        <div className="premium-card p-4 bg-white border border-border-light shadow-sm">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Assigned Books</span>
          <span className="text-lg font-bold text-text-primary mt-1 block">{totalAssigned}</span>
        </div>
        <div className="premium-card p-4 bg-emerald-50 border border-emerald-100 shadow-sm">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Sold Books</span>
          <span className="text-lg font-bold text-emerald-900 mt-1 block">{soldBooks}</span>
        </div>
        <div className="premium-card p-4 bg-amber-50 border border-amber-100 shadow-sm">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Unsold Books</span>
          <span className="text-lg font-bold text-amber-900 mt-1 block">{unsoldBooks}</span>
        </div>
        <div className="premium-card p-4 bg-rose-50 border border-rose-100 shadow-sm">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Expired Books</span>
          <span className="text-lg font-bold text-rose-900 mt-1 block">{expiredBooks}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PROFILE DATA */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 space-y-4 shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2">
            Profile Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary text-sm">{agent.name}</span>
                <span className="text-[10px] text-text-secondary">{agent.id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center gap-2 text-text-primary">
                <Mail className="w-4 h-4 text-text-secondary" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <Phone className="w-4 h-4 text-text-secondary" />
                <span>{agent.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <MapPin className="w-4 h-4 text-text-secondary" />
                <span className="leading-snug">{agent.address}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-light text-[11px]">
                <span className="text-text-secondary">Type</span>
                <span className="font-bold text-indigo-600">{agent.agentType}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-secondary">Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  agent.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {agent.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: ASSIGNED BOOKS */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 flex flex-col shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
            Assigned Books ({agentBooks.length})
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
            {agentBooks.length === 0 ? (
              <div className="text-center py-10 text-xs text-text-secondary italic">
                No books currently assigned.
              </div>
            ) : (
              agentBooks.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary">{b.id}</span>
                    <span className="text-[10px] text-text-secondary font-medium truncate max-w-[120px]">{b.gameName}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    b.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'Assigned' ? 'bg-purple-100 text-purple-800' :
                    b.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WINNING HISTORY */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-1 flex flex-col shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b border-border-light pb-2 mb-4">
            Winning Tickets ({agentWinnings.length})
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5">
            {agentWinnings.length === 0 ? (
              <div className="text-center py-10 text-xs text-text-secondary italic">
                No winning tickets reported from this agent.
              </div>
            ) : (
              agentWinnings.map((w, idx) => (
                <div key={idx} className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-indigo-700">Ticket #{w.ticketNumber}</span>
                    <span className="text-[10px] text-text-secondary mt-0.5">{w.prize} - {w.game}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-primary">₹{w.prizeValue.toLocaleString()}</span>
                    <span className={`block text-[9px] font-semibold ${w.claimStatus === 'Claimed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {w.claimStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAgentDetails;
