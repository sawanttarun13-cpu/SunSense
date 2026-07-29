import { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Sun, Edit3, Check, Award, Clock, TrendingUp, Shield, Flame } from 'lucide-react';
import { UV_ZONES } from '../constants/uv';
import { profileService } from '../services/profile.service';
import type { SkinType, SensitivityLevel, Achievement } from '../types/profile';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm text-center" style={{ border: '1px solid #E8F0FE' }}>
      <div className="flex justify-center mb-2">
        <div className="rounded-xl p-2.5" style={{ background: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="font-bold text-slate-800" style={{ fontSize: '1.3rem' }}>{value}</div>
      <div className="text-slate-400 mt-0.5" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

export function Profile() {
  const [skinTypes, setSkinTypes] = useState<SkinType[]>([]);
  const [sensitivityLevels, setSensitivityLevels] = useState<SensitivityLevel[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  const [skinType, setSkinType] = useState(2);
  const [sensitivity, setSensitivity] = useState(2);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      profileService.getProfile(),
      profileService.getSkinTypes(),
      profileService.getSensitivityLevels(),
      profileService.getAchievements()
    ])
      .then(([prof, skins, sens, achs]) => {
        setName(prof.name);
        setInitials(prof.initials);
        setLocation(prof.location);
        setAge(prof.age);
        setSkinType(prof.skinType);
        setSensitivity(prof.sensitivity);
        setSkinTypes(skins);
        setSensitivityLevels(sens);
        setAchievements(achs);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const selectedSkin = skinTypes.find(s => s.id === skinType)!;
  const selectedSens = sensitivityLevels[sensitivity];

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-5 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-slate-800 font-semibold" style={{ fontSize: '1.2rem' }}>Profile</h1>
        <p className="text-slate-400 mt-0.5" style={{ fontSize: '0.8rem' }}>Your UV health profile and personal settings</p>
      </div>

      {/* Profile hero */}
      <div
        className="rounded-2xl p-6 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #6D28D9 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: '#93C5FD' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', fontSize: '1.8rem', letterSpacing: '-1px' }}
          >
            {initials}
          </div>

          <div className="flex-1">
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="font-bold bg-white/15 text-white rounded-xl px-3 py-1.5 outline-none border border-white/25 mb-2 max-w-xs w-full"
                style={{ fontSize: '1.1rem' }}
              />
            ) : (
              <div className="font-bold mb-1" style={{ fontSize: '1.15rem' }}>{name}</div>
            )}
            <div className="flex flex-wrap gap-4" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                {editing ? (
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    className="bg-white/15 text-white rounded-lg px-2 py-0.5 outline-none border border-white/25 text-sm w-40" />
                ) : <span>{location}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} />
                {editing ? (
                  <input value={age} onChange={e => setAge(e.target.value)}
                    className="bg-white/15 text-white rounded-lg px-2 py-0.5 outline-none border border-white/25 text-sm w-16" />
                ) : <span>Age {age}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={13} />
                <span>Skin Type {skinType} · {selectedSens.label} Sensitivity</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {saved && <span className="flex items-center gap-1.5 text-green-300 rounded-xl px-3 py-2" style={{ background: 'rgba(34,197,94,0.2)', fontSize: '0.8rem' }}><Check size={13} /> Saved</span>}
            {editing ? (
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl px-4 py-2 font-semibold" style={{ background: '#fff', color: '#1E40AF', fontSize: '0.8rem' }}>
                <Check size={14} /> Save
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Calendar} label="Days Tracked" value="84" color="#2563EB" bg="#EFF6FF" />
        <StatCard icon={Sun} label="Avg Daily UV" value="5.8" color="#F97316" bg="#FFF7ED" />
        <StatCard icon={TrendingUp} label="High UV Days" value="38" color="#EF4444" bg="#FEF2F2" />
        <StatCard icon={Clock} label="Total Exposure" value="218h" color="#9333EA" bg="#FAF5FF" />
      </div>

      {/* Skin type */}
      <div className="mb-5">
        {/* Skin type selector */}
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E8F0FE' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl p-2.5" style={{ background: '#FFF7ED' }}>
              <User size={15} style={{ color: '#EA580C' }} />
            </div>
            <span className="font-semibold text-slate-700" style={{ fontSize: '0.85rem' }}>Fitzpatrick Skin Type</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {skinTypes.map(s => (
              <button
                key={s.id}
                onClick={() => setSkinType(s.id)}
                className="rounded-xl p-3 text-center transition-all"
                style={{
                  border: `2px solid ${skinType === s.id ? '#2563EB' : '#E2E8F0'}`,
                  background: skinType === s.id ? '#EFF6FF' : '#fff',
                  boxShadow: skinType === s.id ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                }}
              >
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5" style={{ background: s.tone }} />
                <div className="font-semibold text-slate-700" style={{ fontSize: '0.72rem' }}>{s.label}</div>
              </button>
            ))}
          </div>

          <div
            className="rounded-xl p-3.5"
            style={{ background: `${selectedSkin.tone}22`, border: `1.5px solid ${selectedSkin.tone}66` }}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-slate-700" style={{ fontSize: '0.85rem' }}>{selectedSkin.label}</span>
              <span className="font-medium" style={{ fontSize: '0.72rem', color: '#EA580C' }}>Burn: ~{selectedSkin.burn}min unprotected</span>
            </div>
            <div className="text-slate-500" style={{ fontSize: '0.75rem' }}>{selectedSkin.desc}</div>
          </div>
        </div>

      </div>

    </div>
  );
}
