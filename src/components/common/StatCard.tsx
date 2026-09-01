/**
 * ---------------------------------------------------------
 * File: StatCard.tsx
 * Purpose:
 * React component for StatCard.
 * ---------------------------------------------------------
 */

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme-provider';

// Reusable StatCard component.
export function StatCard({
  icon: Icon, label, value, sub, delta, iconColor, iconBg, delay = 0,
}: {
  icon: React.ElementType; label: string; value: string; sub: string;
  delta?: { dir: 'up' | 'down'; val: string }; iconColor: string; iconBg: string; delay?: number;
}) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, scale: 1.01, boxShadow: theme === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)' }}
      className="rounded-2xl p-4 flex gap-3 items-start border backdrop-blur-xl relative overflow-hidden" 
      style={{ 
        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,1)',
        boxShadow: theme === 'dark' ? '0 4px 24px -4px rgba(0,0,0,0.4)' : '0 4px 24px -4px rgba(0,0,0,0.03)',
      }}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="rounded-xl p-2.5 flex-shrink-0 relative z-10" style={{ background: iconBg }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 relative z-10">
        <div className="text-slate-500 dark:text-slate-400" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
        <div className="text-slate-800 dark:text-slate-100 font-bold mt-0.5" style={{ fontSize: '0.95rem' }}>{value}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: '0.7rem' }}>{sub}</span>
          {delta && (
            <span
              className="flex items-center gap-0.5 font-medium"
              style={{ fontSize: '0.65rem', color: delta.dir === 'up' ? '#F87171' : '#4ADE80' }}
            >
              {delta.dir === 'up' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {delta.val}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
