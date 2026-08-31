/**
 * ---------------------------------------------------------
 * File: navigation.ts
 * Purpose:
 * Constants for navigation.
 * ---------------------------------------------------------
 */

import {
  LayoutDashboard, TrendingUp, Clock, Bell, Cpu, Settings, User,
} from 'lucide-react';

// ─── Sidebar navigation items ─────────────────────────────────────────────────
// Application constants.
export const navItems: { id: string; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'history',   label: 'History',   icon: Clock },
  { id: 'alerts',    label: 'Alerts',    icon: Bell },
  { id: 'device',    label: 'Device',    icon: Cpu },
  { id: 'settings',  label: 'Settings',  icon: Settings },
  { id: 'profile',   label: 'Profile',   icon: User },
];
