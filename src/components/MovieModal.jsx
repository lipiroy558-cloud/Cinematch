import { useEffect, useRef, useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import { fetchMovieById, fetchSimilarMovies } from '../services/api'

export default function MovieModal({ movie, onClose, onSearchPerson }) {
  const { isLiked, isWatchlisted, isWatched, toggleLike, toggleWatchlist, toggleWatched } = useLibrary()
  
  const [activeMovie, setActiveMovie] = useState(movie)
  const [details, setDetails] = useState(movie)
  const [navHistory, setNavHistory] = useState([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showCast, setShowCast] = useState(false)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false)
  
  const [similarMovies, setSimilarMovies] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  
  const modalBodyRef = useRef(null)

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Reset when primary movie prop changes from outside
  useEffect(() => {
    setActiveMovie(movie)
    setNavHistory([])
  }, [movie])

  // Load details whenever activeMovie changes
  useEffect(() => {
    if (!activeMovie) return
    setDetails(activeMovie)
    setShowCast(false)
    setIsPlayingTrailer(false)

    let active = true
    setLoadingDetails(true)
    fetchMovieById(activeMovie.id)
      .then((fullData) => {
        if (active && fullData) {
          setDetails((prev) => ({ ...prev, ...fullData }))
        }
      })
      .catch((err) => {
        console.warn('Could not load movie details:', err.message)
      })
      .finally(() => {
        if (active) setLoadingDetails(false)
      })

    return () => {
      active = false
    }
  }, [activeMovie])

  // Fetch similar movies whenever activeMovie or details update
  useEffect(() => {
    if (!activeMovie) {
      setSimilarMovies([])
      return
    }
    let active = true
    setLoadingSimilar(true)
    fetchSimilarMovies(details || activeMovie)
      .then((list) => {
        if (active) setSimilarMovies(list || [])
      })
      .catch(() => {
        if (active) setSimilarMovies([])
      })
      .finally(() => {
        if (active) setLoadingSimilar(false)
      })

    return () => {
      active = false
    }
  }, [activeMovie?.id, details?.title])

  if (!movie || !activeMovie) return null
  const current = details || activeMovie
  const liked = isLiked(current.id || activeMovie.id)
  const watchlisted = isWatchlisted(current.id || activeMovie.id)
  const watched = isWatched(current.id || activeMovie.id)
  const castList = current.cast || []
  const hasCast = castList.length > 0 || loadingDetails
  const trailerKey = current.trailerKey
  const providers = current.watchProviders || {}
  const streamList = providers.flatrate || []
  const rentList = providers.rent || []
  const hasProviders = streamList.length > 0 || rentList.length > 0

  const handleSelectSimilar = (item) => {
    if (!item || String(item.id) === String(current.id)) return
    setNavHistory((prev) => [...prev, current])
    setActiveMovie(item)
    setIsPlayingTrailer(false)
    setShowCast(false)
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleGoBack = () => {
    if (navHistory.length === 0) return
    const prevMovie = navHistory[navHistory.length - 1]
    setNavHistory((prev) => prev.slice(0, -1))
    setActiveMovie(prevMovie)
    setIsPlayingTrailer(false)
    setShowCast(false)
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-6 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <article
        ref={modalBodyRef}
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-[#151820] border border-white/10 shadow-2xl scrollbar-thin scrollbar-thumb-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Backdrop or Trailer Video Player */}
        <div className="relative overflow-hidden bg-black">
          {isPlayingTrailer && trailerKey ? (
            <div className="relative aspect-video w-full bg-black">
              <iframe
                title={`${current.title} Official Trailer`}
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                type="button"
                onClick={() => setIsPlayingTrailer(false)}
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition z-20 border border-white/20 active:scale-95 shadow-lg"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Close Trailer</span>
              </button>
            </div>
          ) : (
            <div className="relative h-48 sm:h-60 overflow-hidden">
              <img
                src={current.backdrop || current.poster || '/movie-fallback.svg'}
                onError={(event) => {
                  event.currentTarget.src = '/movie-fallback.svg'
                }}
                alt=""
                className="h-full w-full object-cover opacity-60 transition duration-500 scale-100 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151820] via-[#151820]/40 to-transparent" />

              {/* Watch Trailer Transparent Button Overlay */}
              {trailerKey ? (
                <button
                  type="button"
                  onClick={() => setIsPlayingTrailer(true)}
                  className="absolute inset-0 m-auto w-fit h-fit flex items-center gap-2.5 px-6 py-3 rounded-full bg-black/45 hover:bg-black/65 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl border border-white/30 hover:border-white/60 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[15px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                  <span>Watch Trailer</span>
                </button>
              ) : (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(current.title + ' ' + (current.year || '') + ' official trailer')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 m-auto w-fit h-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/70 hover:bg-black text-white font-medium text-xs backdrop-blur-xl border border-white/20 hover:border-white/40 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px] text-secondary">search</span>
                  <span>Search Trailer on YouTube</span>
                </a>
              )}

              {/* Navigation History Breadcrumb */}
              {navHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="absolute top-4 left-4 h-9 px-3 rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition hover:bg-black flex items-center gap-1.5 z-10 active:scale-90 text-xs font-semibold shadow-lg"
                  title={`Back to ${navHistory[navHistory.length - 1].title}`}
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {navHistory[navHistory.length - 1].title}
                  </span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute top-4 right-4 h-9 w-9 rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition hover:bg-white/25 flex items-center justify-center z-10 active:scale-90"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}
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
                {current.tagline && (
                  <p className="text-xs text-white/50 italic mt-0.5 line-clamp-1">
                    "{current.tagline}"
                  </p>
                )}
              </div>
              <span className="rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary flex items-center gap-1 shrink-0">
                ★ {(current.rating || 0).toFixed(1)}
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-semibold text-white/90">{current.year || '—'}</span>
              {current.runtime && (
                <>
                  <span>•</span>
                  <span className="text-white/80 font-medium">{current.runtime}</span>
                </>
              )}
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
                <button
                  type="button"
                  onClick={() => onSearchPerson && onSearchPerson(current.director)}
                  className="font-semibold text-white hover:text-primary-container transition underline-offset-2 hover:underline"
                  title={`Find more films directed by ${current.director}`}
                >
                  {current.director}
                </button>
              </p>
            )}

            <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-on-surface-variant line-clamp-4 sm:line-clamp-5">
              {current.description || 'No overview is available for this movie yet.'}
            </p>

            {/* Actions: Watchlist, Watched, Trailer & Like */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleWatchlist(current.id || activeMovie.id)}
                className="flex-1 min-w-[130px] rounded-xl bg-primary-container px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#f02a55] flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {watchlisted ? 'bookmark' : 'bookmark_add'}
                </span>
                {watchlisted ? 'In watchlist' : 'Add to watchlist'}
              </button>
              <button
                type="button"
                onClick={() => toggleWatched(current.id || activeMovie.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm ${
                  watched
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'border-white/15 bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={watched ? 'Marked as watched' : 'Mark as watched'}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${watched ? 'text-emerald-400' : 'text-white/80'}`}
                  style={watched ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {watched ? 'check_circle' : 'done'}
                </span>
                <span>{watched ? 'Watched' : 'Mark Watched'}</span>
              </button>
              {trailerKey && (
                <button
                  type="button"
                  onClick={() => setIsPlayingTrailer(true)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                  title="Play Official Trailer"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  <span className="hidden sm:inline">Play</span>
                  <span>Trailer</span>
                </button>
              )}
              <button
                type="button"
                aria-label={liked ? 'Unlike' : 'Like'}
                onClick={() => toggleLike(current.id || activeMovie.id)}
                className={`h-11 w-11 rounded-xl border transition flex items-center justify-center shrink-0 active:scale-95 ${
                  liked
                    ? 'border-primary-container bg-primary-container text-white shadow-md'
                    : 'border-white/10 bg-white/[0.05] text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>

            {/* "Where to Watch" Streaming Availability */}
            {hasProviders && (
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[.18em] text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">tv</span>
                    Where to Watch
                  </span>
                  {providers.justWatchLink && (
                    <a
                      href={providers.justWatchLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-white/50 hover:text-white transition flex items-center gap-0.5"
                    >
                      <span>Powered by JustWatch</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                </div>

                {streamList.length > 0 && (
                  <div>
                    <span className="text-[11px] text-white/70 block mb-1 font-medium">Stream on:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {streamList.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/10 text-white/90 text-xs font-medium"
                        >
                          {p.logo && <img src={p.logo} alt={p.name} className="w-4 h-4 rounded object-cover" />}
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {streamList.length === 0 && rentList.length > 0 && (
                  <div>
                    <span className="text-[11px] text-white/70 block mb-1 font-medium">Rent / Buy on:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {rentList.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high border border-white/10 text-white/90 text-xs font-medium"
                        >
                          {p.logo && <img src={p.logo} alt={p.name} className="w-4 h-4 rounded object-cover" />}
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Cast Section */}
            {hasCast && (
              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCast((prev) => !prev)}
                  className="flex w-full items-center justify-between py-1 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors group cursor-pointer"
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
                            className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] p-1.5 border border-white/5 hover:border-white/20 transition-all group"
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
                              <button
                                type="button"
                                onClick={() => onSearchPerson && onSearchPerson(actor.name)}
                                className="text-[11px] font-semibold text-white group-hover:text-primary-container truncate text-left w-full hover:underline"
                                title={`Find movies with ${actor.name}`}
                              >
                                {actor.name}
                              </button>
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

            {/* "More Like This" Similar Movies (Static Grid - Visible in One Instance, No Sliding) */}
            {(similarMovies.length > 0 || loadingSimilar) && (
              <div className="mt-5 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[17px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[.22em] text-secondary">
                    More Like This
                  </span>
                  {similarMovies.length > 0 && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                      {Math.min(similarMovies.length, 4)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {loadingSimilar && similarMovies.length === 0 ? (
                    [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-full aspect-[2/3] rounded-xl bg-white/[0.03] animate-pulse border border-white/5"
                      />
                    ))
                  ) : (
                    similarMovies.slice(0, 4).map((similar) => (
                      <div
                        key={similar.id}
                        onClick={() => handleSelectSimilar(similar)}
                        className="group/card w-full flex flex-col cursor-pointer transition-transform active:scale-95"
                        title={`View ${similar.title}`}
                      >
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-high border border-white/10 group-hover/card:border-primary-container/60 shadow-md transition-all">
                          <img
                            src={similar.poster || '/movie-fallback.svg'}
                            alt={similar.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = '/movie-fallback.svg'
                            }}
                            className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                          {/* Hover Play icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                            <div className="w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center border border-white/40 shadow-lg scale-90 group-hover/card:scale-100 transition-transform">
                              <span className="material-symbols-outlined text-[18px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                                play_arrow
                              </span>
                            </div>
                          </div>

                          {/* Rating badge */}
                          {similar.rating > 0 && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md flex items-center gap-0.5 shadow-sm text-[10px] font-bold text-secondary">
                              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                star
                              </span>
                              <span>{Number(similar.rating).toFixed(1)}</span>
                            </div>
                          )}

                          {/* Title overlay */}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5">
                            <p className="text-[11px] font-semibold text-white truncate leading-tight group-hover/card:text-primary-container transition-colors">
                              {similar.title}
                            </p>
                            <p className="text-[9px] text-white/60">
                              {similar.year || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
