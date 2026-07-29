import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from 'lucide-react';
import { Battery, Wifi, Clock, Shield } from 'lucide-react';

import type { DashboardStat } from '../types/dashboard';

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: 'battery', icon: Battery, label: 'Battery', value: '82%', sub: '~14h left', iconColor: '#2563EB', iconBg: '#EFF6FF' },
  { id: 'status', icon: Wifi, label: 'Status', value: 'Connected', sub: 'Strong signal', iconColor: '#22C55E', iconBg: '#F0FDF4' },
  { id: 'exposure', icon: Clock, label: 'UV Exposure', value: '2h 15m', sub: 'Today · since 6 AM', delta: { dir: 'up', val: '+18m' }, iconColor: '#F97316', iconBg: '#FFF7ED' },
  { id: 'spf', icon: Shield, label: 'SPF Status', value: 'SPF 50', sub: 'Recommended now', iconColor: '#9333EA', iconBg: '#FAF5FF' }
];

export const DASHBOARD_METRICS = {
  peakUV: '9.3',
  peakTime: '1:42 PM'
};
