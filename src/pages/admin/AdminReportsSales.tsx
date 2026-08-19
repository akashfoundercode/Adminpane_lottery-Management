import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Download, Filter, IndianRupee, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export const AdminReportsSales: React.FC = () => {
  const { books, games, agents, fetchBooks, fetchGames, fetchAgents } = useAdmin();

  React.useEffect(() => {
    fetchBooks();
    fetchGames();
    fetchAgents();
  }, []);

  // Filters
  const [selectedGameId, setSelectedGameId] = useState('All');
  const [selectedAgentId, setSelectedAgentId] = useState('All');

  // Compute sold books
  const soldBooks = useMemo(() => {
    return books.filter(b => {
      const isSold = b.status === 'Sold';
      const matchesGame = selectedGameId === 'All' || b.gameId === selectedGameId;
      const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
      const matchesAgent = selectedAgentId === 'All' || b.agentId === selectedAgentId ||
        (selectedAgent?.apiId !== undefined && b.agentId === String(selectedAgent.apiId));
      return isSold && matchesGame && matchesAgent;
    });
  }, [books, selectedGameId, selectedAgentId]);

  // Aggregate stats
  const totalSalesVal = useMemo(() => {
    return soldBooks.reduce((acc, curr) => acc + (curr.bookValue || 1000), 0);
  }, [soldBooks]);

  const totalTicketsVal = useMemo(() => {
    return soldBooks.reduce((acc, curr) => acc + (curr.tickets.length), 0);
  }, [soldBooks]);

  // Bar Chart: Sales Grouped by Game Name
  const gameSalesData = useMemo(() => {
    const map: Record<string, number> = {};
    soldBooks.forEach(b => {
      const gName = b.gameName || 'Other Draw';
      map[gName] = (map[gName] || 0) + (b.bookValue || 1000);
    });
    return Object.keys(map).map(name => ({
      name,
      amount: map[name]
    }));
  }, [soldBooks]);

  const handleExport = () => {
    alert('Exporting Sales Report to Excel/PDF...');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Sales Reports</h2>
          <p className="text-xs text-text-secondary">Track revenues, ticket purchase volumes, and campaign turnovers</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Game Filter */}
        <div className="relative w-full">
          <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1.5">Filter by Game</label>
          <select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Games</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Agent Filter */}
        <div className="relative w-full">
          <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1.5">Filter by Agent</label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-[#6366f1] rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Sales Value</span>
            <span className="text-xl font-bold text-text-primary mt-0.5 block">₹{totalSalesVal.toLocaleString()}</span>
          </div>
        </div>

        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Books Sold</span>
            <span className="text-xl font-bold text-text-primary mt-0.5 block">{soldBooks.length} Books</span>
          </div>
        </div>

        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Tickets Purchased</span>
            <span className="text-xl font-bold text-text-primary mt-0.5 block">{totalTicketsVal.toLocaleString()} Tickets</span>
          </div>
        </div>
      </div>

      {/* CHART & DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider mb-4">
            Revenues by Campaign
          </h3>
          {gameSalesData.length === 0 ? (
            <div className="text-center py-10 text-xs text-text-secondary">No sales recorded matching criteria.</div>
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gameSalesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 9 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 9 }} tickFormatter={(val) => `₹${val / 1000}K`} />
                  <Tooltip formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#6366f1">
                    {gameSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Sales List */}
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm flex flex-col justify-between">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b pb-2 mb-3">
            Recent Transactions List
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[220px]">
            {soldBooks.length === 0 ? (
              <div className="text-center py-10 text-xs text-text-secondary">No transaction logs available.</div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 font-bold border-b border-border-light text-text-secondary">
                    <th className="py-2 px-2">Book ID</th>
                    <th className="py-2 px-2">Game Name</th>
                    <th className="py-2 px-2">Assigned Agent</th>
                    <th className="py-2 px-2 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {soldBooks.slice(0, 30).map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 font-mono font-semibold text-indigo-600">{b.id}</td>
                      <td className="py-2 px-2 text-text-primary truncate max-w-[120px]">{b.gameName}</td>
                      <td className="py-2 px-2 text-text-secondary">{b.agentName || '-'}</td>
                      <td className="py-2 px-2 text-right font-bold text-text-primary">₹{(b.bookValue || 1000).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsSales;
