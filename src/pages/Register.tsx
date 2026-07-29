import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Loader, Check } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { profileService } from '../services/profile.service';
import type { SkinType } from '../types/profile';

function inputBorder(focused: string | null, field: string) {
  return { border: `1.5px solid ${focused === field ? '#2563EB' : '#E2E8F0'}`, outline: 'none', transition: 'border-color 0.15s' };
}

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [skinType, setSkinType] = useState<number | null>(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [skinTypes, setSkinTypes] = useState<SkinType[]>([]);

  useEffect(() => {
    profileService.getSkinTypes().then(setSkinTypes);
  }, []);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ['#E2E8F0', '#EF4444', '#F97316', '#22C55E'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

  const step1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setStep(2);
  };

  const step2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skinType) { setError('Please select your skin type.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1400);
  };

  return (
    <AuthLayout
      brandProps={{
        badge: "Setup takes under 2 minutes",
        headline: <>Your skin.<br />Your data.<br />Your protection.</>,
        sub: "Create your SunSense profile and start receiving personalised UV alerts based on your skin type and daily exposure patterns."
      }}
    >
      <div className="flex gap-1.5 mb-7">
        {[1, 2].map(s => (
          <div key={s} className="h-1 rounded-full flex-1 transition-all" style={{ background: step >= s ? '#2563EB' : '#E2E8F0' }} />
        ))}
      </div>

      {step === 1 ? (
        <>
          <h2 className="font-bold text-slate-800 mb-1" style={{ fontSize: '1.4rem' }}>Create your account</h2>
          <p className="text-slate-400 mb-7" style={{ fontSize: '0.82rem' }}>Step 1 of 2 — account details</p>
          <form onSubmit={step1} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-600 mb-1.5" style={{ fontSize: '0.78rem' }}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                placeholder="Alex Johnson" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800"
                style={{ ...inputBorder(focused, 'name'), fontSize: '0.85rem' }} />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1.5" style={{ fontSize: '0.78rem' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="alex@example.com" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800"
                style={{ ...inputBorder(focused, 'email'), fontSize: '0.85rem' }} />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1.5" style={{ fontSize: '0.78rem' }}>Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Min. 8 characters" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800 pr-11"
                  style={{ ...inputBorder(focused, 'password'), fontSize: '0.85rem' }} />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: strength >= i ? strengthColor : '#E2E8F0' }} />)}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            {error && <div className="rounded-xl px-4 py-2.5 text-red-600" style={{ background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.78rem' }}>{error}</div>}
            <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white mt-2"
              style={{ background: '#2563EB', fontSize: '0.85rem' }}>
              Continue <ArrowRight size={15} />
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="font-bold text-slate-800 mb-1" style={{ fontSize: '1.4rem' }}>Your skin profile</h2>
          <p className="text-slate-400 mb-7" style={{ fontSize: '0.82rem' }}>Step 2 of 2 — personalise your alerts</p>
          <form onSubmit={step2} className="space-y-5">
            <div>
              <label className="block font-medium text-slate-600 mb-2" style={{ fontSize: '0.78rem' }}>Fitzpatrick skin type</label>
              <div className="grid grid-cols-3 gap-2">
                {skinTypes.map(s => (
                  <button key={s.id} type="button" onClick={() => setSkinType(s.id)}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all"
                    style={{ border: `1.5px solid ${skinType === s.id ? '#2563EB' : '#E2E8F0'}`, background: skinType === s.id ? '#EFF6FF' : '#fff' }}>
                    <div className="w-7 h-7 rounded-full" style={{ background: s.tone }} />
                    <span className="font-semibold text-slate-700" style={{ fontSize: '0.72rem' }}>{s.label}</span>
                    <span className="text-slate-400 text-center leading-tight" style={{ fontSize: '0.6rem' }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1.5" style={{ fontSize: '0.78rem' }}>
                Location <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                onFocus={() => setFocused('location')} onBlur={() => setFocused(null)}
                placeholder="San Francisco, CA" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800"
                style={{ ...inputBorder(focused, 'location'), fontSize: '0.85rem' }} />
            </div>
            {error && <div className="rounded-xl px-4 py-2.5 text-red-600" style={{ background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.78rem' }}>{error}</div>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setStep(1); setError(''); }}
                className="flex-1 rounded-xl py-3 font-medium text-slate-600 hover:bg-slate-50"
                style={{ border: '1.5px solid #E2E8F0', fontSize: '0.85rem', background: '#fff' }}>
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
                style={{ background: '#2563EB', fontSize: '0.85rem', opacity: loading ? 0.75 : 1 }}>
                {loading ? <><Loader size={15} className="animate-spin" /> Creating…</> : <><Check size={15} /> Create account</>}
              </button>
            </div>
          </form>
        </>
      )}

      <p className="text-center text-slate-400 mt-8" style={{ fontSize: '0.75rem' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="text-blue-500 font-medium hover:underline">Sign in</button>
      </p>
    </AuthLayout>
  );
}
