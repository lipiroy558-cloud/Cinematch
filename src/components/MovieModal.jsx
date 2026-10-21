import { useEffect, useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { fetchMovieById } from '../services/api'

export default function MovieModal({ movie, onClose }) {
  const { isLiked, isWatchlisted, toggleLike, toggleWatchlist } = useLibrary()
  const [details, setDetails] = useState(movie)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    setDetails(movie)
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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <article
        className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-[#151820] border border-white/10 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-48 sm:h-64 overflow-hidden">
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
            className="absolute top-4 right-4 h-10 w-10 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-primary-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="relative grid gap-6 px-5 pb-6 sm:grid-cols-[10rem_1fr] sm:px-8 sm:pb-8">
          <img
            src={current.poster || '/movie-fallback.svg'}
            onError={(event) => {
              event.currentTarget.src = '/movie-fallback.svg'
            }}
            alt={current.title}
            className="-mt-20 aspect-[2/3] w-32 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:-mt-28 sm:w-40 shrink-0"
          />
          <div className="pt-5 sm:pt-3 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
                    Movie details
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {current.title}
                  </h2>
                </div>
                <span className="rounded-lg bg-secondary/10 px-3 py-2 text-sm font-bold text-secondary flex items-center gap-1">
                  ★ {(current.rating || 0).toFixed(1)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-medium text-white/90">{current.year || '—'}</span>
                <span>•</span>
                {(current.genres || []).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs text-white/80"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {current.director && (
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-[.18em] text-secondary">
                    Directed by
                  </span>
                  <span className="font-semibold text-white">{current.director}</span>
                </div>
              )}

              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                {current.description || 'No overview is available for this movie yet.'}
              </p>

              {/* Cast Section */}
              <div className="mt-5 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
                    Top Cast
                  </h3>
                  {current.cast?.length > 0 && (
                    <span className="text-[11px] text-on-surface-variant">
                      {current.cast.length} actors
                    </span>
                  )}
                </div>

                {loadingDetails && (!current.cast || current.cast.length === 0) ? (
                  <div className="flex gap-3 overflow-hidden py-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-20 flex flex-col items-center animate-pulse"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/10 mb-2" />
                        <div className="h-2.5 w-14 bg-white/10 rounded mb-1.5" />
                        <div className="h-2 w-10 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                ) : current.cast && current.cast.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent snap-x snap-mandatory">
                    {current.cast.map((actor) => (
                      <div
                        key={actor.id || actor.name}
                        className="flex-shrink-0 w-20 text-center flex flex-col items-center group snap-start"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-white/5 shadow-md mb-1.5 flex items-center justify-center shrink-0 ring-1 ring-white/5 transition-transform duration-200 group-hover:scale-105 group-hover:border-secondary/40">
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
                            className={`material-symbols-outlined text-[24px] text-white/30 ${
                              actor.profile ? 'hidden' : ''
                            }`}
                          >
                            person
                          </span>
                        </div>
                        <p
                          className="text-[11px] font-medium text-white leading-tight truncate w-full group-hover:text-secondary transition-colors"
                          title={actor.name}
                        >
                          {actor.name}
                        </p>
                        <p
                          className="text-[10px] text-on-surface-variant leading-tight truncate w-full mt-0.5"
                          title={actor.character}
                        >
                          {actor.character || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/70 italic py-1">
                    Cast details unavailable for this title.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => toggleWatchlist(current.id || movie.id)}
                className="flex-1 rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f02a55] flex items-center justify-center gap-1.5"
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
                className={`h-12 w-12 rounded-xl border transition flex items-center justify-center ${
                  liked
                    ? 'border-primary-container bg-primary-container text-white'
                    : 'border-white/10 bg-white/[0.05] text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
