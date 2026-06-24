import React, { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useIonToast } from '@ionic/react'
import { useAuth, fetchCsrfCookie } from '../../contexts/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'
import './auth.css'

// ── SVG illustrations for the right-panel feature carousel ────────────────

function NetworkSVG() {
  return (
    <svg viewBox="0 0 200 158" fill="none" className="w-full h-full">
      {/* Dashed connecting lines */}
      <line x1="46" y1="26" x2="88" y2="66" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />
      <line x1="154" y1="26" x2="112" y2="66" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />
      <line x1="100" y1="102" x2="100" y2="128" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />

      {/* Hub glow + hub circle */}
      <circle cx="100" cy="84" r="26" fill="#df3226" opacity="0.07" />
      <circle cx="100" cy="84" r="17" fill="#df3226" />
      <text x="100" y="89" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700">HQ</text>

      {/* Outlet A — top left */}
      <rect x="4" y="4" width="58" height="38" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="4" fill="#10b981" />
      <text x="36" y="17" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet A</text>
      <rect x="11" y="26" width="36" height="3.5" rx="2" fill="#f0fdf4" />
      <rect x="11" y="26" width="28" height="3.5" rx="2" fill="#10b981" />

      {/* Outlet B — top right */}
      <rect x="138" y="4" width="58" height="38" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="150" cy="16" r="4" fill="#f59e0b" />
      <text x="170" y="17" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet B</text>
      <rect x="145" y="26" width="36" height="3.5" rx="2" fill="#fffbeb" />
      <rect x="145" y="26" width="16" height="3.5" rx="2" fill="#f59e0b" />

      {/* Outlet C — bottom */}
      <rect x="71" y="128" width="58" height="28" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="83" cy="142" r="4" fill="#60a5fa" />
      <text x="103" y="143" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet C</text>
    </svg>
  )
}

function InventorySVG() {
  return (
    <svg viewBox="0 0 200 158" fill="none" className="w-full h-full">
      {/* Header bar */}
      <rect x="8" y="6" width="184" height="26" rx="6" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1" />
      <text x="18" y="23" fill="#1a1d23" fontSize="8" fontWeight="700" fontFamily="JetBrains Mono, monospace">INVENTORY STATUS</text>
      <circle cx="184" cy="19" r="7" fill="#10b981" opacity="0.15" />
      <circle cx="184" cy="19" r="4" fill="#10b981" />

      {/* Row 1 */}
      <rect x="8" y="42" width="184" height="30" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="16" y="61" fill="#374151" fontSize="8" fontWeight="500">Rajavadi Kaju 500g</text>
      <rect x="116" y="54" width="64" height="5.5" rx="3" fill="#f0fdf4" />
      <rect x="116" y="54" width="52" height="5.5" rx="3" fill="#10b981" />
      <text x="186" y="61" fill="#10b981" fontSize="7" fontWeight="600" textAnchor="end">248 pcs</text>

      {/* Row 2 */}
      <rect x="8" y="82" width="184" height="30" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="16" y="101" fill="#374151" fontSize="8" fontWeight="500">AVDH Biscuit Variety</text>
      <rect x="116" y="94" width="64" height="5.5" rx="3" fill="#fffbeb" />
      <rect x="116" y="94" width="20" height="5.5" rx="3" fill="#f59e0b" />
      <text x="186" y="101" fill="#f59e0b" fontSize="7" fontWeight="600" textAnchor="end">12 pcs</text>

      {/* Row 3 */}
      <rect x="8" y="122" width="184" height="30" rx="6" fill="white" stroke="#fee2e2" strokeWidth="1" />
      <text x="16" y="141" fill="#374151" fontSize="8" fontWeight="500">Masala Papad Bulk</text>
      <rect x="116" y="134" width="64" height="5.5" rx="3" fill="#fef2f2" />
      <text x="186" y="141" fill="#ef4444" fontSize="7" fontWeight="600" textAnchor="end">Out of Stock</text>
    </svg>
  )
}

function RouteSVG() {
  const stops: [number, number][] = [[24, 128], [60, 94], [92, 110], [130, 68], [162, 84], [178, 46]]
  return (
    <svg viewBox="0 0 200 158" fill="none" className="w-full h-full">
      {/* Header */}
      <rect x="8" y="6" width="184" height="30" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="18" y="19" fill="#6b7280" fontSize="7" fontWeight="500">Route RT-024  ·  Salesman Ramesh B.</text>
      <text x="18" y="30" fill="#1a1d23" fontSize="8.5" fontWeight="700">4 of 6 stops completed</text>

      {/* Dashed path */}
      <polyline
        points={stops.map(([x, y]) => `${x},${y}`).join(' ')}
        stroke="#df3226"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 4"
        fill="none"
      />

      {/* Stop circles */}
      {stops.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="8.5" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="4.5" fill={i < 4 ? '#10b981' : i === 4 ? '#f59e0b' : '#d1d5db'} />
        </g>
      ))}
      <text x={stops[5][0]} y={stops[5][1] - 13} textAnchor="middle" fill="#9ca3af" fontSize="7">Pending</text>
      <text x={stops[4][0] + 14} y={stops[4][1] + 3} fill="#f59e0b" fontSize="7" fontWeight="600">Now</text>
    </svg>
  )
}

// ── Feature slides ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    Illustration: NetworkSVG,
    title: 'Unified Chain View',
    desc: 'Connect all outlets, warehouses, and routes in one operational dashboard.',
  },
  {
    Illustration: InventorySVG,
    title: 'Live Inventory Intelligence',
    desc: 'Real-time stock visibility across every outlet with instant low-stock alerts.',
  },
  {
    Illustration: RouteSVG,
    title: 'Smart Route Management',
    desc: 'Track salesman routes, stop completions, and delivery progress in real time.',
  },
]

// ── Feature carousel (right panel) ────────────────────────────────────────
function FeatureCarousel() {
  const [slide, setSlide]       = useState(0)
  const [fading, setFading]     = useState(false)
  const [current, setCurrent]   = useState(0)

  useEffect(() => {
    const t = setInterval(() => advance((current + 1) % FEATURES.length), 4000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const advance = (next: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(next)
      setSlide(next)
      setFading(false)
    }, 220)
  }

  const f = FEATURES[current]

  return (
    <div className="hidden lg:flex flex-col items-center justify-center auth-panel-right relative flex-1 min-h-[480px] p-10 gap-7">
      {/* Illustration */}
      <div
        className="w-52 h-40"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}
      >
        <f.Illustration />
      </div>

      {/* Text */}
      <div
        className="text-center max-w-[216px]"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.22s ease' }}
      >
        <h3 className="text-[0.95rem] font-bold text-slate-800 mb-2 leading-snug">{f.title}</h3>
        <p className="text-[0.8rem] text-slate-500 leading-relaxed">{f.desc}</p>
      </div>

      {/* Dot navigation */}
      <div className="flex items-center gap-2">
        {FEATURES.map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i)}
            aria-label={`Feature ${i + 1}`}
            className={`c-dot h-2 rounded-full ${i === slide ? 'bg-brand-500 w-5 dot-on' : 'bg-slate-300 w-2'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Login page ─────────────────────────────────────────────────────────────
export default function Login() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [present] = useIonToast()

  // All hooks must be declared before any conditional return
  const [step, setStep]         = useState<'email' | 'password'>('email')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
    ?? (user?.hasOrganisation ? '/dashboard' : '/onboarding')

  // Active session → skip login, go to intended page (after all hooks)
  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const showError = (message: string) =>
    present({ message, duration: 3000, position: 'top', color: 'danger' })

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleNext = () => {
    if (!email.trim() || !isValidEmail(email)) {
      showError('Please enter a valid email address')
      return
    }
    fetchCsrfCookie()
    setStep('password')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { showError('Please enter your password'); return }
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-font min-h-screen flex items-center justify-center p-4">
      {/* Floating card */}
      <div className="auth-card bg-white rounded-xl overflow-hidden flex max-w-[800px] w-full relative z-10">

        {/* ── LEFT: Form area ── */}
        <div className="flex flex-col p-8 sm:p-10 w-full lg:w-[380px] lg:flex-none">

          {/* Logo */}
          <div className="flex items-center justify-between mb-10 a-su">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                <ShoppingCart size={16} color="white" strokeWidth={2.2} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-[0.95rem] tracking-tight">OrderFlow</span>
            </div>
            <ThemeToggle />
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <div key="email" className="a-su">
              <div className="mb-7">
                <h1 className="text-[1.8rem] font-bold text-slate-900 dark:text-white leading-tight">Sign in</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">to access OrderFlow</p>
              </div>

              <div className="mb-4">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder="Email address or mobile number"
                  autoFocus
                  autoComplete="email"
                  className="auth-input w-full px-4 py-3 rounded-md border text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
              </div>

              <button
                type="button"
                id="login-next-btn"
                onClick={handleNext}
                className="auth-btn w-full py-3 rounded-md text-sm font-semibold text-white bg-brand-500 flex items-center justify-center gap-2 mb-6"
              >
                Next <ArrowRight size={15} />
              </button>

              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-500 font-semibold hover:underline">
                  Sign up now
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: Password ── */}
          {step === 'password' && (
            <form key="password" onSubmit={handleLogin} className="a-sir">
              <div className="mb-7">
                <h1 className="text-[1.8rem] font-bold text-slate-900 dark:text-white leading-tight mb-4">
                  Enter password
                </h1>
                {/* Email chip — click to go back to step 1 */}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="email-chip inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="font-medium">{email}</span>
                  <span className="text-slate-300 dark:text-slate-500 text-xs leading-none">✕</span>
                </button>
              </div>

              <div className="mb-4 relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  autoComplete="current-password"
                  className="auth-input w-full px-4 py-3 pr-11 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="auth-btn w-full py-3 rounded-md text-sm font-semibold text-white bg-brand-500 flex items-center justify-center gap-2 mb-4"
              >
                {loading ? (
                  <>
                    <span className="a-spin w-4 h-4 rounded-full border-2 border-white/30 border-t-white inline-block" />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <Link to="/forgot-password" className="text-brand-500 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-auto pt-8">
            <p className="text-xs text-slate-400 text-center">© 2026 OrderFlow Systems</p>
          </div>
        </div>

        {/* ── RIGHT: Feature carousel ── */}
        <FeatureCarousel />
      </div>
    </div>
  )
}
