import { useEffect, useMemo, useState } from 'react'
import { fetchMovieById } from '../services/api'
import { useLibrary } from '../context/LibraryContext'
import DiscoverMovieCard from './DiscoverMovieCard'

// Watchlist screen: every movie the user has bookmarked. The bookmark
// icon on each card doubles as the "remove" action (toggling it off
// removes the movie from this list, persisted via localStorage).
export default function WatchlistView({ onSelectMovie }) {
  const { watchlistIds, libraryLoading } = useLibrary()
  const [moviesCatalog, setMoviesCatalog] = useState([])
  const [error, setError] = useState(null)
  useEffect(() => { Promise.all(watchlistIds.map((id) => fetchMovieById(id))).then(setMoviesCatalog).catch((e) => setError(e.message)) }, [watchlistIds])

  const movies = useMemo(() => moviesCatalog.filter((m) => watchlistIds.includes(m.id)), [moviesCatalog, watchlistIds])

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-secondary">Your library</p><h1 className="font-headline-xl-mobile sm:font-headline-xl text-white mb-2">Watchlist</h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
        {movies.length} {movies.length === 1 ? 'movie' : 'movies'} saved
      </p>
      {error && <p className="text-error py-4">Unable to load your watchlist movies: {error}</p>}
      {libraryLoading && <p className="text-on-surface-variant py-6">Loading your watchlist...</p>}

      {!libraryLoading && movies.length === 0 ? (
        <div className="cinema-panel flex flex-col items-center justify-center py-16 px-6 text-center"><span className="material-symbols-outlined text-5xl text-primary-container/70 mb-4">bookmark_add</span><h2 className="text-lg font-bold text-white mb-2">Your watchlist is waiting</h2><p className="max-w-sm text-sm leading-6 text-on-surface-variant">Save films that catch your eye and build a private queue for your next movie night.</p></div>
      ) : !libraryLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
          {movies.map((movie) => (
            <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
          ))}
        </div>
      )}
    </section>
  )
}
