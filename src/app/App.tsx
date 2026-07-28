import { useState } from 'react';
import { Sun, Eye, EyeOff, ArrowRight, Loader, Check } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { Alerts } from './components/Alerts';
import { Device } from './components/Device';
import { SettingsPage } from './components/SettingsPage';
import { Profile } from './components/Profile';

export type Page = 'dashboard' | 'analytics' | 'history' | 'alerts' | 'device' | 'settings' | 'profile';
type AuthScreen = 'login' | 'register';

// ─── Shared styles ────────────────────────────────────────────────────────────
const FONT: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

function inputBorder(focused: string | null, field: string) {
  return { border: `1.5px solid ${focused === field ? '#2563EB' : '#E2E8F0'}`, outline: 'none', transition: 'border-color 0.15s' };
}

// ─── Left branding panel (shared) ────────────────────────────────────────────
function BrandPanel({ headline, sub, badge }: { headline: React.ReactNode; sub: string; badge: string }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-2/5 p-12"
      style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Sun size={18} className="text-white" />
        </div>
        <span className="text-white font-semibold" style={{ fontSize: '1rem' }}>SunSense</span>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6" style={{ background: 'rgba(255,255,255,0.12)', fontSize: '0.72rem', color: '#BFDBFE' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          {badge}
        </div>
        <h1 className="text-white font-bold leading-tight mb-3" style={{ fontSize: '2rem' }}>{headline}</h1>
        <p style={{ fontSize: '0.82rem', color: '#93C5FD', lineHeight: 1.7 }}>{sub}</p>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#60A5FA' }}>© 2025 SunSense · Pro Keychain UVK-2001</div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
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
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div className="min-h-screen flex" style={FONT}>
      <BrandPanel
        badge="Real-Time UV Monitoring"
        headline={<>Monitor your UV<br />exposure, anywhere.</>}
        sub={"SunSense delivers live UV index readings, personalised protection alerts, and long-term exposure analytics — all from a keychain-sized device."}
      />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2563EB' }}><Sun size={15} className="text-white" /></div>
            <span className="font-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>SunSense</span>
          </div>
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
            <button onClick={onRegister} className="text-blue-500 font-medium hover:underline">Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Skin types ───────────────────────────────────────────────────────────────
const SKIN_TYPES = [
  { id: 1, label: 'Type I', desc: 'Always burns', tone: '#FDDCB5' },
  { id: 2, label: 'Type II', desc: 'Burns easily', tone: '#F5C898' },
  { id: 3, label: 'Type III', desc: 'Burns moderately', tone: '#E8A87C' },
  { id: 4, label: 'Type IV', desc: 'Burns minimally', tone: '#C8845A' },
  { id: 5, label: 'Type V', desc: 'Rarely burns', tone: '#A06040' },
  { id: 6, label: 'Type VI', desc: 'Never burns', tone: '#6B3A20' },
];

// ─── Register screen ──────────────────────────────────────────────────────────
function RegisterScreen({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
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
    setTimeout(() => { setLoading(false); onRegister(); }, 1400);
  };

  return (
    <div className="min-h-screen flex" style={FONT}>
      <BrandPanel
        badge="Setup takes under 2 minutes"
        headline={<>Your skin.<br />Your data.<br />Your protection.</>}
        sub="Create your SunSense profile and start receiving personalised UV alerts based on your skin type and daily exposure patterns."
      />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2563EB' }}><Sun size={15} className="text-white" /></div>
            <span className="font-semibold text-slate-800" style={{ fontSize: '0.9rem' }}>SunSense</span>
          </div>
          {/* Step bar */}
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
                    {SKIN_TYPES.map(s => (
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
            <button onClick={onLogin} className="text-blue-500 font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!loggedIn) {
    if (authScreen === 'register') {
      return <RegisterScreen onRegister={() => setLoggedIn(true)} onLogin={() => setAuthScreen('login')} />;
    }
    return <LoginScreen onLogin={() => setLoggedIn(true)} onRegister={() => setAuthScreen('register')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={(page) => setActivePage(page as Page)} />;
      case 'analytics': return <Analytics />;
      case 'history': return <History />;
      case 'alerts': return <Alerts />;
      case 'device': return <Device />;
      case 'settings': return <SettingsPage />;
      case 'profile': return <Profile />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ ...FONT, background: '#EEF4FF' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={() => { setLoggedIn(false); setAuthScreen('login'); }} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{renderPage()}</main>
    </div>
  );
}
