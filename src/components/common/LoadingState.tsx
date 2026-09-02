/**
 * ---------------------------------------------------------
 * File: LoadingState.tsx
 * Purpose:
 * React component for LoadingState.
 * ---------------------------------------------------------
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';

// Reusable LoadingState component.
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  useEffect(() => {
    // When the component UNMOUNTS, the page has finished loading!
    return () => {
      window.dispatchEvent(new Event('hide-splash'));
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 rounded-full"></div>
        <Sun size={48} strokeWidth={1.5} className="text-yellow-400 relative z-10" />
      </motion.div>
      <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">{message}</p>
    </div>
  );
}
