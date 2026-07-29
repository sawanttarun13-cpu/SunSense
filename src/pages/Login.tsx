import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';

function inputBorder(focused: string | null, field: string) {
  return { border: `1.5px solid ${focused === field ? '#2563EB' : '#E2E8F0'}`, outline: 'none', transition: 'border-color 0.15s' };
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1200);
  };

  return (
    <AuthLayout
      brandProps={{
        badge: "Real-Time UV Monitoring",
        headline: <>Monitor your UV<br />exposure, anywhere.</>,
        sub: "SunSense delivers live UV index readings, personalised protection alerts, and long-term exposure analytics — all from a keychain-sized device."
      }}
    >
      <h2 className="font-bold text-slate-800 mb-1" style={{ fontSize: '1.5rem' }}>Welcome back</h2>
      <p className="text-slate-400 mb-8" style={{ fontSize: '0.82rem' }}>Sign in to your SunSense account</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block font-medium text-slate-600 mb-1.5" style={{ fontSize: '0.78rem' }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
            placeholder="alex@example.com" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800"
            style={{ ...inputBorder(focused, 'email'), fontSize: '0.85rem' }} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-medium text-slate-600" style={{ fontSize: '0.78rem' }}>Password</label>
            <button type="button" className="text-blue-500 hover:text-blue-700" style={{ fontSize: '0.72rem' }}>Forgot password?</button>
          </div>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
              placeholder="••••••••" className="w-full rounded-xl px-4 py-3 bg-white text-slate-800 pr-11"
              style={{ ...inputBorder(focused, 'password'), fontSize: '0.85rem' }} />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <div className="rounded-xl px-4 py-2.5 text-red-600" style={{ background: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.78rem' }}>{error}</div>}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white mt-2"
          style={{ background: '#2563EB', fontSize: '0.85rem', opacity: loading ? 0.75 : 1 }}>
          {loading ? <><Loader size={15} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
        </button>
      </form>
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-400" style={{ fontSize: '0.72rem' }}>or continue with</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Apple'].map(label => (
          <button key={label} type="button" className="flex items-center justify-center gap-2 rounded-xl py-2.5 bg-white font-medium text-slate-700 hover:bg-slate-50"
            style={{ border: '1.5px solid #E2E8F0', fontSize: '0.8rem' }}>
            {label === 'Apple'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              : <span className="font-bold text-blue-500" style={{ fontSize: '0.9rem' }}>G</span>}
            {label}
          </button>
        ))}
      </div>
      <p className="text-center text-slate-400 mt-8" style={{ fontSize: '0.75rem' }}>
        {"Don't have an account? "}
        <button onClick={() => navigate('/register')} className="text-blue-500 font-medium hover:underline">Create one</button>
      </p>
    </AuthLayout>
  );
}
