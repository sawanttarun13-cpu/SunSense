import React, { createContext, useContext } from 'react';

// ─── App context shape (extend as features are added) ─────────────────────────
interface AppContextValue {
  // Placeholder — extend with auth, theme, or live UV state as needed
}

const AppContext = createContext<AppContextValue>({});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAppContext() {
  return useContext(AppContext);
}
