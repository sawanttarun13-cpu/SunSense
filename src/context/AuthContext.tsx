/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/context/AuthContext.tsx
 * Layer: Frontend / Context
 *
 * Purpose:
 * Provides authentication state and methods to the entire application.
 * Manages the current user, session restoration on mount, and login/logout flows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { authService } from '../services/auth.service';
import { setAccessToken, clearAccessToken } from '../lib/apiClient';
import type { User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // isLoading is true initially while we check if the user has a valid refresh token.
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // Attempt to refresh the token using the HttpOnly cookie.
        // We use a raw axios call to avoid interceptor loops.
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (!mounted) return;

        const token = res.data.data.token;
        setAccessToken(token);

        // Now fetch the user profile using the authenticated apiClient
        const me = await authService.getMe();
        if (mounted) {
          setUser(me);
        }
      } catch (error) {
        // If refresh fails (e.g., no cookie or expired), we are unauthenticated.
        clearAccessToken();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    await authService.register({ email, password, name });
    // After successful registration, we do NOT automatically log in yet.
    // The component handling registration will call login() immediately after.
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Even if the backend call fails (e.g., network error), we still clear local state.
      console.error('Logout API call failed', e);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
