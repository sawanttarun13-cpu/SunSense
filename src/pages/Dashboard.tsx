/**
 * ---------------------------------------------------------
 * File: Dashboard.tsx
 * Purpose:
 * React page component for Dashboard.
 * ---------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sun } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { UVGauge } from '../components/common/UVGauge';
import { MiniMetric } from '../components/common/MiniMetric';
import { UV_ZONES } from '../constants/uv';
import { ChartTooltip } from '../components/charts/ChartTooltip';
import { SunscreenTracker } from '../components/dashboard/SunscreenTracker';
import { ApplySunscreenModal } from '../components/dashboard/ApplySunscreenModal';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardStat } from '../types/dashboard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Battery, Wifi, Clock, Shield, PlusCircle, Moon } from 'lucide-react';
import { useTheme } from '../components/theme-provider';
import { motion } from 'framer-motion';
import { getUVZone } from '../constants/uv';
import { sunscreenService } from '../services/sunscreen.service';
import { useNavigate } from 'react-router';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { toast } from 'sonner';
import { useRef } from 'react';

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Dashboard page shown to the user.
export function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useDashboardData();
  const { theme, setTheme } = useTheme();
  
  // Real-time alert count invalidation
  useSocketEvent('alert:new', () => {
    refetch();
  });
  
  // Live clock — ticks every second
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Sunscreen popup alert logic
  const sunscreenAlerted = useRef(false);
  useEffect(() => {
    if (data?.activeProtection && data.protectionRemaining !== undefined) {
      if (data.protectionRemaining > 15) {
        // Reset the alert state if they just reapplied and have > 15 mins
        sunscreenAlerted.current = false;
      } else if (data.protectionRemaining <= 15 && data.protectionRemaining > 0 && !sunscreenAlerted.current) {
        // Trigger popup alert
        toast.warning('Sunscreen Expiring Soon', {
          description: `You have ${data.protectionRemaining} minutes of protection left. Please prepare to reapply!`,
          duration: 10000,
        });
        sunscreenAlerted.current = true;
      } else if (data.protectionRemaining <= 0 && !sunscreenAlerted.current) {
        toast.error('Sunscreen Expired', {
          description: 'Your sunscreen protection has expired! Reapply immediately.',
          duration: 15000,
        });
        sunscreenAlerted.current = true;
      }
    }
  }, [data?.activeProtection, data?.protectionRemaining]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplySunscreen = async (spf: number, time: Date) => {
    try {
      await sunscreenService.applySunscreen(spf, time);
      await refetch();
      setIsModalOpen(false);
    } catch (e) {
      console.error('Failed to apply sunscreen', e);
    }
  };

  const handleCancelSunscreen = async () => {
    try {
      await sunscreenService.cancelSunscreen();
      await refetch();
    } catch (e) {
      console.error('Failed to cancel sunscreen', e);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={refetch} />;

  // Empty state: User has not registered a device
  if (!data.deviceConnected) {
    return (
      <div className="p-5 md:p-6 max-w-7xl mx-auto h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="bg-blue-50 text-blue-500 rounded-full p-6 mb-4">
          <Wifi size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Device Connected</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          You haven't paired a SunSense device yet. Pair your device to start tracking live UV exposure.
        </p>
        <button 
          onClick={() => navigate('/device')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Pair Device
        </button>
      </div>
    );
  }

  // Format exposure time (seconds to Xh Ym)
  const exposureHours = Math.floor((data.todayExposure || 0) / 3600);
  const exposureMins = Math.floor(((data.todayExposure || 0) % 3600) / 60);
  const formattedExposure = exposureHours > 0 ? `${exposureHours}h ${exposureMins}m` : `${exposureMins}m`;

  // Construct dynamic stat cards from real API data
  const stats: DashboardStat[] = [
    { 
      id: 'battery', 
      icon: Battery, 
      label: 'Battery', 
      value: data.batteryStatus !== null && data.batteryStatus !== undefined ? `${data.batteryStatus}%` : 'Unknown', 
      sub: data.batteryStatus !== null && data.batteryStatus !== undefined ? (data.batteryStatus > 20 ? 'Good condition' : 'Needs charge soon') : 'No reading yet', 
      iconColor: '#2563EB', 
      iconBg: '#EFF6FF' 
    },
    { 
      id: 'status', 
      icon: Wifi, 
      label: 'Status', 
      value: data.deviceStatus === 'ONLINE' ? 'Connected' : 'Offline', 
      sub: data.lastSync ? `Last sync: ${new Date(data.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Never synced', 
      iconColor: data.deviceStatus === 'ONLINE' ? '#22C55E' : '#94A3B8', 
      iconBg: data.deviceStatus === 'ONLINE' ? '#F0FDF4' : '#F1F5F9' 
    },
    { 
      id: 'exposure', 
      icon: Clock, 
      label: 'UV Exposure', 
      value: formattedExposure, 
      sub: 'Total time today', 
      iconColor: '#F97316', 
      iconBg: '#FFF7ED' 
    },
    { 
      id: 'spf', 
      icon: Shield, 
      label: 'SPF Status', 
      value: data.deviceStatus === 'ONLINE' ? (data.currentSpfRecommendation ? `SPF ${data.currentSpfRecommendation}` : 'None') : 'N/A', 
      sub: data.deviceStatus === 'ONLINE' ? 'Recommended now' : 'Device offline', 
      iconColor: '#9333EA', 
      iconBg: '#FAF5FF' 
    }
  ];

  // Derive zone for current UV
  const currentUvValue = data.currentUv || 0;
  const zone = getUVZone(currentUvValue);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="p-5 md:p-6 max-w-7xl mx-auto"
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-800 dark:text-slate-100 font-semibold" style={{ fontSize: '1.2rem' }}>Dashboard</h1>
          <p className="text-slate-400 dark:text-slate-500 mt-0.5" style={{ fontSize: '0.8rem' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-slate-600 dark:text-slate-300" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
              Live · {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {stats.map((s, idx) => (
          <StatCard key={s.id} {...s} delay={idx * 0.1} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Gauge card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all duration-500"
          style={{
            border: theme === 'dark' ? '1px solid #1E293B' : '1px solid #E2E8F0',
            boxShadow: theme === 'dark' ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/history')}
          title="View history"
        >
          {/* Subtle background glow based on UV intensity */}
          <div
            className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 transition-colors duration-1000"
            style={{ background: zone.color }}
          />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <span className="text-slate-800 dark:text-slate-100 font-bold tracking-tight" style={{ fontSize: '0.95rem' }}>UV Intensity</span>
              <p className="text-slate-400 dark:text-slate-500 text-[0.65rem] uppercase tracking-widest font-medium mt-0.5">Real-time sensor</p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className="px-3 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider shadow-sm transition-all duration-500"
                style={{ background: zone.color, color: 'white' }}
              >
                {zone.label}
              </span>
              <span className="text-slate-400 text-[0.6rem] mt-1 font-medium">Updated just now</span>
            </div>
          </div>

          <div className="flex justify-center my-4 relative z-10">
            <UVGauge value={currentUvValue} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
            {[
              { label: 'Low', val: data.lowUv !== null && data.lowUv !== undefined ? data.lowUv.toFixed(1) : 'N/A', color: '#22C55E', sub: data.lowTime ? new Date(data.lowTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No data' },
              { label: 'Live', val: data.deviceStatus === 'ONLINE' ? currentUvValue.toFixed(1) : '--', color: data.deviceStatus === 'ONLINE' ? zone.color : '#94A3B8', sub: data.deviceStatus === 'ONLINE' ? 'Current' : 'Offline', active: true },
              { label: 'Peak', val: (data.peakUv || 0).toFixed(1), color: '#EF4444', sub: data.peakTime ? new Date(data.peakTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'No data' },
            ].map(({ label, val, color, sub, active }) => (
              <div
                key={label}
                className={`rounded-2xl p-3 text-center border transition-all duration-500 ${active ? 'bg-white shadow-md' : 'bg-slate-50/50'}`}
                style={{ borderColor: active ? (data.deviceStatus === 'ONLINE' ? zone.border : '#E2E8F0') : '#F1F5F9' }}
              >
                <div className="text-slate-400 font-bold tracking-tighter" style={{ fontSize: '0.55rem', textTransform: 'uppercase' }}>{label}</div>
                <div className="font-bold mt-1 tracking-tight" style={{ fontSize: '1.25rem', color: active ? color : '#1E293B' }}>{val}</div>
                <div className="text-slate-400 font-medium mt-0.5" style={{ fontSize: '0.55rem' }}>{sub}</div>
                {active && (
                  <div className="h-1 w-4 mx-auto mt-2 rounded-full" style={{ background: color }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-4">
          {/* UV recommendation banner */}
          <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: data.deviceStatus === 'ONLINE' ? zone.bg : (theme === 'dark' ? '#1E293B' : '#F8FAFC'), border: `1.5px solid ${data.deviceStatus === 'ONLINE' ? zone.border : (theme === 'dark' ? '#334155' : '#E2E8F0')}` }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20" style={{ background: data.deviceStatus === 'ONLINE' ? zone.color : '#CBD5E1' }} />
            <div className="flex items-center gap-3 relative z-10">
              <div className="rounded-xl p-3 flex-shrink-0" style={{ background: data.deviceStatus === 'ONLINE' ? zone.border : (theme === 'dark' ? '#0F172A' : '#E2E8F0') }}>
                <Sun size={20} style={{ color: data.deviceStatus === 'ONLINE' ? zone.text : '#64748B' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ fontSize: '0.85rem', color: data.deviceStatus === 'ONLINE' ? zone.text : (theme === 'dark' ? '#CBD5E1' : '#475569') }}>
                  {data.deviceStatus === 'ONLINE' ? (data.activeProtection ? "Protection Active" : "No Active Protection") : "Device Offline"}
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5" style={{ fontSize: '0.72rem' }}>
                  {data.deviceStatus === 'ONLINE' ? (data.activeProtection ? "Reapply sunscreen when timer runs out." : "Apply SPF before prolonged UV exposure.") : "Cannot provide live recommendations."}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold" style={{ fontSize: '2rem', color: data.deviceStatus === 'ONLINE' ? zone.text : (theme === 'dark' ? '#94A3B8' : '#94A3B8'), lineHeight: 1 }}>
                  {data.deviceStatus === 'ONLINE' ? currentUvValue.toFixed(1) : '--'}
                </div>
                <div className="text-slate-400 dark:text-slate-500" style={{ fontSize: '0.65rem' }}>UV now</div>
              </div>
            </div>
          </div>

          {/* 4-box mini metrics */}
          <div className="grid grid-cols-2 gap-3">
            <MiniMetric 
              label="Peak UV Today" 
              value={(data.peakUv || 0).toFixed(1)} 
              bar={((data.peakUv || 0) / 12) * 100} 
              barColor="#EF4444" 
              description="Highest recorded UV index today."
            />
            <MiniMetric 
              label="UV Dose Today" 
              value={(data.todayDose || 0).toFixed(1)} 
              bar={Math.min(((data.todayDose || 0) / 30) * 100, 100)} 
              barColor="#F97316" 
              description="Standard Erythemal Dose (SED). Cumulative UV exposure over the day."
            />
            <MiniMetric 
              label="Burn Time Today" 
              value={data.burnTimeRemaining !== null && data.burnTimeRemaining !== undefined ? `${data.burnTimeRemaining} min` : 'Safe'} 
              bar={data.burnTimeRemaining ? Math.min((data.burnTimeRemaining / 120) * 100, 100) : 0} 
              barColor="#9333EA" 
              description="Estimated time until sunburn based on current UV and your skin type."
            />
            <MiniMetric 
              label="Active Alerts" 
              value={(data.activeAlertsCount || 0).toString()} 
              bar={Math.min((data.activeAlertsCount || 0) * 20, 100)} 
              barColor="#EF4444" 
              onClick={() => navigate('/alerts')} 
              description="Current unread alerts requiring your attention."
            />
          </div>

          {/* Sunscreen Tracker */}
          <SunscreenTracker 
            onApplyClick={() => setIsModalOpen(true)}
            onCancelClick={handleCancelSunscreen}
            activeProtection={data.activeProtection}
            protectionRemaining={data.protectionRemaining}
          />
        </motion.div>
      </div>

      {/* Real-time line chart */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm transition-colors duration-500" style={{ border: theme === 'dark' ? '1px solid #1E293B' : '1px solid #E8F0FE' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-700 dark:text-slate-200 font-semibold" style={{ fontSize: '0.85rem' }}>Today's UV Timeline</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-0.5" style={{ fontSize: '0.72rem' }}>Hourly readings</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { color: '#F97316', label: 'High (6+)' },
              { color: '#EF4444', label: 'Very High (8+)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-px w-5" style={{ borderTop: `2px dashed ${color}` }} />
                <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: '0.65rem' }}>{label}</span>
              </div>
            ))}
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #FECACA' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse block" />
              <span className="text-red-600 dark:text-red-400 font-semibold" style={{ fontSize: '0.65rem' }}>LIVE</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={data.hourlyData || []} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="uvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#F1F5F9'} vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false}
              tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 10, fontFamily: 'Poppins' }} interval={3} />
            <YAxis domain={[0, 12]} tickLine={false} axisLine={false}
              tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 10, fontFamily: 'Poppins' }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine key="ref-uv-6" y={6} stroke="#F97316" strokeDasharray="5 4" strokeWidth={1.5} opacity={0.7} />
            <ReferenceLine key="ref-uv-8" y={8} stroke="#EF4444" strokeDasharray="5 4" strokeWidth={1.5} opacity={0.7} />
            <Area
              type="monotone" dataKey="uv" name="UV Index" stroke="#3B82F6" strokeWidth={3}
              fill="url(#uvFill)" dot={false}
              activeDot={{ r: 5, fill: '#3B82F6', stroke: theme === 'dark' ? '#0F172A' : '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Zone color legend */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {UV_ZONES.map((z, idx) => (
            <div key={`legend-${z.label}-${idx}`} className="flex-1 rounded py-1 text-center transition-colors duration-500" style={{ background: theme === 'dark' ? 'transparent' : z.bg }}>
              <div className="w-2 h-2 rounded-full mx-auto mb-0.5" style={{ background: z.color }} />
              <div style={{ fontSize: '0.6rem', color: theme === 'dark' ? z.color : z.text, fontWeight: 600 }}>{z.label}</div>
              <div style={{ fontSize: '0.55rem', color: theme === 'dark' ? '#64748B' : '#94A3B8' }}>≤{z.max === Infinity ? '12+' : z.max}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {isModalOpen && (
        <ApplySunscreenModal
          onClose={() => setIsModalOpen(false)}
          onApply={handleApplySunscreen}
        />
      )}
    </motion.div>
  );
}
