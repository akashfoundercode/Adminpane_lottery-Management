import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Filter, PieChart as PieIcon, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const AdminReportsBooks: React.FC = () => {
  const { books, games, agents } = useAdmin();

  // Filters
  const [selectedGameId, setSelectedGameId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesGame = selectedGameId === 'All' || b.gameId === selectedGameId;
      const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
      return matchesGame && matchesStatus;
    });
  }, [books, selectedGameId, selectedStatus]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = filteredBooks.length;
    const available = filteredBooks.filter(b => b.status === 'Available').length;
    const assigned = filteredBooks.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length;
    const sold = filteredBooks.filter(b => b.status === 'Sold').length;
    const unsold = filteredBooks.filter(b => b.status === 'Unsold').length;
    const expired = filteredBooks.filter(b => b.status === 'Unsold by Admin').length;

    return { total, available, assigned, sold, unsold, expired };
  }, [filteredBooks]);

  // Donut chart data
  const chartData = useMemo(() => {
    return [
      { name: 'Available', value: stats.available, color: '#3B82F6' },
      { name: 'Assigned', value: stats.assigned, color: '#8B5CF6' },
      { name: 'Sold', value: stats.sold, color: '#10B981' },
      { name: 'Unsold', value: stats.unsold, color: '#F59E0B' },
      { name: 'Expired', value: stats.expired, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [stats]);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Book Reports</h2>
        <p className="text-xs text-text-secondary">Analyze lottery book cycles, distribution channels, and agent claim status distributions</p>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Game Filter */}
        <div>
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

        {/* Status Filter */}
        <div>
          <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1.5">Filter by Book Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Sold">Sold</option>
            <option value="Unsold">Unsold (Agent)</option>
            <option value="Unsold by Admin">Expired (Admin)</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="premium-card p-4 bg-white border border-border-light shadow-sm">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Total Books</span>
          <span className="text-lg font-bold text-text-primary mt-1 block">{stats.total}</span>
        </div>
        <div className="premium-card p-4 bg-blue-50 border border-blue-100 shadow-sm">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">Available</span>
          <span className="text-lg font-bold text-blue-900 mt-1 block">{stats.available}</span>
        </div>
        <div className="premium-card p-4 bg-purple-50 border border-purple-100 shadow-sm">
          <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">Assigned</span>
          <span className="text-lg font-bold text-purple-900 mt-1 block">{stats.assigned}</span>
        </div>
        <div className="premium-card p-4 bg-emerald-50 border border-emerald-100 shadow-sm">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Sold</span>
          <span className="text-lg font-bold text-emerald-900 mt-1 block">{stats.sold}</span>
        </div>
        <div className="premium-card p-4 bg-amber-50 border border-amber-100 shadow-sm">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Unsold</span>
          <span className="text-lg font-bold text-amber-900 mt-1 block">{stats.unsold}</span>
        </div>
        <div className="premium-card p-4 bg-rose-50 border border-rose-100 shadow-sm">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Expired</span>
          <span className="text-lg font-bold text-rose-900 mt-1 block">{stats.expired}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PIE CHART */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-5 flex flex-col items-center">
          <h3 className="w-full font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b pb-2 mb-4">
            Book Status Breakdown
          </h3>
          {chartData.length === 0 ? (
            <div className="text-center py-10 text-xs text-text-secondary flex-1 flex items-center">No data matching filters.</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="w-[180px] h-[180px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-text-secondary">Filtered</span>
                  <span className="text-xl font-extrabold text-text-primary mt-0.5">{stats.total}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[11px] font-medium text-text-secondary w-full px-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOOK STATS TABLE */}
        <div className="premium-card p-5 bg-white border border-border-light lg:col-span-7 flex flex-col">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider border-b pb-2 mb-3">
            Inventory Ledger Summary
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {filteredBooks.length === 0 ? (
              <div className="text-center py-10 text-xs text-text-secondary">No books match.</div>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-light text-text-secondary font-bold">
                    <th className="py-2 px-2">Book ID</th>
                    <th className="py-2 px-2">Game Name</th>
                    <th className="py-2 px-2">Assigned Agent</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredBooks.slice(0, 30).map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2 font-mono font-semibold text-text-primary">{b.id}</td>
                      <td className="py-2.5 px-2 text-text-primary truncate max-w-[150px]">{b.gameName}</td>
                      <td className="py-2.5 px-2 text-text-secondary">{b.agentName || '-'}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          b.status === 'Sold' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'Assigned' || b.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                          b.status === 'Unsold' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
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

export default AdminReportsBooks;
