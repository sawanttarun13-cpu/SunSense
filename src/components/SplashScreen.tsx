import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let hideRequested = false;
    let minTimeElapsed = false;

    // Minimum display time is 2 seconds
    const minTimer = setTimeout(() => {
      minTimeElapsed = true;
      if (hideRequested) {
        setIsVisible(false);
      }
    }, 2000);

    const handleHide = () => {
      hideRequested = true;
      if (minTimeElapsed) {
        setIsVisible(false);
      }
    };
    window.addEventListener('hide-splash', handleHide);

    // Failsafe: hide after 15 seconds if nothing else triggers it
    const failsafe = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    return () => {
      window.removeEventListener('hide-splash', handleHide);
      clearTimeout(minTimer);
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}
    >
      {/* Dynamic background glow */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-yellow-400 rounded-full blur-[80px]"
      />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30 rounded-full scale-110"></div>
          <Sun size={96} strokeWidth={1.5} className="text-yellow-400 relative z-10" />
        </motion.div>
        
        <h1 className="text-5xl font-bold text-white tracking-tight flex items-center gap-1 mb-3">
          Sun<span className="text-blue-400">Sense</span>
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-2 text-blue-200/70 font-medium tracking-[0.2em] text-sm"
        >
          <div className="w-8 h-[1px] bg-blue-400/30"></div>
          SMART UV TRACKING
          <div className="w-8 h-[1px] bg-blue-400/30"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
