/**
 * ---------------------------------------------------------
 * File: Sidebar.tsx
 * Purpose:
 * React component for Sidebar.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Sun, Wifi, Battery, Menu, X, LogOut,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { navItems } from '../../constants/navigation';
import { deviceService } from '../../services/device.service';
import { settingsService } from '../../services/settings.service';
import { useUVData } from '../../hooks/useUVData';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

// navItems imported from constants/navigation

function SidebarContent({
  collapsed, setCollapsed, onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [deviceData, setDeviceData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);
  const { uvValue, zone } = useUVData();

  useEffect(() => {
    Promise.all([
      deviceService.getDeviceData(),
      settingsService.getAbout()
    ]).then(([d, a]) => {
      setDeviceData(d);
      setAboutData(a);
    });
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };
  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: 'linear-gradient(160deg, #0C1D3E 0%, #142A5C 60%, #1A3670 100%)' }}
    >
      {/* Brand header */}
      <div className={`flex items-center border-b border-white/8 ${collapsed ? 'justify-center px-3 py-4' : 'justify-between px-4 py-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
            >
              <Sun size={17} color="#fff" />
            </div>
            <div>
              <div className="text-white font-semibold leading-tight" style={{ fontSize: '0.875rem' }}>SunSense</div>
              <div style={{ color: '#7EB3FF', fontSize: '0.7rem' }}>SunSense-101</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <Sun size={17} color="#fff" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Live status pill */}
      {!collapsed && deviceData && (
        <div className="mx-3 mt-3 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4ADE80' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
              </span>
              <span style={{ color: '#4ADE80', fontSize: '0.7rem', fontWeight: 600 }}>LIVE · Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={11} style={{ color: '#7EB3FF' }} />
              <Battery size={13} style={{ color: '#7EB3FF' }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Current UV</div>
              <div style={{ color: '#FDA974', fontWeight: 700, fontSize: '0.9rem' }}>{uvValue.toFixed(1)} — {zone.label}</div>
            </div>
            <div className="text-right">
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Battery</div>
              <div style={{ color: '#7EB3FF', fontWeight: 600, fontSize: '0.85rem' }}>{deviceData.battery.level}%</div>
            </div>
          </div>
          {/* Battery bar */}
          <div className="mt-2.5 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-1 rounded-full" style={{ width: `${deviceData.battery.level}%`, background: 'linear-gradient(90deg, #3B82F6, #22C55E)' }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex-1 py-3 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const isActive = location.pathname.includes(id) || (id === 'dashboard' && location.pathname === '/');
          return (
            <button
              key={id}
              onClick={() => { navigate(`/${id}`); onNavClick?.(); }}
              title={collapsed ? label : undefined}
              className="w-full flex items-center rounded-xl transition-all duration-150 relative"
              style={{
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 12,
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.85), rgba(29,78,216,0.85))'
                  : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.5)'; }}
            >
              {isActive && !collapsed && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: '#93C5FD' }}
                />
              )}
              <Icon size={17} />
              {!collapsed && (
                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400 }}>{label}</span>
              )}
              {!collapsed && badge && (
                <span
                  className="ml-auto rounded-full px-1.5 flex items-center justify-center"
                  style={{ background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, minWidth: 18, height: 18 }}
                >
                  {badge}
                </span>
              )}
              {collapsed && badge && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: '#EF4444' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Expand button (collapsed) */}
      {collapsed && (
        <div className="px-2 pb-4">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 mb-2.5 transition-all"
            style={{ background: 'rgba(239,68,68,0.10)', color: '#FCA5A5' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.20)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.10)')}
          >
            <LogOut size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Log out</span>
          </button>
          {deviceData && aboutData && (
            <div className="flex items-center justify-between">
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>{aboutData.appVersion} · Firmware {aboutData.firmware}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>Sync {deviceData.system.lastUpdate}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Sidebar component.
export function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 rounded-xl p-2 shadow-lg"
        style={{ background: '#0C1D3E', color: '#fff' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile close button */}
      {mobileOpen && (
        <button
          className="md:hidden fixed top-4 left-56 z-50 rounded-xl p-2"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      )}

      {/* Mobile drawer */}
      <div
        className="md:hidden fixed left-0 top-0 h-full z-50 transition-transform duration-300"
        style={{ width: 224, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <SidebarContent {...props} onNavClick={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: props.collapsed ? 68 : 224 }}
      >
        <SidebarContent {...props} />
      </div>
    </>
  );
}
