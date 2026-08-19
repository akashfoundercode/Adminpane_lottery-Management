import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider } from './context/AgentContext';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AgentLayout } from './components/AgentLayout';

// Agent Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import HistorySold from './pages/HistorySold';
import HistoryUnsold from './pages/HistoryUnsold';
import HistoryExpired from './pages/HistoryExpired';
import Winnings from './pages/Winnings';
import Profile from './pages/Profile';

// Admin Core Imports
import { AdminProvider as InternalAdminProvider } from './context/AdminContext';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminLayout } from './components/AdminLayout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGames from './pages/admin/AdminGames';
import AdminGameCreate from './pages/admin/AdminGameCreate';
import AdminGameDetails from './pages/admin/AdminGameDetails';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookDetails from './pages/admin/AdminBookDetails';
import AdminGenerateBooks from './pages/admin/AdminGenerateBooks';
import AdminBookAssignment from './pages/admin/AdminBookAssignment';
import AdminAssignmentHistory from './pages/admin/AdminAssignmentHistory';
import AdminSoldUnsold from './pages/admin/AdminSoldUnsold';
import AdminAgentsFirstParty from './pages/admin/AdminAgentsFirstParty';
import AdminAgentsThirdParty from './pages/admin/AdminAgentsThirdParty';
import AdminAgentDetails from './pages/admin/AdminAgentDetails';
import AdminAgentPerformance from './pages/admin/AdminAgentPerformance';
import AdminPrizes from './pages/admin/AdminPrizes';
import AdminResults from './pages/admin/AdminResults';
import AdminUploadResult from './pages/admin/AdminUploadResult';
import AdminWinners from './pages/admin/AdminWinners';
import AdminReportsSales from './pages/admin/AdminReportsSales';
import AdminReportsBooks from './pages/admin/AdminReportsBooks';
import AdminReportsAgents from './pages/admin/AdminReportsAgents';
import AdminReportsWinning from './pages/admin/AdminReportsWinning';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AgentProvider>
        <AdminProvider>
          <ToastProvider>
            <Routes>
              {/* Redirect root to admin dashboard */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Agent Login Route */}
              <Route path="/agent/login" element={<Login />} />

              {/* Protected Agent Routes */}
              <Route
                path="/agent/*"
                element={
                  <ProtectedRoute>
                    <AgentLayout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="books" element={<Books />} />
                        <Route path="books/:id" element={<BookDetails />} />
                        <Route path="history/sold" element={<HistorySold />} />
                        <Route path="history/unsold" element={<HistoryUnsold />} />
                        <Route path="history/expired" element={<HistoryExpired />} />
                        <Route path="winnings" element={<Winnings />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AgentLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="games" element={<AdminGames />} />
                        <Route path="games/create" element={<AdminGameCreate />} />
                        <Route path="games/:id" element={<AdminGameDetails />} />
                        <Route path="books" element={<AdminBooks />} />
                        <Route path="books/:id" element={<AdminBookDetails />} />
                        <Route path="generate-books" element={<AdminGenerateBooks />} />
                        <Route path="book-assignment" element={<AdminBookAssignment />} />
                        <Route path="assignment-history" element={<AdminAssignmentHistory />} />
                        <Route path="sold-unsold" element={<AdminSoldUnsold />} />
                        <Route path="agents/first-party" element={<AdminAgentsFirstParty />} />
                        <Route path="agents/third-party" element={<AdminAgentsThirdParty />} />
                        <Route path="agents/:id" element={<AdminAgentDetails />} />
                        <Route path="agent-performance" element={<AdminAgentPerformance />} />
                        <Route path="prizes" element={<AdminPrizes />} />
                        <Route path="results" element={<AdminResults />} />
                        <Route path="results/upload" element={<AdminUploadResult />} />
                        <Route path="winners" element={<AdminWinners />} />
                        <Route path="reports/sales" element={<AdminReportsSales />} />
                        <Route path="reports/books" element={<AdminReportsBooks />} />
                        <Route path="reports/agents" element={<AdminReportsAgents />} />
                        <Route path="reports/winning" element={<AdminReportsWinning />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />

              {/* Redirect all other unmatched routes to login */}
              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </ToastProvider>
        </AdminProvider>
      </AgentProvider>
    </BrowserRouter>
  );
}

export default App;
