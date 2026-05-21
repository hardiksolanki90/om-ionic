import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check, ArrowRight, ArrowLeft, ShoppingCart, Building2, Package, Truck, ShieldCheck } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import './auth.css'

// ── SVG illustrations (Same as Login for consistency) ──────────────────────

function NetworkSVG() {
  return (
    <svg viewBox="0 0 200 158" fill="none" className="w-full h-full">
      <line x1="46" y1="26" x2="88" y2="66" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />
      <line x1="154" y1="26" x2="112" y2="66" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />
      <line x1="100" y1="102" x2="100" y2="128" stroke="#df3226" strokeWidth="1.5" strokeDasharray="5 3.5" opacity="0.5" />
      <circle cx="100" cy="84" r="26" fill="#df3226" opacity="0.07" />
      <circle cx="100" cy="84" r="17" fill="#df3226" />
      <text x="100" y="89" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700">HQ</text>
      <rect x="4" y="4" width="58" height="38" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="4" fill="#10b981" />
      <text x="36" y="17" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet A</text>
      <rect x="11" y="26" width="36" height="3.5" rx="2" fill="#f0fdf4" />
      <rect x="11" y="26" width="28" height="3.5" rx="2" fill="#10b981" />
      <rect x="138" y="4" width="58" height="38" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="150" cy="16" r="4" fill="#f59e0b" />
      <text x="170" y="17" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet B</text>
      <rect x="145" y="26" width="36" height="3.5" rx="2" fill="#fffbeb" />
      <rect x="145" y="26" width="16" height="3.5" rx="2" fill="#f59e0b" />
      <rect x="71" y="128" width="58" height="28" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="83" cy="142" r="4" fill="#60a5fa" />
      <text x="103" y="143" textAnchor="middle" fill="#374151" fontSize="8" fontWeight="600">Outlet C</text>
    </svg>
  )
}

function InventorySVG() {
  return (
    <svg viewBox="0 0 200 158" fill="none" className="w-full h-full">
      <rect x="8" y="6" width="184" height="26" rx="6" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1" />
      <text x="18" y="23" fill="#1a1d23" fontSize="8" fontWeight="700" fontFamily="JetBrains Mono, monospace">INVENTORY STATUS</text>
      <circle cx="184" cy="19" r="7" fill="#10b981" opacity="0.15" />
      <circle cx="184" cy="19" r="4" fill="#10b981" />
      <rect x="8" y="42" width="184" height="30" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="16" y="61" fill="#374151" fontSize="8" fontWeight="500">Rajavadi Kaju 500g</text>
      <rect x="116" y="54" width="64" height="5.5" rx="3" fill="#f0fdf4" />
      <rect x="116" y="54" width="52" height="5.5" rx="3" fill="#10b981" />
      <text x="186" y="61" fill="#10b981" fontSize="7" fontWeight="600" textAnchor="end">248 pcs</text>
      <rect x="8" y="82" width="184" height="30" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="16" y="101" fill="#374151" fontSize="8" fontWeight="500">AVDH Biscuit Variety</text>
      <rect x="116" y="94" width="64" height="5.5" rx="3" fill="#fffbeb" />
      <rect x="116" y="94" width="20" height="5.5" rx="3" fill="#f59e0b" />
      <text x="186" y="101" fill="#f59e0b" fontSize="7" fontWeight="600" textAnchor="end">12 pcs</text>
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
      <rect x="8" y="6" width="184" height="30" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <text x="18" y="19" fill="#6b7280" fontSize="7" fontWeight="500">Route RT-024 · Ramesh B.</text>
      <text x="18" y="30" fill="#1a1d23" fontSize="8.5" fontWeight="700">4 of 6 stops completed</text>
      <polyline points={stops.map(([x, y]) => `${x},${y}`).join(' ')} stroke="#df3226" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" fill="none" />
      {stops.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="8.5" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="4.5" fill={i < 4 ? '#10b981' : i === 4 ? '#f59e0b' : '#d1d5db'} />
        </g>
      ))}
    </svg>
  )
}

const FEATURES = [
  { Illustration: NetworkSVG, title: 'Unified Chain View', desc: 'Connect all outlets, warehouses, and routes in one dashboard.' },
  { Illustration: InventorySVG, title: 'Live Inventory Intelligence', desc: 'Real-time stock visibility across every outlet with instant alerts.' },
  { Illustration: RouteSVG, title: 'Smart Route Management', desc: 'Track routes, stop completions, and delivery progress in real time.' },
]

function FeatureCarousel() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % FEATURES.length)
        setFading(false)
      }, 220)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const f = FEATURES[current]
  return (
    <div className="hidden lg:flex flex-col items-center justify-center auth-panel-right relative flex-1 min-h-[500px] p-10 gap-7">
      <div className="w-52 h-40 transition-opacity duration-200" style={{ opacity: fading ? 0 : 1 }}>
        <f.Illustration />
      </div>
      <div className="text-center max-w-[216px] transition-opacity duration-200" style={{ opacity: fading ? 0 : 1 }}>
        <h3 className="text-[0.95rem] font-bold text-slate-800 mb-2">{f.title}</h3>
        <p className="text-[0.8rem] text-slate-500 leading-relaxed">{f.desc}</p>
      </div>
      <div className="flex items-center gap-2">
        {FEATURES.map((_, i) => (
          <div key={i} className={`c-dot h-2 rounded-full ${i === current ? 'bg-brand-500 w-5 dot-on' : 'bg-slate-300 w-2'}`} />
        ))}
      </div>
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────
type Fields = {
  firstName: string; lastName: string
  orgName: string; email: string
  mobile: string; password: string; confirmPassword: string
}
type FieldErrors = Partial<Record<keyof Fields, string>>

// ── Register Page ──────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errs, setErrs] = useState<FieldErrors>({})

  const [f, setF] = useState<Fields>({
    firstName: '', lastName: '', orgName: '',
    email: '', mobile: '', password: '', confirmPassword: '',
  })

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF(prev => ({ ...prev, [k]: e.target.value }))
    if (errs[k]) setErrs(prev => ({ ...prev, [k]: undefined }))
  }

  const handleNext = () => {
    const e: FieldErrors = {}
    if (!f.firstName.trim()) e.firstName = 'First name is required'
    if (!f.lastName.trim()) e.lastName = 'Last name is required'
    if (!f.orgName.trim()) e.orgName = 'Organization is required'
    
    if (Object.keys(e).length > 0) {
      setErrs(e)
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err: FieldErrors = {}
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = 'Valid email is required'
    if (!f.mobile.trim()) err.mobile = 'Mobile is required'
    if (!f.password || f.password.length < 8) err.password = 'Password must be 8+ chars'
    if (f.confirmPassword !== f.password) err.confirmPassword = 'Passwords mismatch'
    
    if (Object.keys(err).length > 0) {
      setErrs(err)
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setDone(true)
  }

  // ── Success View ──
  if (done) return (
    <div className="auth-page auth-font min-h-screen flex items-center justify-center p-4">
      <div className="auth-card bg-white rounded-xl overflow-hidden max-w-[420px] w-full p-10 text-center a-pop">
        <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Check size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome aboard!</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-10">
          Account created for <strong className="text-slate-800">{f.email}</strong>.<br/>
          You're ready to start managing your retail chain.
        </p>
        <button className="auth-btn w-full py-3.5 rounded-lg text-sm font-bold text-white bg-brand-500" onClick={() => navigate('/login')}>
          Go to Sign In
        </button>
      </div>
    </div>
  )

  return (
    <div className="auth-page auth-font min-h-screen flex items-center justify-center p-4">
      <div className="auth-card bg-white rounded-xl overflow-hidden flex max-w-[850px] w-full relative z-10">
        
        {/* ── LEFT: Form ── */}
        <div className="flex flex-col p-8 sm:p-10 w-full lg:w-[420px] lg:flex-none">
          
          <div className="flex items-center justify-between mb-10 a-su">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <ShoppingCart size={16} color="white" />
              </div>
              <span className="font-bold text-slate-900 text-[0.95rem]">OrderFlow</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="mb-8 a-su d1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Step {step} of 2 — {step === 1 ? 'Identity' : 'Credentials'}</p>
          </div>

          {step === 1 ? (
            <div key="step1" className="a-su d2 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                  <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.firstName ? 'input-err' : 'border-slate-300'}`} value={f.firstName} onChange={set('firstName')} placeholder="e.g. Alex" />
                  {errs.firstName && <p className="text-xs text-red-500 mt-1.5">{errs.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                  <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.lastName ? 'input-err' : 'border-slate-300'}`} value={f.lastName} onChange={set('lastName')} placeholder="e.g. Smith" />
                  {errs.lastName && <p className="text-xs text-red-500 mt-1.5">{errs.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Organization / Chain Name</label>
                <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.orgName ? 'input-err' : 'border-slate-300'}`} value={f.orgName} onChange={set('orgName')} placeholder="e.g. Acme Stores" />
                {errs.orgName && <p className="text-xs text-red-500 mt-1.5">{errs.orgName}</p>}
              </div>

              <button type="button" onClick={handleNext} className="auth-btn w-full py-3 rounded-lg text-sm font-bold text-white bg-brand-500 flex items-center justify-center gap-2 mt-4">
                Continue <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <form key="step2" onSubmit={handleSubmit} className="a-sir space-y-4">
              <div>
                <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.email ? 'input-err' : 'border-slate-300'}`} value={f.email} onChange={set('email')} type="email" placeholder="you@company.com" />
                {errs.email && <p className="text-xs text-red-500 mt-1.5">{errs.email}</p>}
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</label>
                <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.mobile ? 'input-err' : 'border-slate-300'}`} value={f.mobile} onChange={set('mobile')} type="tel" placeholder="+91 98765 43210" />
                {errs.mobile && <p className="text-xs text-red-500 mt-1.5">{errs.mobile}</p>}
              </div>

              <div className="relative">
                <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.password ? 'input-err' : 'border-slate-300'}`} value={f.password} onChange={set('password')} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[34px] text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errs.password && <p className="text-xs text-red-500 mt-1.5">{errs.password}</p>}
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-slate-700 mb-2">Confirm Password</label>
                <input className={`auth-input w-full px-4 py-3 rounded-md border text-sm ${errs.confirmPassword ? 'input-err' : 'border-slate-300'}`} value={f.confirmPassword} onChange={set('confirmPassword')} type="password" placeholder="Repeat password" />
                {errs.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errs.confirmPassword}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="auth-ghost px-3 rounded-lg border border-slate-200 text-slate-500">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" disabled={loading} className="auth-btn flex-1 py-3 rounded-lg text-sm font-bold text-white bg-brand-500">
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 text-center">
                Already have an account? <Link to="/login" className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 ml-1">Sign in instead</Link>
              </p>
          </div>
        </div>

        {/* ── RIGHT: Feature carousel ── */}
        <FeatureCarousel />
      </div>
    </div>
  )
}
