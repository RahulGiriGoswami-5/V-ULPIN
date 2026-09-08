import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AppProvider, useAuth } from './context/AppContext';
import { Notification } from './components/common';
import './index.css';

// Public pages
import Home from './pages/public/Home';
import { CitizenLogin, GovernmentLogin } from './pages/public/Login';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import PropertySearch from './pages/citizen/PropertySearch';
import PropertyIdentification from './pages/citizen/PropertyIdentification';
import VULPINGeneration from './pages/citizen/VULPINGeneration';
import SecureVULPIN from './pages/citizen/SecureVULPIN';

// Government pages
import GovDashboard from './pages/government/GovDashboard';
import GISPage from './pages/government/GISPage';
import LandRecordsPage from './pages/government/LandRecordsPage';
import ULPINSearch from './pages/government/ULPINSearch';
import ValidationPage from './pages/government/ValidationPage';
import AnalyticsPage from './pages/government/AnalyticsPage';
import ReportsPage from './pages/government/ReportsPage';
import HelpPage from './pages/government/HelpPage';

// ── Route Guards ─────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to={role === 'citizen' ? '/citizen/login' : '/government/login'} replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Notification />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/government/login" element={<GovernmentLogin />} />

        {/* Citizen (protected) */}
        <Route path="/citizen/dashboard" element={<RequireAuth role="citizen"><CitizenDashboard /></RequireAuth>} />
        <Route path="/citizen/search"    element={<RequireAuth role="citizen"><PropertySearch /></RequireAuth>} />
        <Route path="/citizen/property"  element={<RequireAuth role="citizen"><PropertyIdentification /></RequireAuth>} />
        <Route path="/citizen/generate"  element={<RequireAuth role="citizen"><VULPINGeneration /></RequireAuth>} />
        <Route path="/citizen/secure"    element={<RequireAuth role="citizen"><SecureVULPIN /></RequireAuth>} />

        {/* Government (protected) */}
        <Route path="/government/dashboard"  element={<RequireAuth role="government"><GovDashboard /></RequireAuth>} />
        <Route path="/government/gis"        element={<RequireAuth role="government"><GISPage /></RequireAuth>} />
        <Route path="/government/records"    element={<RequireAuth role="government"><LandRecordsPage /></RequireAuth>} />
        <Route path="/government/search"     element={<RequireAuth role="government"><ULPINSearch /></RequireAuth>} />
        <Route path="/government/validation" element={<RequireAuth role="government"><ValidationPage /></RequireAuth>} />
        <Route path="/government/analytics"  element={<RequireAuth role="government"><AnalyticsPage /></RequireAuth>} />
        <Route path="/government/reports"    element={<RequireAuth role="government"><ReportsPage /></RequireAuth>} />
        <Route path="/government/help"       element={<RequireAuth role="government"><HelpPage /></RequireAuth>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}
