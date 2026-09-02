/**
 * ---------------------------------------------------------
 * File: LoadingState.tsx
 * Purpose:
 * React component for LoadingState.
 * ---------------------------------------------------------
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';

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
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-10 rounded-full"></div>
        <img 
          src="/logo_transparent.png" 
          alt="Loading..." 
          className="w-32 h-auto relative z-10 drop-shadow-md" 
        />
      </motion.div>
      <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">{message}</p>
    </div>
  );
}
