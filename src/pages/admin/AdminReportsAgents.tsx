import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Download, Filter, Search, Award } from 'lucide-react';

export const AdminReportsAgents: React.FC = () => {
  const { agents, books, winnings, fetchAgents, fetchBooks } = useAdmin();

  React.useEffect(() => {
    fetchAgents();
    fetchBooks();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Compute standings
  const agentReportData = useMemo(() => {
    return agents.map(agent => {
      const agentBooks = books.filter(b => b.agentId === agent.id ||
        (agent.apiId !== undefined && b.agentId === String(agent.apiId)));
      const totalAssigned = agentBooks.length;
      const soldBooks = agentBooks.filter(b => b.status === 'Sold').length;
      const unsoldBooks = agentBooks.filter(b => b.status === 'Unsold').length;
      const expiredBooks = agentBooks.filter(b => b.status === 'Unsold by Admin').length;

      const salesAmount = agentBooks
        .filter(b => b.status === 'Sold')
        .reduce((acc, curr) => acc + (curr.bookValue || 1000), 0);

      const agentWinnings = winnings.filter(w => w.agentId === agent.id);
      const winningAmount = agentWinnings.reduce((acc, curr) => acc + curr.prizeValue, 0);

      const performancePct = totalAssigned > 0 ? Math.round((soldBooks / totalAssigned) * 100) : 0;

      return {
        id: agent.id,
        name: agent.name,
        type: agent.agentType,
        assigned: totalAssigned,
        sold: soldBooks,
        unsold: unsoldBooks + expiredBooks,
        sales: salesAmount,
        winningsVal: winningAmount,
        perf: performancePct
      };
    });
  }, [agents, books, winnings]);

  const filteredReports = useMemo(() => {
    return agentReportData.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [agentReportData, searchTerm, typeFilter]);

  const handleExport = () => {
    alert('Exporting Agent Report...');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Agent Reports</h2>
          <p className="text-xs text-text-secondary">Audit agent performance indices, gross collections, and return trends</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-text-primary px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Agent Report</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-xl border border-border-light shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by agent name..."
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary font-semibold appearance-none cursor-pointer"
          >
            <option value="All">All Agent Types</option>
            <option value="First Party">First Party</option>
            <option value="Third Party">Third Party</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border-light text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Agent Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Assigned Books</th>
                <th className="py-3.5 px-4 text-center">Sold Books</th>
                <th className="py-3.5 px-4 text-center">Returned Books</th>
                <th className="py-3.5 px-4 text-right">Gross Sales</th>
                <th className="py-3.5 px-4 text-right">Winning Payouts</th>
                <th className="py-3.5 px-4">Performance Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredReports.map((report, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-primary">{report.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${report.type === 'Third Party' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-text-secondary font-medium">{report.assigned}</td>
                  <td className="py-3 px-4 text-center text-text-primary font-medium">{report.sold}</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-medium">{report.unsold}</td>
                  <td className="py-3 px-4 text-right font-bold text-text-primary">₹{report.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-indigo-600">₹{report.winningsVal.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${report.perf >= 80 ? 'bg-emerald-500' :
                              report.perf >= 50 ? 'bg-indigo-500' :
                                'bg-amber-500'
                            }`}
                          style={{ width: `${report.perf}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px] text-text-primary">{report.perf}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsAgents;
