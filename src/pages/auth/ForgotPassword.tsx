import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShoppingCart, Mail, Shield, CheckCircle2 } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import './auth.css'

const recoverySteps = [
  { icon: <Mail size={16} />, title: 'Enter your email', desc: "We'll look up your account", delay: 'd1' },
  { icon: <Shield size={16} />, title: 'Check your inbox', desc: 'Click the secure link we send', delay: 'd2' },
  { icon: <CheckCircle2 size={16} />, title: 'Reset & sign in', desc: 'Choose a strong new password', delay: 'd3' },
]

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="auth-page auth-font min-h-screen flex items-center justify-center p-4">
      <div className="auth-card bg-white rounded-xl overflow-hidden flex max-w-[800px] w-full relative z-10">
        
        {/* ── LEFT: Guide ── */}
        <div className="hidden lg:flex flex-col flex-1 bg-slate-900 p-10 relative overflow-hidden">
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="flex items-center gap-2.5 mb-14 a-su relative z-10">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} color="white" />
            </div>
            <span className="font-bold text-white text-[0.95rem]">OrderFlow</span>
          </div>

          <div className="mb-10 a-su d1 relative z-10">
            <h2 className="text-2xl font-bold text-white leading-tight mb-4">Account Recovery</h2>
            <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed">Follow these simple steps to regain access to your workspace securely.</p>
          </div>

          <div className="space-y-4 relative z-10">
            {recoverySteps.map((s, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5 a-su ${s.delay}`}>
                <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-10 border-t border-white/5 relative z-10">
            <p className="text-xs text-slate-500">© 2026 OrderFlow Security</p>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex flex-col p-8 sm:p-10 w-full lg:w-[380px] lg:flex-none justify-center">
          
          <div className="flex items-center justify-between mb-10 a-su">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <ShoppingCart size={14} color="white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">OrderFlow</span>
            </div>
            <ThemeToggle />
          </div>

          {!sent ? (
            <div key="form" className="a-su d1">
              <div className="mb-8">
                <h1 className="text-[1.6rem] font-bold text-slate-900 dark:text-white leading-tight">Reset password</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We'll send a link to your email.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[0.78rem] font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@company.com" 
                    className="auth-input w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm"
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn w-full py-3.5 rounded-lg text-sm font-bold text-white bg-brand-500 flex items-center justify-center gap-2">
                  {loading ? 'Sending link...' : <>{'Send Reset Link'} <ArrowRight size={15} /></>}
                </button>
              </form>
            </div>
          ) : (
            <div key="sent" className="text-center a-su">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 a-pop">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 mx-auto leading-relaxed">
                We've sent a password reset link to <br/><strong className="text-slate-800 dark:text-slate-200">{email}</strong>
              </p>
              <Link to="/login" className="auth-btn w-full py-3.5 rounded-lg text-sm font-bold text-white bg-brand-500 inline-block">
                Return to Login
              </Link>
              <button onClick={() => setSent(false)} className="mt-6 text-xs font-bold text-slate-400 hover:text-brand-500 transition-colors">
                Didn't receive it? Try again
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
