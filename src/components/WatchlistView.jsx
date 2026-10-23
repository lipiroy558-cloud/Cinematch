import { useEffect, useMemo, useState } from 'react'
import { fetchMoviesByIds } from '../services/api'
import { useLibrary } from '../context/LibraryContext'
import DiscoverMovieCard from './DiscoverMovieCard'

export default function WatchlistView({ onSelectMovie, onNavigate }) {
  const {
    watchlistIds,
    watchedIds,
    libraryLoading,
    moveToWatched,
    moveToWatchlist,
    toggleWatchlist,
    toggleWatched,
  } = useLibrary()

  const [activeTab, setActiveTab] = useState('watchlist') // 'watchlist' | 'watched'
  const [moviesCatalog, setMoviesCatalog] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [error, setError] = useState(null)

  const relevantIds = useMemo(() => {
    return Array.from(new Set([...watchlistIds, ...watchedIds]))
  }, [watchlistIds, watchedIds])

  useEffect(() => {
    if (!relevantIds.length) {
      return
    }

    const missingIds = relevantIds.filter(
      (id) => !moviesCatalog.some((m) => String(m.id) === String(id))
    )

    if (missingIds.length === 0) return

    setLoadingMovies(true)
    fetchMoviesByIds(missingIds)
      .then((newMovies) => {
        setMoviesCatalog((prev) => {
          const map = new Map(prev.map((m) => [String(m.id), m]))
          for (const movie of newMovies) {
            if (movie && movie.id) {
              map.set(String(movie.id), movie)
            }
          }
          return Array.from(map.values())
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMovies(false))
  }, [relevantIds, moviesCatalog])

  const watchlistMovies = useMemo(
    () => moviesCatalog.filter((m) => watchlistIds.some((id) => String(id) === String(m.id))),
    [moviesCatalog, watchlistIds]
  )

  const watchedMovies = useMemo(
    () => moviesCatalog.filter((m) => watchedIds.some((id) => String(id) === String(m.id))),
    [moviesCatalog, watchedIds]
  )

  const currentList = activeTab === 'watchlist' ? watchlistMovies : watchedMovies
  const currentCount = activeTab === 'watchlist' ? watchlistIds.length : watchedIds.length

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-secondary">
            Your Cinema Library
          </p>
          <h1 className="font-headline-xl-mobile sm:font-headline-xl text-white">
            Watchlist & Diary
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {activeTab === 'watchlist'
              ? `${watchlistIds.length} ${watchlistIds.length === 1 ? 'film' : 'films'} in your queue`
              : `${watchedIds.length} ${watchedIds.length === 1 ? 'film' : 'films'} logged in your watched diary`}
          </p>
        </div>

        {/* Modern Tab Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-surface-container-high/90 border border-white/10 backdrop-blur-xl shadow-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-primary-container text-white shadow-md'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">bookmark</span>
            <span>Want to Watch</span>
            <span
              className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'watchlist'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-on-surface-variant'
              }`}
            >
              {watchlistIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watched')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'watched'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">check_circle</span>
            <span>Watched Diary</span>
            <span
              className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'watched'
                  ? 'bg-white/25 text-white'
                  : 'bg-white/10 text-on-surface-variant'
              }`}
            >
              {watchedIds.length}
            </span>
          </button>
        </div>
      </div>

      {error && <p className="text-error py-4">Unable to load movies: {error}</p>}
      {(libraryLoading || (loadingMovies && currentList.length === 0 && currentCount > 0)) && (
        <p className="text-on-surface-variant py-6">Loading movies...</p>
      )}

      {/* Empty States */}
      {!libraryLoading && currentCount === 0 && (
        <div className="cinema-panel flex flex-col items-center justify-center py-16 px-6 text-center">
          {activeTab === 'watchlist' ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary-container flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-3xl">bookmark_add</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Your watchlist is waiting</h2>
              <p className="max-w-sm text-sm leading-6 text-on-surface-variant">
                Save films that catch your eye to build a private queue for your upcoming movie nights.
              </p>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('discover')}
                  className="mt-6 rounded-full bg-primary-container px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#f02a55] active:scale-95 shadow-lg"
                >
                  Discover Movies
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-3xl">history_edu</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">No watched films logged yet</h2>
              <p className="max-w-sm text-sm leading-6 text-on-surface-variant">
                Mark movies you've watched to log your cinema diary, unlock stats, and power tailored recommendations.
              </p>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('discover')}
                  className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-950/40"
                >
                  Browse Films to Log
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Grid of Movie Cards */}
      {!libraryLoading && currentList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
          {currentList.map((movie) => (
            <div key={movie.id} className="flex flex-col">
              <DiscoverMovieCard movie={movie} onSelect={onSelectMovie} />

              {/* Contextual Action Bar for each card in the tab */}
              <div className="mt-2.5 flex items-center gap-1.5">
                {activeTab === 'watchlist' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => moveToWatched(movie.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                      title="Move to Watched Diary"
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      <span>Mark Watched</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(movie.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[11px] transition active:scale-95"
                      title="Remove from Watchlist"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => moveToWatchlist(movie.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 border border-primary-container/30 text-primary text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                      title="Move back to Want to Watch"
                    >
                      <span className="material-symbols-outlined text-[14px]">bookmark</span>
                      <span>To Watchlist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWatched(movie.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[11px] transition active:scale-95"
                      title="Remove from Watched Diary"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
