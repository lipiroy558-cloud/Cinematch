import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile'
import { searchMovies } from '../services/api'
import { useLibrary } from '../context/LibraryContext'

// Fixed top header: logo + nav links, working search, notifications,
// and prominent Sign In / User Profile button right in front.
export default function Navbar({ activeView, onNavigate, onProfileClick, onSelectMovie }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [remoteResults, setRemoteResults] = useState([])
  const [searchError, setSearchError] = useState(null)
  const inputRef = useRef(null)
  const { user, isAuthenticated, openAuth } = useLibrary()

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setRemoteResults([])
      setSearchError(null)
      return undefined
    }
    const timer = setTimeout(
      () =>
        searchMovies(q)
          .then(setRemoteResults)
          .catch((e) => setSearchError(e.message)),
      300
    )
    return () => clearTimeout(timer)
  }, [query])

  const results = remoteResults

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  const handleSelect = (movie) => {
    onSelectMovie(movie)
    closeSearch()
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#0b0d12]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.24)] border-b border-white/[0.07]">
        <div className="page-shell h-[4.5rem] px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-space-sm min-w-0 cursor-pointer" onClick={() => onNavigate('home')}>
            <img
              src="/cinematch-logo.svg"
              alt="CineMatch"
              className="h-9 w-auto max-w-[8.8rem] sm:max-w-[10.5rem] object-contain"
            />
          </div>

          <div className="hidden md:flex items-center gap-1 mr-auto ml-10">
            {[
              ['home', 'Home'],
              ['discover', 'Discover'],
              ['for-you', 'For You'],
              ['watchlist', 'Watchlist'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === id
                    ? 'bg-white/[0.08] text-white'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label={searchOpen ? 'Close Search' : 'Search'}
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">
                {searchOpen ? 'close' : 'search'}
              </span>
            </button>

            <button
              aria-label="Notifications"
              type="button"
              className="hidden sm:flex w-10 h-10 relative items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
            </button>

            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-container text-white text-xs font-bold hover:bg-[#f02a55] transition shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                aria-label="Open Profile"
                onClick={onProfileClick}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors active:scale-95"
              >
                {user?.avatar ? (
                  <img
                    alt={user?.name || 'User Avatar'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40"
                    src={user.avatar}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-container to-secondary flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary-container/40 shadow-sm">
                    {user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <span className="material-symbols-outlined text-[17px]">person</span>
                    )}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-white truncate max-w-[5.5rem]">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 px-margin-mobile pb-3 bg-surface/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-lg">
            <div className="relative pt-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 translate-y-1 text-[18px] text-outline">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-white/10 text-on-surface placeholder:text-outline font-body-md text-body-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>
            {query.trim() && (
              <div className="mt-2 bg-surface-container-high rounded-xl overflow-hidden shadow-md border border-white/[0.06]">
                {searchError ? (
                  <p className="p-3 font-body-sm text-body-sm text-error">Search failed: {searchError}</p>
                ) : results.length === 0 ? (
                  <p className="p-3 font-body-sm text-body-sm text-on-surface-variant">No movies found.</p>
                ) : (
                  results.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSelect(movie)}
                      className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface-bright transition-colors"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-9 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="block font-title-sm text-body-sm text-on-surface font-semibold truncate">
                          {movie.title}
                        </span>
                        <span className="block font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider truncate">
                          {movie.year} • {movie.genres.join(', ')}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {searchOpen && <div className="fixed inset-0 z-40" onClick={closeSearch} />}
    </>
  )
}
