import { useEffect, useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { fetchMovieById } from '../services/api'

export default function MovieModal({ movie, onClose }) {
  const { isLiked, isWatchlisted, toggleLike, toggleWatchlist } = useLibrary()
  const [details, setDetails] = useState(movie)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showCast, setShowCast] = useState(false)

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    setDetails(movie)
    setShowCast(false)
    if (!movie) return

    if (movie.director && Array.isArray(movie.cast) && movie.cast.length > 0) {
      return
    }

    let active = true
    setLoadingDetails(true)
    fetchMovieById(movie.id)
      .then((fullData) => {
        if (active && fullData) {
          setDetails((prev) => ({ ...prev, ...fullData }))
        }
      })
      .catch((err) => {
        console.warn('Could not load movie credits:', err.message)
      })
      .finally(() => {
        if (active) setLoadingDetails(false)
      })

    return () => {
      active = false
    }
  }, [movie])

  if (!movie) return null
  const current = details || movie
  const liked = isLiked(current.id || movie.id)
  const watchlisted = isWatchlisted(current.id || movie.id)
  const castList = current.cast || []
  const hasCast = castList.length > 0 || loadingDetails

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <article
        className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-[#151820] border border-white/10 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-44 sm:h-56 overflow-hidden">
          <img
            src={current.backdrop || current.poster || '/movie-fallback.svg'}
            onError={(event) => {
              event.currentTarget.src = '/movie-fallback.svg'
            }}
            alt=""
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151820] via-[#151820]/30 to-transparent" />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-primary-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="relative grid gap-5 px-5 pb-6 sm:grid-cols-[8.5rem_1fr] sm:px-7 sm:pb-7">
          <img
            src={current.poster || '/movie-fallback.svg'}
            onError={(event) => {
              event.currentTarget.src = '/movie-fallback.svg'
            }}
            alt={current.title}
            className="-mt-16 sm:-mt-24 aspect-[2/3] w-28 sm:w-36 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 shrink-0"
          />
          <div className="pt-2 sm:pt-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
                  Movie details
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {current.title}
                </h2>
              </div>
              <span className="rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary flex items-center gap-1 shrink-0">
                ★ {(current.rating || 0).toFixed(1)}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-medium text-white/90">{current.year || '—'}</span>
              <span>•</span>
              {(current.genres || []).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/80"
                >
                  {genre}
                </span>
              ))}
            </div>

            {current.director && (
              <p className="mt-2 text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[.16em] text-secondary">
                  Directed by
                </span>
                <span className="font-semibold text-white">{current.director}</span>
              </p>
            )}

            <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-on-surface-variant line-clamp-4 sm:line-clamp-5">
              {current.description || 'No overview is available for this movie yet.'}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => toggleWatchlist(current.id || movie.id)}
                className="flex-1 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f02a55] flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {watchlisted ? 'bookmark' : 'bookmark_add'}
                </span>
                {watchlisted ? 'In watchlist' : 'Add to watchlist'}
              </button>
              <button
                type="button"
                aria-label={liked ? 'Unlike' : 'Like'}
                onClick={() => toggleLike(current.id || movie.id)}
                className={`h-11 w-11 rounded-xl border transition flex items-center justify-center shrink-0 ${
                  liked
                    ? 'border-primary-container bg-primary-container text-white'
                    : 'border-white/10 bg-white/[0.05] text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>

            {/* Collapsible Cast Section */}
            {hasCast && (
              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCast((prev) => !prev)}
                  className="flex w-full items-center justify-between py-1 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[.2em] text-secondary group-hover:text-primary transition-colors">
                      Top Cast
                    </span>
                    {castList.length > 0 && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                        {castList.length}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/50 group-hover:text-white transition-colors">
                    {showCast ? 'Hide' : 'Show'}
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-200">
                      {showCast ? 'expand_less' : 'expand_more'}
                    </span>
                  </span>
                </button>

                {showCast && (
                  <div className="mt-3">
                    {loadingDetails && castList.length === 0 ? (
                      <div className="grid grid-cols-2 gap-2 py-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg bg-white/[0.02] p-2 border border-white/5 animate-pulse"
                          >
                            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="h-2.5 w-16 bg-white/10 rounded" />
                              <div className="h-2 w-12 bg-white/10 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : castList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/15">
                        {castList.map((actor) => (
                          <div
                            key={actor.id || actor.name}
                            className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] p-1.5 border border-white/5 hover:border-white/15 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10 flex items-center justify-center">
                              {actor.profile ? (
                                <img
                                  src={actor.profile}
                                  alt={actor.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                              <span
                                className={`material-symbols-outlined text-[16px] text-white/30 ${
                                  actor.profile ? 'hidden' : ''
                                }`}
                              >
                                person
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="text-[11px] font-semibold text-white truncate"
                                title={actor.name}
                              >
                                {actor.name}
                              </p>
                              <p
                                className="text-[10px] text-on-surface-variant truncate"
                                title={actor.character}
                              >
                                {actor.character || '—'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant/70 italic py-1">
                        Cast details unavailable.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
