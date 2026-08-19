import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  XOctagon,
  AlertTriangle,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AgentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { agent, logout } = useAgent();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/agent/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Books', path: '/agent/books', icon: BookOpen },
    { name: 'Sold History', path: '/agent/history/sold', icon: CheckSquare },
    { name: 'Unsold History', path: '/agent/history/unsold', icon: XOctagon },
    { name: 'Unsold by Admin', path: '/agent/history/expired', icon: AlertTriangle },
    { name: 'Winning History', path: '/agent/winnings', icon: Trophy },
    { name: 'Profile', path: '/agent/profile', icon: User }
  ];

  // Helper to check if a route is active
  const isActive = (path: string) => {
    if (path === '/agent/books' && location.pathname.startsWith('/agent/books/')) {
      return true; // Match detail pages
    }
    return location.pathname === path;
  };

  // Breadcrumbs builder
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p && p !== 'agent');
    const breadcrumbs = [{ name: 'Agent', path: '/agent/dashboard' }];

    if (paths[0] === 'dashboard') {
      breadcrumbs.push({ name: 'Dashboard', path: '/agent/dashboard' });
    } else if (paths[0] === 'books') {
      breadcrumbs.push({ name: 'Assigned Books', path: '/agent/books' });
      if (paths[1]) {
        breadcrumbs.push({ name: paths[1], path: `/agent/books/${paths[1]}` });
      }
    } else if (paths[0] === 'history') {
      breadcrumbs.push({ name: 'History', path: '#' });
      if (paths[1] === 'sold') {
        breadcrumbs.push({ name: 'Sold History', path: '/agent/history/sold' });
      } else if (paths[1] === 'unsold') {
        breadcrumbs.push({ name: 'Unsold History', path: '/agent/history/unsold' });
      } else if (paths[1] === 'expired') {
        breadcrumbs.push({ name: 'Unsold by Admin', path: '/agent/history/expired' });
      }
    } else if (paths[0] === 'winnings') {
      breadcrumbs.push({ name: 'Winning History', path: '/agent/winnings' });
    } else if (paths[0] === 'profile') {
      breadcrumbs.push({ name: 'Profile', path: '/agent/profile' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-bg-app flex">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-border-light transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } shrink-0 fixed top-0 bottom-0 left-0 z-40`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-light">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-white font-bold text-lg font-display">
                L
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary leading-none font-display">LuckyDraw</h1>
                <span className="text-[10px] text-brand-emerald font-semibold uppercase tracking-wider">
                  Agent Portal
                </span>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-white font-bold text-lg mx-auto">
              L
            </div>
          )}
          
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-text-secondary hover:bg-gray-100 p-1.5 rounded-lg cursor-pointer transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-emerald-50 text-brand-emerald border-l-2 border-brand-emerald'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-brand-emerald' : 'text-text-secondary group-hover:text-text-primary'}`} />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-border-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-danger-main hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 md:hidden flex flex-col shadow-2xl border-r border-border-light"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center text-white font-bold text-lg font-display">
                    L
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-text-primary leading-none font-display">LuckyDraw</h1>
                    <span className="text-[10px] text-brand-emerald font-semibold uppercase tracking-wider">
                      Agent Portal
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-text-secondary hover:bg-gray-100 p-1.5 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                  const active = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-emerald-50 text-brand-emerald border-l-2 border-brand-emerald'
                          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-brand-emerald' : 'text-text-secondary'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-border-light">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-danger-main hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT WORKSPACE */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Navigation Header */}
        <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden text-text-secondary hover:bg-gray-100 p-1.5 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs (Hidden on tiny screens) */}
            <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-text-secondary">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.name}>
                  {idx > 0 && <span className="text-gray-300 font-light">/</span>}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-text-primary">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.path === '#' ? '#' : crumb.path}
                      className="hover:text-text-primary transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-4">
            {/* Search Input Widget */}
            <div className="relative hidden lg:block w-64">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Quick search Book ID..."
                className="w-full pl-9 pr-4 py-1.5 bg-bg-app border border-border-light rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-brand-emerald transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.trim().toUpperCase();
                    if (val) {
                      navigate(`/agent/books?search=${val}`);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="p-2 text-text-secondary hover:bg-gray-100 rounded-lg cursor-pointer transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning-main rounded-full" />
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-border-light rounded-xl shadow-xl z-50 p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                          Notifications
                        </h4>
                        <span className="text-[10px] bg-amber-50 text-warning-main font-semibold px-2 py-0.5 rounded-full">
                          1 Critical
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div
                          className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 cursor-pointer"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            navigate('/agent/books/BK1040');
                          }}
                        >
                          <p className="text-xs font-semibold text-warning-main">Action Required</p>
                          <p className="text-[11px] text-text-primary mt-0.5">
                            Book <strong className="font-mono">BK1040</strong> expires in less than 3 hours.
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-border-light">
                          <p className="text-xs font-semibold text-text-primary">System Update</p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Welcome to the new premium SaaS Dashboard UI.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                {/* Avatar with initial */}
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald font-semibold text-sm">
                  RK
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-text-primary leading-none">
                    {agent?.name || 'Rajesh Kumar'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-main" />
                    <span className="text-[10px] text-success-main font-medium">Online</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-border-light rounded-xl shadow-xl z-50 py-1"
                    >
                      <div className="px-4 py-2 border-b border-border-light">
                        <p className="text-xs text-text-secondary font-medium">Signed in as</p>
                        <p className="text-xs font-bold text-text-primary truncate mt-0.5">
                          {agent?.agentId || 'AG1001'}
                        </p>
                      </div>
                      <Link
                        to="/agent/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-text-secondary" />
                        My Profile
                      </Link>
                      <Link
                        to="/agent/profile?tab=security"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-text-secondary" />
                        Change Password
                      </Link>
                      <hr className="border-border-light my-1" />
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-danger-main hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Page Content Wrapper */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
export default AgentLayout;
