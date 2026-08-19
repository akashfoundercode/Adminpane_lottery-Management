import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  Dices,
  BookOpen,
  FilePlus,
  UserPlus,
  History,
  Users,
  TrendingUp,
  Trophy,
  FileText,
  UploadCloud,
  Award,
  BarChart2,
  PieChart,
  LineChart,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, adminLogout } = useAdmin();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    showToast('Logged out successfully.', 'info');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Games', path: '/admin/games', icon: Dices },
    { name: 'Books', path: '/admin/books', icon: BookOpen },
    { name: 'Generate Books', path: '/admin/generate-books', icon: FilePlus },
    { name: 'Book Assignment', path: '/admin/book-assignment', icon: UserPlus },
    { name: 'Assignment History', path: '/admin/assignment-history', icon: History },
    { name: 'First Party Agents', path: '/admin/agents/first-party', icon: Users },
    { name: 'Third Party Agents', path: '/admin/agents/third-party', icon: Users },
    { name: 'Agent Performance', path: '/admin/agent-performance', icon: TrendingUp },
    { name: 'Prize Management', path: '/admin/prizes', icon: Trophy },
    { name: 'Results', path: '/admin/results', icon: FileText },
    { name: 'Upload Result', path: '/admin/results/upload', icon: UploadCloud },
    { name: 'Winners', path: '/admin/winners', icon: Award },
    { name: 'Sales Reports', path: '/admin/reports/sales', icon: BarChart2 },
    { name: 'Book Reports', path: '/admin/reports/books', icon: PieChart },
    { name: 'Agent Reports', path: '/admin/reports/agents', icon: LineChart },
    { name: 'Winning Reports', path: '/admin/reports/winning', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/admin/games' && location.pathname.startsWith('/admin/games/')) {
      return true;
    }
    if (path === '/admin/books' && location.pathname.startsWith('/admin/books/')) {
      return true;
    }
    if (path === '/admin/agents/first-party' && location.pathname === '/admin/agents/first-party') {
      return true;
    }
    if (path === '/admin/agents/third-party' && location.pathname === '/admin/agents/third-party') {
      return true;
    }
    if (location.pathname.startsWith('/admin/agents/') && !location.pathname.includes('first-party') && !location.pathname.includes('third-party') && !location.pathname.includes('performance')) {
      return path === '/admin/agents/first-party';
    }
    return location.pathname === path;
  };

  // Build Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, idx) => {
      const routeTo = '/' + paths.slice(0, idx + 1).join('/');
      const isLast = idx === paths.length - 1;
      const formattedName = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        name: formattedName === 'Admin' ? 'Home' : formattedName,
        path: routeTo,
        isLast
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const mockNotifications = [
    { id: 1, text: 'Agent Ramesh Kumar marked Book BK1101 as Sold', time: '5 mins ago' },
    { id: 2, text: 'New Ticket generated for Mega Lucky Draw', time: '10 mins ago' },
    { id: 3, text: 'System automatic draw scheduled in 2 hours', time: '1 hour ago' },
    { id: 4, text: 'Result draft saved for Summer Lucky Draw', time: '4 hours ago' }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F9FC] flex font-sans">
      {/* DESKTOP SIDEBAR - width collapses smoothly from 260px to 70px */}
      <aside className={`h-full hidden lg:flex flex-col bg-[#1e1b4b] text-slate-300 flex-shrink-0 border-r border-indigo-950 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-[75px]' : 'w-[260px]'
      }`}>
        {/* LOGO AREA */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-indigo-950/50 bg-[#151233] transition-all flex-shrink-0 ${
          isSidebarCollapsed ? 'justify-center px-2' : ''
        }`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-950/50 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-[15px] text-white tracking-wide leading-tight">
                Lottery & Lucky Draw
              </span>
              <span className="text-[10px] text-indigo-400 font-medium font-sans">
                Management System
              </span>
            </div>
          )}
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.path}
                title={isSidebarCollapsed ? item.name : undefined}
                className={`flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                  isSidebarCollapsed ? 'justify-center p-2.5 mx-1.5' : 'gap-3 px-4 py-2.5'
                } ${
                  active
                    ? 'bg-[#6366f1] text-white font-semibold shadow-sm'
                    : 'hover:bg-indigo-900/30 hover:text-white text-slate-300'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                    active ? 'text-white' : 'text-indigo-400 group-hover:text-white'
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON AT SIDEBAR BOTTOM */}
        <div className={`p-4 border-t border-indigo-950/40 bg-[#161338] ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors rounded-lg ${
              isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 w-full px-4 py-2.5 text-[13px]'
            }`}
            title="Log Out Admin"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!isSidebarCollapsed && <span>Log Out Admin</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[270px] bg-[#1e1b4b] text-slate-300 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-indigo-950/50 bg-[#151233]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-extrabold text-[14px] text-white tracking-wide">
                      Lottery & Lucky Draw
                    </span>
                    <span className="text-[9px] text-indigo-400 font-medium">
                      Management System
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg bg-indigo-950 text-indigo-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {menuItems.map((item, idx) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                        active
                          ? 'bg-[#6366f1] text-white font-semibold'
                          : 'hover:bg-indigo-900/40 hover:text-white text-slate-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-indigo-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-indigo-950 bg-[#161338]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[13px] font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Admin</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* HEADER NAVBAR */}
        <header className="h-[65px] bg-white border-b border-border-light flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
          {/* LEFT: HAMBURGER & TITLE */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar toggle slider */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:block p-2 -ml-2 rounded-lg text-text-secondary hover:bg-slate-100 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* BREADCRUMB */}
            <div className="hidden md:flex flex-col">
              <h1 className="font-display font-semibold text-text-primary text-[15px] leading-tight">
                {breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
                <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">
                  Home
                </Link>
                {breadcrumbs.map((crumb, idx) => {
                  if (crumb.name === 'Home' || crumb.name === 'Admin') return null;
                  return (
                    <React.Fragment key={idx}>
                      <span className="text-[9px] text-slate-400">/</span>
                      <span className={crumb.isLast ? 'text-indigo-600 font-medium' : 'hover:text-indigo-600 transition-colors'}>
                        {crumb.name}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: NOTIFICATIONS & PROFILE */}
          <div className="flex items-center gap-4">
            {/* NOTIFICATION BUTTON */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-text-secondary relative transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-rose-500 border border-white" />
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-[320px] bg-white border border-border-light shadow-xl rounded-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border-light bg-slate-50 flex items-center justify-between">
                        <span className="font-semibold text-xs text-text-primary">Notifications</span>
                        <span className="text-[10px] text-indigo-600 hover:underline cursor-pointer">Mark all read</span>
                      </div>
                      <div className="divide-y divide-border-light max-h-[300px] overflow-y-auto">
                        {mockNotifications.map(notif => (
                          <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                            <p className="text-xs text-text-primary leading-snug">{notif.text}</p>
                            <span className="text-[9px] text-text-secondary mt-1 block">{notif.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-3 text-left hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="w-[34px] h-[34px] rounded-full bg-[#e0e7ff] text-indigo-600 font-semibold flex items-center justify-center shadow-inner text-xs border border-indigo-100 uppercase">
                  {adminUser?.name ? adminUser.name.slice(0, 2) : 'AD'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold text-text-primary leading-none">
                    {adminUser?.name || 'Admin'}
                  </span>
                  <span className="text-[9px] text-text-secondary mt-0.5 font-medium uppercase tracking-wider">
                    {adminUser?.role || 'Super Admin'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden md:block" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-[180px] bg-white border border-border-light shadow-xl rounded-xl z-50 py-1"
                    >
                      <div className="px-4 py-2 border-b border-border-light block lg:hidden">
                        <p className="text-xs font-bold text-text-primary">{adminUser?.name}</p>
                        <p className="text-[9px] text-text-secondary uppercase">{adminUser?.role}</p>
                      </div>
                      <Link
                        to="/admin/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-text-primary hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-text-secondary" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 w-full text-left transition-colors border-t border-border-light"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
