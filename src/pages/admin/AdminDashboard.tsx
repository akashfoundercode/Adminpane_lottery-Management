import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  Gamepad2,
  BookOpen,
  Tag,
  Users,
  IndianRupee,
  Activity,
  Clock,
  CheckCircle2,
  ShoppingCart,
  XCircle,
  UserX,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { games, books, agents, winnings } = useAdmin();
  const navigate = useNavigate();

  // Metrics calculations
  const totalGames = 12; // Static from reference
  const totalBooks = 1250; // Static from reference
  const totalTickets = 125000; // Static from reference
  const totalAgents = 156; // Static from reference
  const totalSalesAmount = 1245500; // Static from reference

  const liveGamesCount = 2;
  const upcomingGamesCount = 4;
  const completedGamesCount = 6;
  const soldBooksCount = 850;
  const unsoldBooksCount = 150;
  const unsoldByAdminCount = 80;
  const availableBooksCount = 170;

  // Chart 1: Sales Overview Data (14 May 2025 - 14 June 2025)
  const salesData = [
    { date: '14 May', sales: 20000 },
    { date: '19 May', sales: 35000 },
    { date: '24 May', sales: 22000 },
    { date: '29 May', sales: 32000 },
    { date: '03 June', sales: 26000 },
    { date: '08 June', sales: 28000 },
    { date: '14 June', sales: 42000 }
  ];

  // Chart 2: Book Status Overview Data
  const bookStatusData = [
    { name: 'Sold Books', value: soldBooksCount, color: '#10B981', percentage: '68%' },
    { name: 'Unsold Books', value: unsoldBooksCount, color: '#F59E0B', percentage: '12%' },
    { name: 'Unsold by Admin', value: unsoldByAdminCount, color: '#EF4444', percentage: '6%' },
    { name: 'Available Books', value: availableBooksCount, color: '#3B82F6', percentage: '14%' }
  ];

  // Top Agents Table (Static from reference image)
  const topAgents = [
    { name: 'Ramesh Kumar', type: 'First Party', totalBooks: 120, soldBooks: 110, salesAmount: 120000 },
    { name: 'Suresh Singh', type: 'First Party', totalBooks: 100, soldBooks: 95, salesAmount: 95000 },
    { name: 'Amit Verma', type: 'Third Party', totalBooks: 80, soldBooks: 70, salesAmount: 70000 },
    { name: 'Vikash Gupta', type: 'First Party', totalBooks: 90, soldBooks: 65, salesAmount: 65000 },
    { name: 'Pawan Kumar', type: 'Third Party', totalBooks: 70, soldBooks: 60, salesAmount: 60000 }
  ];

  // Recent Games Table (Static from reference image)
  const recentGames = [
    { name: 'Summer Lucky Draw', drawDate: '20 May 2025', status: 'Live', totalBooks: 200, soldBooks: 150 },
    { name: 'Mega Bumper Draw', drawDate: '25 May 2025', status: 'Upcoming', totalBooks: 300, soldBooks: 80 },
    { name: 'Diwali Special Draw', drawDate: '30 May 2025', status: 'Upcoming', totalBooks: 250, soldBooks: 60 },
    { name: 'Holiday Lucky Draw', drawDate: '05 June 2025', status: 'Completed', totalBooks: 150, soldBooks: 150 },
    { name: 'New Year Bumper Draw', drawDate: '10 June 2025', status: 'Completed', totalBooks: 350, soldBooks: 320 }
  ];

  const formatRupee = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER SECTION WITH BREADCRUMB AND DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary font-display">Dashboard</h2>
          <p className="text-xs text-text-secondary">Home / Dashboard</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border-light rounded-xl px-3 py-1.5 shadow-sm text-xs font-semibold text-text-primary">
          <Clock className="w-3.5 h-3.5 text-text-secondary" />
          <span>14 May 2025 - 14 June 2025</span>
        </div>
      </div>

      {/* ROW 1: PRIMARY STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1: Total Games */}
        <div className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Total Games</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{totalGames}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-[#6366f1] flex items-center justify-center border border-violet-100">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <Link to="/admin/games" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 group">
            All Games <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 2: Total Books */}
        <div className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Total Books</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{totalBooks.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <Link to="/admin/books" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 group">
            All Books <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Total Tickets */}
        <div className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Total Tickets</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{totalTickets.toLocaleString()}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <Link to="/admin/books" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 group">
            All Tickets <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 4: Total Agents */}
        <div className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Total Agents</span>
              <span className="text-2xl font-bold text-text-primary mt-1">{totalAgents}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <Link to="/admin/agent-performance" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 group">
            All Agents <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 5: Total Sales */}
        <div className="premium-card p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Total Sales</span>
              <span className="text-xl font-extrabold text-text-primary mt-1">{formatRupee(totalSalesAmount)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <Link to="/admin/reports/sales" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-4 group">
            Total Amount <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ROW 2: MINI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Live Games */}
        <div className="bg-[#EBF7EE] border border-[#D1F0D7] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider">Live Games</span>
              <span className="text-xl font-extrabold text-[#14532d] mt-1">{liveGamesCount}</span>
            </div>
            <Activity className="w-5 h-5 text-[#22c55e] animate-pulse" />
          </div>
          <Link to="/admin/games?status=Live" className="text-[10px] font-semibold text-[#15803d] flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>

        {/* Upcoming Games */}
        <div className="bg-[#EFF6FF] border border-[#DBEAFE] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Upcoming Games</span>
              <span className="text-xl font-extrabold text-indigo-900 mt-1">{upcomingGamesCount}</span>
            </div>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <Link to="/admin/games?status=Upcoming" className="text-[10px] font-semibold text-indigo-700 flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>

        {/* Completed Games */}
        <div className="bg-[#F5F3FF] border border-[#EDE9FE] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Completed Games</span>
              <span className="text-xl font-extrabold text-violet-900 mt-1">{completedGamesCount}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-violet-500" />
          </div>
          <Link to="/admin/games?status=Completed" className="text-[10px] font-semibold text-violet-700 flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>

        {/* Sold Books */}
        <div className="bg-[#ECFDF5] border border-[#D1FAE5] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sold Books</span>
              <span className="text-xl font-extrabold text-emerald-900 mt-1">{soldBooksCount}</span>
            </div>
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
          </div>
          <Link to="/admin/books?status=Sold" className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>

        {/* Unsold Books */}
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Unsold Books</span>
              <span className="text-xl font-extrabold text-amber-900 mt-1">{unsoldBooksCount}</span>
            </div>
            <XCircle className="w-5 h-5 text-amber-500" />
          </div>
          <Link to="/admin/books?status=Unsold" className="text-[10px] font-semibold text-amber-700 flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>

        {/* Unsold by Admin */}
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-4 rounded-2xl flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Unsold by Admin</span>
              <span className="text-xl font-extrabold text-rose-900 mt-1">{unsoldByAdminCount}</span>
            </div>
            <UserX className="w-5 h-5 text-rose-500" />
          </div>
          <Link to="/admin/books?status=Unsold%20by%20Admin" className="text-[10px] font-semibold text-rose-700 flex items-center gap-1 hover:underline mt-2">
            View Details &gt;
          </Link>
        </div>
      </div>

      {/* ROW 3: SALES OVERVIEW CHART & RECENT GAMES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Line/Area Chart */}
        <div className="premium-card p-6 bg-white border border-border-light lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-text-primary text-[14px]">Sales Overview</h3>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-[11px] font-semibold rounded-lg px-2.5 py-1 text-text-primary focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(val) => `${val / 1000}K`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  labelStyle={{ fontWeight: 600, fontSize: '11px', color: '#1E293B' }}
                  itemStyle={{ fontSize: '11px', color: '#6366f1' }}
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Sales Amount']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
            <span className="text-[10px] text-text-secondary font-medium">Sales Amount (₹)</span>
          </div>
        </div>

        {/* Recent Games Table */}
        <div className="premium-card p-6 bg-white border border-border-light lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-text-primary text-[14px]">Recent Games</h3>
            <Link to="/admin/games" className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-light bg-slate-50/50">
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider">Game Name</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider">Draw Date</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider">Status</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider text-right">Total Books</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider text-right">Sold Books</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentGames.map((game, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-text-primary">{game.name}</td>
                    <td className="py-2.5 px-3 text-text-secondary font-medium">{game.drawDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        game.status === 'Live' ? 'bg-emerald-100 text-emerald-800' :
                        game.status === 'Upcoming' ? 'bg-sky-100 text-sky-800' :
                        'bg-violet-100 text-violet-800'
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-text-primary font-medium">{game.totalBooks}</td>
                    <td className="py-2.5 px-3 text-right text-text-primary font-medium">{game.soldBooks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW 4: TOP AGENTS & BOOK STATUS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Agents By Sales Table */}
        <div className="premium-card p-6 bg-white border border-border-light lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-text-primary text-[14px]">Top Agents (By Sales)</h3>
            <Link to="/admin/agent-performance" className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-light bg-slate-50/50">
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider">Agent Name</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider">Type</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider text-right">Total Books</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider text-right">Sold Books</th>
                  <th className="pb-3 pt-2 px-3 font-semibold text-text-secondary text-[10px] uppercase tracking-wider text-right">Sales Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {topAgents.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-text-primary">{agent.name}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        agent.type === 'First Party' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {agent.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-text-secondary font-medium">{agent.totalBooks}</td>
                    <td className="py-3 px-3 text-right text-text-primary font-medium">{agent.soldBooks}</td>
                    <td className="py-3 px-3 text-right font-bold text-text-primary">{formatRupee(agent.salesAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Book Status Overview Pie/Donut Chart */}
        <div className="premium-card p-6 bg-white border border-border-light lg:col-span-5 flex flex-col">
          <h3 className="font-display font-bold text-text-primary text-[14px] mb-4">Book Status Overview</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Donut Chart */}
            <div className="w-[180px] h-[180px] relative flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bookStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Labels */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-text-primary tracking-tight leading-none mt-1">{totalBooks}</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full space-y-2.5">
              {bookStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-text-primary text-right">
                    {item.value} <span className="text-[10px] text-text-secondary font-normal ml-0.5">({item.percentage})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
