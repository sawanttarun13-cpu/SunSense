/**
 * ---------------------------------------------------------
 * File: MiniMetric.tsx
 * Purpose:
 * React component for MiniMetric.
 * ---------------------------------------------------------
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme-provider';

// Reusable MiniMetric component.
export function MiniMetric({ label, value, bar, barColor, description, onClick }: { label: string; value: string; bar: number; barColor: string; description?: string; onClick?: () => void }) {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={onClick ? { y: -2, scale: 1.02 } : {}}
      className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm flex flex-col justify-between"
      style={{ 
        border: theme === 'dark' ? '1px solid #1E293B' : '1px solid #E8F0FE', 
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div>
        <div className="text-slate-500 dark:text-slate-400 mb-1" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div className="text-slate-800 dark:text-slate-100 font-bold mb-2.5" style={{ fontSize: '1.5rem' }}>{value}</div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mb-2">
          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${bar}%`, background: barColor }} />
        </div>
      </div>
      {description && (
        <div className="text-slate-400 dark:text-slate-500 mt-1" style={{ fontSize: '0.65rem', lineHeight: '1.3' }}>
          {description}
        </div>
      )}
    </motion.div>
  );
}
