import React, { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { PipelinePage } from './pages/PipelinePage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { DisclaimerToast } from './components/DisclaimerToast';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Manager' | 'Agent')[];
}> = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#004080] border-t-transparent animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#004080]">
            Loading Brokerage Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/clients" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <>
      {showDisclaimer && (
        <DisclaimerToast onClose={() => setShowDisclaimer(false)} />
      )}
      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/clients" replace />} />
          <Route path="clients" element={<ClientsListPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
