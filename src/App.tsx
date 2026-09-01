/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: App.tsx
 * Layer: Frontend Root Component / Router
 *
 * Purpose:
 * The top-level React component. Sets up client-side routing with
 * react-router-dom's BrowserRouter and defines the complete route tree.
 *
 * Route Architecture:
 * Two route groups:
 *
 * 1. Public Routes (no layout):
 *    /login    → <Login /> — Authentication page
 *    /register → <Register /> — Registration page
 *
 * 2. Protected Routes (wrapped in <MainLayout />):
 *    MainLayout renders the sidebar, header, and main content area.
 *    All pages inside this group share the persistent navigation shell.
 *
 *    /           → Redirects to /dashboard (Navigate component)
 *    /dashboard  → <Dashboard /> — Live UV metrics and device status
 *    /analytics  → <Analytics /> — Time-series charts (daily/weekly/monthly)
 *    /history    → <History />   — Paginated exposure session history
 *    /alerts     → <Alerts />    — Smart alert list and read-tracking
 *    /device     → <Device />    — Device registration and status page
 *    /settings   → <SettingsPage /> — App settings and notifications
 *    /profile    → <Profile />   — User profile with skin type editor
 *
 * Note:
 * Authentication gating (redirect to /login if not authenticated) is
 * planned for Phase 6 when the frontend connects to the backend.
 * Currently, all routes are accessible for UI development.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { History } from './pages/History';
import { Alerts } from './pages/Alerts';
import { Device } from './pages/Device';
import { SettingsPage } from './pages/SettingsPage';
import { Profile } from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';

import { SocketProvider } from './context/SocketContext';
import { Toaster } from './components/ui/sonner';
import { GlobalAlertListener } from './components/GlobalAlertListener';

import { ThemeProvider } from './components/theme-provider';

/**
 * Root application component.
 *
 * Renders the BrowserRouter and complete route tree.
 * All page-level code splitting and lazy loading should be
 * applied at the Route level in a future performance pass.
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sunsense-theme">
      <AuthProvider>
      <SocketProvider>
        <Toaster position="top-left" />
        <GlobalAlertListener />
        <BrowserRouter>
          <Routes>
            {/* Public auth pages (no sidebar/header layout) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/register" element={<Register />} />

          {/* Protected pages — wrapped in the persistent sidebar/header shell */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              {/* Root redirects to the dashboard as the default landing page */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/device" element={<Device />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
