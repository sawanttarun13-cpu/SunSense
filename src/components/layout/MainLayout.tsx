/**
 * ---------------------------------------------------------
 * File: MainLayout.tsx
 * Purpose:
 * React component for MainLayout.
 * ---------------------------------------------------------
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

const FONT: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

// Reusable MainLayout component.
export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ ...FONT, background: '#EEF4FF' }}>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
