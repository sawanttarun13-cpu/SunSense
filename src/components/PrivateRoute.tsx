/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/components/PrivateRoute.tsx
 * Layer: Frontend / Routing
 *
 * Purpose:
 * Protects routes that require authentication.
 * If the user is not authenticated, redirects to /login.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
