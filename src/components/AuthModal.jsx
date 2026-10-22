import { useEffect, useState } from 'react'
import { useLibrary } from '../context/LibraryContext'

export default function AuthModal({ isOpen, initialMode = 'login', onClose }) {
  const { login, register, isAuthenticated } = useLibrary()
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMode(initialMode)
    setError(null)
  }, [initialMode, isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || isAuthenticated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register(form)
      }
      onClose()
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#151820] border border-white/10 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container/20 text-primary-container mb-3 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
            <span className="material-symbols-outlined text-[26px]">
              {mode === 'login' ? 'lock' : 'person_add'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Welcome to CineMatch' : 'Create an Account'}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {mode === 'login'
              ? 'Sign in to sync your Watchlist, Likes, and Taste DNA'
              : 'Join to get AI-powered recommendations tailored to your taste'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-white/[0.04] p-1 mb-5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-primary-container text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-primary-container text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                  person
                </span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Christopher Nolan"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-white/70 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                mail
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@domain.com"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/70 mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-white/40">
                key
              </span>
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="•••••••• (8+ characters)"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 mt-2 rounded-xl bg-primary-container text-white font-bold text-sm hover:bg-[#f02a55] transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Please wait...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to CineMatch</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <span className="material-symbols-outlined text-[18px]">check</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switcher */}
        <div className="mt-5 text-center text-xs text-on-surface-variant">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                className="font-bold text-secondary hover:underline"
              >
                Create one for free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                className="font-bold text-secondary hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
