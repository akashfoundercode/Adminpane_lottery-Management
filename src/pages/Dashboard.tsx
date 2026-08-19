import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { StatCard } from '../components/StatCard';
import { CountdownTimer } from '../components/CountdownTimer';
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Calendar,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { books, games, winnings } = useAgent();
  const navigate = useNavigate();

  // Local filter states
  const [salesTimeframe, setSalesTimeframe] = useState<'7days' | '30days' | 'thismonth'>('7days');
  const [dateRangeFilter, setDateRangeFilter] = useState('All Time');

  // 1. Calculations for KPIs
  const kpis = useMemo(() => {
    const total = books.length;
    const sold = books.filter(b => b.status === 'Sold').length;
    const unsold = books.filter(b => b.status === 'Unsold').length;
    const expired = books.filter(b => b.status === 'Unsold by Admin').length;
    const wins = winnings.length;

    // Total sales = sum of sold books values
    const sales = books
      .filter(b => b.status === 'Sold')
      .reduce((sum, b) => sum + b.bookValue, 0);

    return { total, sold, unsold, expired, wins, sales };
  }, [books, winnings]);

  // 2. Urgent Expiry Book lookup: Assigned/In Progress with closest expiry date (still in the future)
  const urgentBook = useMemo(() => {
    const active = books.filter(b => b.status === 'Assigned' || b.status === 'In Progress');
    if (active.length === 0) return null;

    const now = new Date().getTime();
    // Filter out expired ones just in case state hasn't updated yet, and sort by closest expiry
    const futureActive = active
      .filter(b => new Date(b.expiryDate).getTime() > now)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    return futureActive[0] || null;
  }, [books]);

  // 3. Recharts: Aggregate Sales trend
  const chartData = useMemo(() => {
    // Generate dates based on timeframe
    const limitDays = salesTimeframe === '7days' ? 7 : (salesTimeframe === '30days' ? 30 : 15);
    const result = [];
    const now = new Date('2026-08-15T13:02:07+05:30'); // System local baseline

    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Sum sales for this day
      const dailySales = books
        .filter(b => {
          if (b.status !== 'Sold' || !(b as any).soldDate) return false;
          const soldStr = (b as any).soldDate.split('T')[0];
          return soldStr === dateString;
        })
        .reduce((sum, b) => sum + b.bookValue, 0);

      // Books count sold
      const dailyCount = books.filter(b => {
        if (b.status !== 'Sold' || !(b as any).soldDate) return false;
        const soldStr = (b as any).soldDate.split('T')[0];
        return soldStr === dateString;
      }).length;

      // Format date label (e.g. "12 Aug")
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      result.push({
        date: label,
        salesAmount: dailySales,
        booksSold: dailyCount
      });
    }

    return result;
  }, [books, salesTimeframe]);

  // 4. Recharts: Donut distribution
  const pieData = useMemo(() => {
    const sold = books.filter(b => b.status === 'Sold').length;
    const unsold = books.filter(b => b.status === 'Unsold').length;
    const expired = books.filter(b => b.status === 'Unsold by Admin').length;
    const assigned = books.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length;

    return [
      { name: 'Sold', value: sold, color: '#16A34A' },
      { name: 'Unsold', value: unsold, color: '#F59E0B' },
      { name: 'Unsold by Admin', value: expired, color: '#DC2626' },
      { name: 'Assigned (Active)', value: assigned, color: '#2563EB' }
    ];
  }, [books]);

  // 5. Recent Assigned Books Table: Show top 5 assigned or recent books
  const recentBooks = useMemo(() => {
    // Sort books: Assigned/In Progress first, then by assignedDate descending
    return [...books]
      .sort((a, b) => {
        const aActive = a.status === 'Assigned' || a.status === 'In Progress';
        const bActive = b.status === 'Assigned' || b.status === 'In Progress';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      })
      .slice(0, 5);
  }, [books]);

  const getGameName = (gameId: string) => {
    return games.find(g => g.id === gameId)?.name || 'Unknown Game';
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

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-text-primary">Good Morning, Rajesh 👋</h2>
          <p className="text-sm text-text-secondary">Here is your sales and book overview.</p>
        </div>
        
        {/* Date Filter Menu */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-border-light rounded-xl px-3 py-1.5 shadow-sm">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="text-xs font-semibold text-text-primary focus:outline-none bg-transparent cursor-pointer"
          >
            <option>All Time</option>
            <option>Today (15 Aug 2026)</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* 5 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Assigned Books"
          value={kpis.total}
          icon={BookOpen}
          description="Total books allocated"
          color="gray"
        />
        <StatCard
          title="Sold Books"
          value={kpis.sold}
          icon={CheckCircle}
          description={`Sales: ₹${kpis.sales.toLocaleString('en-IN')}`}
          color="emerald"
        />
        <StatCard
          title="Unsold Books"
          value={kpis.unsold}
          icon={Clock}
          description="Returned by you"
          color="warning"
        />
        <StatCard
          title="Unsold by Admin"
          value={kpis.expired}
          icon={AlertCircle}
          description="Expired automatic count"
          color="danger"
        />
        <StatCard
          title="Winning Tickets"
          value={kpis.wins}
          icon={Trophy}
          description="Prize payouts pending"
          color="info"
        />
      </div>

      {/* CRITICAL ACTION / URGENT EXPIRY NOTIFICATION CARD */}
      {urgentBook && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-warning-main rounded-lg shrink-0 mt-0.5 md:mt-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Books requiring action</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Book <strong className="font-mono font-semibold text-text-primary">{urgentBook.id}</strong> ({getGameName(urgentBook.gameId)}) requires your confirmation before timeout.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-text-secondary">Expires in:</span>
              <CountdownTimer expiryDate={urgentBook.expiryDate} />
            </div>
            <button
              onClick={() => navigate(`/agent/books/${urgentBook.id}`)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-warning-main hover:bg-amber-600 rounded-lg transition-colors cursor-pointer shadow-sm shadow-warning-main/10 flex items-center gap-1"
            >
              <span>View Book</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 premium-card p-5 bg-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Sales Overview</h3>
              <p className="text-xs text-text-secondary">Track books sold and revenue trends</p>
            </div>
            
            {/* Chart toggle filters */}
            <div className="flex items-center gap-1 bg-bg-app border border-border-light p-0.5 rounded-lg">
              <button
                onClick={() => setSalesTimeframe('7days')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  salesTimeframe === '7days' ? 'bg-white text-brand-emerald shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setSalesTimeframe('30days')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  salesTimeframe === '30days' ? 'bg-white text-brand-emerald shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                  labelStyle={{ fontWeight: 600, fontSize: '12px', color: '#111827' }}
                  itemStyle={{ fontSize: '12px', color: '#059669' }}
                  formatter={(value: any, name: any) => [
                    name === 'salesAmount' ? `₹${value.toLocaleString('en-IN')}` : `${value} Books`,
                    name === 'salesAmount' ? 'Sales Revenue' : 'Books Sold'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="salesAmount"
                  name="salesAmount"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Book Distribution Chart */}
        <div className="premium-card p-5 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Book Status Distribution</h3>
            <p className="text-xs text-text-secondary mb-3">Inventory status allocation shares</p>
          </div>

          <div className="h-[180px] relative flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-display text-text-primary leading-none">{kpis.total}</span>
              <span className="text-[10px] text-text-secondary mt-1 font-semibold uppercase tracking-wider">Total Books</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-light pt-3 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-text-secondary truncate">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ASSIGNED BOOKS TABLE */}
      <div className="premium-card bg-white border border-border-light shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Recent Assigned Books</h3>
            <p className="text-xs text-text-secondary">Books requiring review, sales status, or expiring soon</p>
          </div>
          <button
            onClick={() => navigate('/agent/books')}
            className="flex items-center gap-1 text-xs font-bold text-brand-emerald hover:text-brand-emerald-hover cursor-pointer"
          >
            <span>View All Books</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border-light">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book ID</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Game</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-center">Tickets</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Book Value</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Assigned Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Expiry Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-sm">
              {recentBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-text-primary">{book.id}</td>
                  <td className="p-4 font-semibold text-text-primary">{getGameName(book.gameId)}</td>
                  <td className="p-4 text-center font-medium text-text-secondary">{book.tickets.length}</td>
                  <td className="p-4 font-semibold text-text-primary">₹{book.bookValue.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-text-secondary text-xs">
                    {new Date(book.assignedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-text-secondary text-xs">
                    {new Date(book.expiryDate).toLocaleString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(book.status)}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/agent/books/${book.id}`)}
                      className="px-3 py-1 text-xs font-bold text-brand-emerald hover:text-brand-emerald-hover bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer transition-colors"
                    >
                      View
                    </button>
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
export default Dashboard;
