import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider, AdminProvider, ToastProvider } from './shared/contexts';
import { AdminProtectedRoute, ProtectedRoute } from './shared/components';
import { AgentLayout, AdminLayout } from './layouts';

// Agent Pages
import {
  Login,
  Dashboard,
  Books,
  BookDetails,
  HistorySold,
  HistoryUnsold,
  HistoryExpired,
  Winnings,
  Profile
} from './modules/agent/pages';

// Admin Core Imports
import {
  AdminLogin,
  AdminDashboard,
  AdminGames,
  AdminGameCreate,
  AdminGameDetails,
  AdminBooks,
  AdminBookDetails,
  AdminGenerateBooks,
  AdminBookAssignment,
  AdminAssignmentHistory,
  AdminSoldUnsold,
  AdminReopenRequests,
  AdminAgentsFirstParty,
  AdminAgentsThirdParty,
  AdminAgentDetails,
  AdminAgentPerformance,
  AdminPrizes,
  AdminResults,
  AdminUploadResult,
  AdminWinners,
  AdminReportsSales,
  AdminReportsBooks,
  AdminReportsAgents,
  AdminReportsWinning,
  AdminSettings
} from './modules/admin/pages';

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
                        <Route path="reopen-requests" element={<AdminReopenRequests />} />
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
