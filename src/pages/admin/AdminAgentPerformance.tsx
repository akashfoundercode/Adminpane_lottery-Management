import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, Filter, AlertCircle, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

export const AdminAgentPerformance: React.FC = () => {
  const { agents, books, winnings } = useAdmin();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Compute performance data for all active/inactive agents
  const performanceData = useMemo(() => {
    return agents.map(agent => {
      const agentBooks = books.filter(b => b.agentId === agent.id);
      const totalAssigned = agentBooks.length;
      const soldBooks = agentBooks.filter(b => b.status === 'Sold').length;
      const unsoldBooks = agentBooks.filter(b => b.status === 'Unsold').length;
      const expiredBooks = agentBooks.filter(b => b.status === 'Unsold by Admin').length;

      const salesAmount = agentBooks
        .filter(b => b.status === 'Sold')
        .reduce((acc, curr) => acc + (curr.bookValue || 1000), 0);

      const winningCount = winnings.filter(w => w.agentId === agent.id).length;

      // Performance % is Sold / Total Assigned (or 0 if no books assigned)
      const performancePct = totalAssigned > 0 ? Math.round((soldBooks / totalAssigned) * 100) : 0;

      return {
        id: agent.id,
        name: agent.name,
        type: agent.agentType,
        totalAssigned,
        soldBooks,
        unsoldBooks,
        expiredBooks,
        salesAmount,
        winningCount,
        performancePct
      };
    });
  }, [agents, books, winnings]);

  // Filter list
  const filteredPerformance = useMemo(() => {
    return performanceData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [performanceData, searchTerm, typeFilter]);

  // Chart Data: Top 5 Agents by Sales
  const chartData = useMemo(() => {
    return [...performanceData]
      .sort((a, b) => b.salesAmount - a.salesAmount)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        sales: p.salesAmount
      }));
  }, [performanceData]);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-[20px] font-bold text-text-primary font-display">Agent Performance</h2>
        <p className="text-xs text-text-secondary">Analyze agent productivity, sales figures, and ticket return ratios</p>
      </div>

      {/* CHART ROW */}
      {chartData.length > 0 && (
        <div className="premium-card p-5 bg-white border border-border-light shadow-sm">
          <h3 className="font-display font-semibold text-text-primary text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            <span>Top 5 Agents by Sales (₹)</span>
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}K`} />
                <Tooltip formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-text-primary placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Type */}
        <div className="relative w-full sm:w-48 sm:ml-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-text-primary font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Agent Types</option>
            <option value="First Party">First Party Only</option>
            <option value="Third Party">Third Party Only</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* PERFORMANCE DATA TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        {filteredPerformance.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-text-primary">No performance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Assigned Books</th>
                  <th className="py-3.5 px-4 text-center">Sold Books</th>
                  <th className="py-3.5 px-4 text-center">Unsold Books</th>
                  <th className="py-3.5 px-4 text-center">Expired (Admin)</th>
                  <th className="py-3.5 px-4 text-right">Sales Amount</th>
                  <th className="py-3.5 px-4 text-center">Winning Tickets</th>
                  <th className="py-3.5 px-4">Performance Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredPerformance.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-primary">{p.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        p.type === 'Third Party' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary font-medium">{p.totalAssigned}</td>
                    <td className="py-3 px-4 text-center text-text-primary font-medium">{p.soldBooks}</td>
                    <td className="py-3 px-4 text-center text-text-secondary font-medium">{p.unsoldBooks}</td>
                    <td className="py-3 px-4 text-center text-rose-500 font-medium">{p.expiredBooks}</td>
                    <td className="py-3 px-4 text-right font-bold text-text-primary">₹{p.salesAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-semibold text-indigo-600">{p.winningCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Progress Bar */}
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.performancePct >= 80 ? 'bg-emerald-500' :
                              p.performancePct >= 50 ? 'bg-indigo-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${p.performancePct}%` }}
                          />
                        </div>
                        <span className="font-bold text-[10px] text-text-primary">{p.performancePct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgentPerformance;
