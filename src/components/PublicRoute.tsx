/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/components/PublicRoute.tsx
 * Layer: Frontend / Routing
 *
 * Purpose:
 * Protects public routes (like login/register).
 * If the user is already authenticated, redirects to /dashboard.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
