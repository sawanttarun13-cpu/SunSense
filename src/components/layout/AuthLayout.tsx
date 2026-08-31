/**
 * ---------------------------------------------------------
 * File: AuthLayout.tsx
 * Purpose:
 * React component for AuthLayout.
 * ---------------------------------------------------------
 */

import React from 'react';
import { GlobeCdn } from '../ui/cobe-globe-cdn';

const FONT: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

// Reusable AuthLayout component.
export function BrandPanel({ headline, sub, badge }: { headline: React.ReactNode; sub: string; badge: string }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)' }}
    >
      {/* 3D Rotating Globe Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70 transform translate-x-1/4 translate-y-1/3 mix-blend-screen" style={{ top: '25%' }}>
        <GlobeCdn className="w-[120%] h-[120%]" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center justify-center mb-6">
          <img src="/logo_dark_theme.png" alt="SunSense Logo" className="w-28 object-contain" />
        </div>
      </div>
      <div className="relative z-10 -translate-y-12">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6" style={{ background: 'rgba(255,255,255,0.12)', fontSize: '0.72rem', color: '#BFDBFE', backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          {badge}
        </div>
        <h1 className="text-white font-bold leading-tight mb-3" style={{ fontSize: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{headline}</h1>
        <p style={{ fontSize: '0.82rem', color: '#E0F2FE', lineHeight: 1.7, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>{sub}</p>
      </div>
      <div className="relative z-10" style={{ fontSize: '0.68rem', color: '#93C5FD' }}>© 2026 SunSense · SunSense-101</div>
    </div>
  );
}

export function AuthLayout({ children, brandProps }: { children: React.ReactNode, brandProps: { badge: string, headline: React.ReactNode, sub: string } }) {
  return (
    <div className="min-h-screen flex" style={FONT}>
      <BrandPanel {...brandProps} />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="flex items-center justify-center">
              <img src="/logo_dark_theme.png" alt="SunSense Logo" className="w-20 object-contain" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
