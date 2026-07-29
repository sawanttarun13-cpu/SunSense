import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from 'lucide-react';

export interface DashboardStat {
  id: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  value: string;
  sub: string;
  iconColor: string;
  iconBg: string;
  delta?: {
    dir: 'up' | 'down';
    val: string;
  };
}
