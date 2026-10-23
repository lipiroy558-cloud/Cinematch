import { useEffect, useMemo, useRef, useState } from 'react'
import { MOVIES } from '../data/movies'
import { fetchDiscoverMovies, fetchMovieById } from '../services/api'
import { useLibrary } from '../context/LibraryContext'

const VIBES = [
  { id: 'all', label: '🎲 Any Gem', description: 'Total wildcard across all genres' },
  { id: 'mind-bender', label: '🧠 Mind-Bender', description: 'Sci-Fi, mystery & psychological plot twists', genres: ['Sci-Fi', 'Mystery', 'Psych Thriller', 'Thriller'] },
  { id: 'feel-good', label: '🍿 Feel-Good', description: 'Comedy, heartwarming romance & adventures', genres: ['Comedy', 'Romance', 'Adventure'] },
  { id: 'action', label: '💥 Adrenaline Rush', description: 'High-octane action, crime & thriller chases', genres: ['Action', 'Crime', 'Thriller'] },
  { id: 'masterpiece', label: '🏆 All-Time Masterpiece', description: 'Critically acclaimed 8.0+ rating cinema', minRating: 8.0 },
  { id: 'bollywood', label: '🇮🇳 Bollywood Epic', description: 'Iconic Hindi cinema blockbusters & emotional sagas', industry: 'bollywood' },
  { id: 'french', label: '🇫🇷 French Cinema', description: 'Atmospheric French new wave & modern classics', industry: 'french' },
]

export default function SurpriseMeModal({ isOpen, onClose, onSelectMovie }) {
  const { isWatchlisted, toggleWatchlist } = useLibrary()
  const [selectedVibe, setSelectedVibe] = useState('all')
  const [isSpinning, setIsSpinning] = useState(false)
  const [displayMovie, setDisplayMovie] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [moviePool, setMoviePool] = useState(MOVIES)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const spinTimerRef = useRef(null)

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filter pool based on selected vibe
  const filteredPool = useMemo(() => {
    const vibe = VIBES.find((v) => v.id === selectedVibe) || VIBES[0]
    let pool = [...moviePool]

    if (vibe.industry) {
      pool = pool.filter((m) => (m.industry || '').toLowerCase() === vibe.industry)
    }
    if (vibe.genres && vibe.genres.length > 0) {
      const gLower = vibe.genres.map((g) => g.toLowerCase())
      pool = pool.filter((m) =>
        (m.genres || []).some((g) => gLower.includes(g.toLowerCase()))
      )
    }
    if (vibe.minRating) {
      pool = pool.filter((m) => (m.rating || 0) >= vibe.minRating)
    }

    // If filter is too restrictive, fallback to full pool
    return pool.length > 0 ? pool : moviePool
  }, [selectedVibe, moviePool])

  // Perform the roulette spin animation
  const spinRoulette = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setIsPlayingTrailer(false)
    setTrailerKey(null)

    const pool = filteredPool.length > 0 ? filteredPool : MOVIES
    let counter = 0
    const totalSteps = 16
    let speed = 60

    // Pick a guaranteed winner different from current if possible
    const available = pool.filter((m) => !selectedMovie || m.id !== selectedMovie.id)
    const winner = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)]

    const step = () => {
      counter++
      const randomPreview = pool[Math.floor(Math.random() * pool.length)]
      setDisplayMovie(randomPreview)

      if (counter < totalSteps) {
        speed += 18 // progressive deceleration
        spinTimerRef.current = setTimeout(step, speed)
      } else {
        // Landing on the final winner
        setDisplayMovie(winner)
        setSelectedMovie(winner)
        setIsSpinning(false)

        // Enrich with trailer if available
        if (winner?.id) {
          fetchMovieById(winner.id)
            .then((enriched) => {
              if (enriched?.trailerKey) setTrailerKey(enriched.trailerKey)
            })
            .catch(() => {})
        }
      }
    }

    step()
  }

  // Spin automatically when opened the first time
  useEffect(() => {
    if (isOpen && !selectedMovie) {
      spinRoulette()
    }
    return () => {
      if (spinTimerRef.current) clearTimeout(spinTimerRef.current)
    }
  }, [isOpen])

  if (!isOpen) return null

  const movie = selectedMovie || displayMovie || MOVIES[0]
  const watchlisted = isWatchlisted(movie?.id)

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#14161f] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col scrollbar-thin scrollbar-thumb-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary to-amber-500 text-black flex items-center justify-center font-bold shadow-md">
              <span className="material-symbols-outlined text-[18px]">casino</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Movie Roulette</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold uppercase tracking-wider">
                  Surprise Me
                </span>
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Can't decide what to watch? Let CineMatch roll the dice.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 text-white flex items-center justify-center transition active:scale-90"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Vibe Filter Pills */}
        <div className="px-6 pt-4 pb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              type="button"
              disabled={isSpinning}
              onClick={() => {
                setSelectedVibe(vibe.id)
                setSelectedMovie(null)
                // Spin with the newly selected vibe
                setTimeout(() => spinRoulette(), 50)
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                selectedVibe === vibe.id
                  ? 'bg-secondary text-black shadow-md font-bold'
                  : 'bg-white/[0.05] hover:bg-white/10 text-white/80 border border-white/5'
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>

        {/* Main Roulette Display Card */}
        <div className="px-6 py-2 flex-1">
          {isPlayingTrailer && trailerKey ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl mb-4 border border-white/10">
              <iframe
                title={`${movie?.title} Trailer`}
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => setIsPlayingTrailer(false)}
                className="absolute top-2 left-2 px-3 py-1 rounded-full bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1 transition border border-white/20"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                <span>Back</span>
              </button>
            </div>
          ) : (
            <div
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-surface-container to-surface-container-high border border-white/10 p-4 transition-all duration-300 ${
                isSpinning
                  ? 'ring-2 ring-secondary/50 scale-[0.99] blur-[0.5px]'
                  : 'shadow-xl hover:border-white/20'
              }`}
            >
              {/* Spinning Overlay Indicator */}
              {isSpinning && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-secondary animate-spin mb-2">
                    casino
                  </span>
                  <span className="text-xs font-bold text-white tracking-widest uppercase animate-pulse">
                    Rolling the dice...
                  </span>
                </div>
              )}

              <div className="flex gap-4 items-start">
                {/* Poster */}
                <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shrink-0 bg-surface-container-highest border border-white/10">
                  <img
                    src={movie?.poster || '/movie-fallback.svg'}
                    alt={movie?.title || 'Film'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/movie-fallback.svg'
                    }}
                  />
                  {movie?.rating && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-secondary flex items-center gap-0.5">
                      <span>★</span>
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
                      Match Result
                    </span>
                    {movie?.year && (
                      <span className="text-xs text-white/60 font-semibold">• {movie.year}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white truncate leading-tight mb-1">
                    {movie?.title}
                  </h3>

                  {movie?.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {movie.genres.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 text-[10px] font-medium"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-2">
                    {movie?.description || 'A hand-picked cinematic masterpiece for your movie night.'}
                  </p>

                  {movie?.director && (
                    <p className="text-[11px] text-white/50 truncate">
                      Directed by <strong className="text-white/80">{movie.director}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-surface-container-lowest/50 flex flex-col sm:flex-row items-center gap-3">
          {/* Spin Again Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={spinRoulette}
            className="w-full sm:w-auto flex-1 px-5 py-3 rounded-full bg-secondary hover:bg-[#ffc677] text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">casino</span>
            <span>{isSpinning ? 'Rolling...' : 'Roll Again 🎲'}</span>
          </button>

          {/* Quick Actions (Trailer, Watchlist, Details) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {trailerKey && !isPlayingTrailer && (
              <button
                type="button"
                onClick={() => setIsPlayingTrailer(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 backdrop-blur-md shadow-md active:scale-95 transition-all"
                title="Watch Trailer"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                <span>Trailer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => movie && toggleWatchlist(movie.id)}
              className={`px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold active:scale-95 ${
                watchlisted
                  ? 'border-primary-container bg-primary-container text-white'
                  : 'border-white/10 bg-white/[0.05] text-white hover:bg-white/10'
              }`}
              title={watchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {watchlisted ? 'bookmark' : 'bookmark_add'}
              </span>
              <span className="hidden sm:inline">{watchlisted ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                if (movie && onSelectMovie) onSelectMovie(movie)
              }}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1 active:scale-95"
            >
              <span>Full Details</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
