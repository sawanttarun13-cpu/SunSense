import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  videoSrc?: string;
}

export function SplashScreen({ onComplete, videoSrc }: SplashScreenProps) {
  // Automatically trigger onComplete after 3 seconds so the app continues loading
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <motion.div
      key="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 overflow-hidden"
    >
      {videoSrc ? (
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 opacity-90" />
      )}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-6 relative"
        >
          {/* Subtle glow effect behind the sun */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl"
          />
          <Sun size={80} className="text-yellow-400 relative z-10" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            SunSense
          </h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
