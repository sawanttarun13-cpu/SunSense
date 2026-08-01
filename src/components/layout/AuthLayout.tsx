import { Sun } from 'lucide-react';
import React from 'react';

const FONT: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

export function BrandPanel({ headline, sub, badge }: { headline: React.ReactNode; sub: string; badge: string }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-2/5 p-12"
      style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Sun size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold" style={{ fontSize: '1rem' }}>SunSense</span>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6" style={{ background: 'rgba(255,255,255,0.12)', fontSize: '0.72rem', color: '#BFDBFE' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          {badge}
        </div>
        <h1 className="text-white font-bold leading-tight mb-3" style={{ fontSize: '2rem' }}>{headline}</h1>
        <p style={{ fontSize: '0.82rem', color: '#93C5FD', lineHeight: 1.7 }}>{sub}</p>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#60A5FA' }}>© 2025 SunSense · SunSense-101</div>
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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2563EB' }}><Sun size={15} className="text-white" /></div>
            <span className="font-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>SunSense</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
