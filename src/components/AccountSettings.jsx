import { useState } from 'react'
import { useLibrary } from '../context/LibraryContext'

// "Preferences & Account" settings list: one working toggle
// (Weekly AI Friday Drops) plus navigational rows and a logout action.
export default function AccountSettings() {
  const [fridayDrops, setFridayDrops] = useState(true)
  const { user, isAuthenticated, login, register, logout } = useLibrary()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(null)
    try { await (mode === 'login' ? login({ email: form.email, password: form.password }) : register(form)); setForm({ name: '', email: '', password: '' }) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  return (
    <section className="px-margin-mobile">
      <h2 className="font-title-sm text-title-sm text-on-surface font-bold mb-3 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-secondary text-[20px]">settings</span>
        <span>Preferences &amp; Account</span>
      </h2>

      <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm">
        {!isAuthenticated ? (
          <form className="p-4 border-b border-white/[0.08]" onSubmit={submit}>
            <h3 className="font-title-sm text-body-md text-on-surface font-semibold mb-3">{mode === 'login' ? 'Log in to sync your library' : 'Create your CineMatch account'}</h3>
            {mode === 'register' && <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full mb-2 rounded-lg bg-surface-container-high p-2 text-on-surface" />}
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full mb-2 rounded-lg bg-surface-container-high p-2 text-on-surface" />
            <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (8+ characters)" className="w-full mb-2 rounded-lg bg-surface-container-high p-2 text-on-surface" />
            {error && <p className="text-error text-sm mb-2">{error}</p>}
            <button disabled={busy} className="w-full py-2 rounded-lg bg-primary-container text-on-primary-container">{busy ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}</button>
            <button type="button" className="mt-2 text-sm text-secondary underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>{mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}</button>
          </form>
        ) : <div className="p-4 border-b border-white/[0.08] text-on-surface">Signed in as <strong>{user?.name}</strong> ({user?.email})</div>}
        {/* Toggle: Weekly AI Friday Drops */}
        <div className="p-4 flex items-center justify-between gap-3 bg-surface-container hover:bg-surface-container-high/40 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">auto_awesome_motion</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-medium block truncate">
                Weekly AI Friday Drops
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant block">
                Curated 5-film playlist every Friday
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={fridayDrops}
              onChange={(e) => setFridayDrops(e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
          </label>
        </div>

        {/* Display Theme */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between gap-3 text-left bg-surface-container hover:bg-surface-container-high/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-medium block truncate">
                Display Theme
              </span>
              <span className="font-body-sm text-[11px] text-secondary font-medium block">
                Cinematic Obsidian (Active)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </div>
        </button>

        {/* Trailer Playback Quality */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between gap-3 text-left bg-surface-container hover:bg-surface-container-high/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">hd</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-medium block truncate">
                Trailer Playback Quality
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant block">
                Dolby Vision &amp; Spatial Atmos
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </div>
        </button>

        {/* Privacy & Data Sharing */}
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between gap-3 text-left bg-surface-container hover:bg-surface-container-high/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-medium block truncate">
                Taste Privacy &amp; Letterboxd Sync
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant block">
                Connected to elena_cinema
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </div>
        </button>

        {/* Log Out */}
        <div className="p-3 bg-surface-container-low/70">
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 px-4 rounded-xl text-error hover:bg-error-container/20 active:scale-[0.99] font-title-sm text-body-md flex items-center justify-center gap-2 transition-all border border-error-container/40"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Log Out of CineMatch</span>
          </button>
        </div>
      </div>
    </section>
  )
}
