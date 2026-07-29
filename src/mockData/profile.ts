import type { SkinType, SensitivityLevel, Achievement } from '../types/profile';

// ─── Fitzpatrick scale ────────────────────────────────────────────────────────
export const SKIN_TYPES: SkinType[] = [
  { id: 1, label: 'Type I',   desc: 'Always burns, never tans',            tone: '#FDDCB5', burn: 10 },
  { id: 2, label: 'Type II',  desc: 'Burns easily, tans poorly',           tone: '#F5C898', burn: 15 },
  { id: 3, label: 'Type III', desc: 'Burns moderately, tans slowly',       tone: '#E8A87C', burn: 25 },
  { id: 4, label: 'Type IV',  desc: 'Burns minimally, tans well',          tone: '#C8845A', burn: 35 },
  { id: 5, label: 'Type V',   desc: 'Rarely burns, tans darkly',           tone: '#A06040', burn: 50 },
  { id: 6, label: 'Type VI',  desc: 'Never burns, deeply pigmented',       tone: '#6B3A20', burn: 60 },
];

// ─── Sensitivity levels ───────────────────────────────────────────────────────
export const SENSITIVITY_LEVELS: SensitivityLevel[] = [
  { label: 'Very Low',  rec: 10, color: '#22C55E' },
  { label: 'Low',       rec: 8,  color: '#84CC16' },
  { label: 'Moderate',  rec: 7,  color: '#EAB308' },
  { label: 'High',      rec: 6,  color: '#F97316' },
  { label: 'Very High', rec: 5,  color: '#EF4444' },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  { icon: '🔥', label: '7-Day Streak',    desc: 'SPF applied daily',       earned: true  },
  { icon: '🛡️', label: 'Safe Skin',       desc: '30 days under threshold', earned: true  },
  { icon: '🌅', label: 'Early Bird',       desc: 'Tracked before 7 AM',    earned: true  },
  { icon: '⚡', label: 'UV Warrior',       desc: '90-day tracking streak',  earned: false },
  { icon: '🌞', label: 'Sun Chaser',       desc: '100 outdoor readings',    earned: true  },
  { icon: '💪', label: 'Protector',        desc: 'Zero burns this month',   earned: false },
  { icon: '📊', label: 'Analyst',          desc: 'Reviewed 30 reports',     earned: true  },
  { icon: '🌍', label: 'Explorer',         desc: 'Tracked in 5 locations',  earned: false },
];

export const MOCK_USER_PROFILE = {
  name: 'Alex Johnson',
  initials: 'AJ',
  location: 'San Francisco, CA',
  age: '34',
  skinType: 2,
  sensitivity: 2
};
