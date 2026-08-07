/**
 * ─────────────────────────────────────────────────────────────────────────────
 * File: AppContext.tsx
 * Layer: Frontend / Context
 *
 * Purpose:
 * Provides a React Context for global application state that needs to be
 * shared across multiple components without prop-drilling.
 *
 * Current State:
 * The context is a placeholder with an empty value shape. It is ready
 * to be extended with auth state, theme preferences, or live UV data
 * in Phase 6 (Frontend ↔ Backend Integration).
 *
 * Extension Guide (Phase 6):
 * Add properties to `AppContextValue`:
 *   interface AppContextValue {
 *     user: User | null;
 *     token: string | null;
 *     login: (token: string, user: User) => void;
 *     logout: () => void;
 *   }
 *
 * Usage:
 * Wrap the app in <AppProvider> in main.tsx, then use:
 *   const { user } = useAppContext();
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext } from 'react';

/**
 * Shape of the global application context value.
 *
 * Currently empty — will be extended with auth, theme, and UV data
 * in Phase 6 when the frontend connects to the live backend.
 */
interface AppContextValue {
  // Placeholder — extend with auth, theme, or live UV state as needed
}

/** The global context instance. Defaults to an empty object. */
const AppContext = createContext<AppContextValue>({});

/**
 * AppProvider
 *
 * Wrap the entire application (or a subtree) with this provider
 * to make the context value available to all children via useAppContext().
 *
 * @param children - Child React nodes that will have context access.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppContext
 *
 * Custom hook that provides access to the global AppContext value.
 * Must be called from a component that is a descendant of AppProvider.
 *
 * @returns The current AppContextValue (currently empty, will grow in Phase 6).
 */
export function useAppContext() {
  return useContext(AppContext);
}
