import { useEffect, useMemo, useState } from 'react'
import { GENRES } from '../data/movies'
import { fetchMovies, fetchMoviesByGenrePage, searchMovies, searchMoviesPage } from '../services/api'
import DiscoverMovieCard from './DiscoverMovieCard'

const SORT_OPTIONS = [
  { id: 'rating-desc', label: 'Top Rated' },
  { id: 'year-desc', label: 'Newest' },
  { id: 'title-asc', label: 'Title A–Z' },
]

const RATING_OPTIONS = [
  { id: 0, label: 'Any Rating' },
  { id: 7, label: '7.0+' },
  { id: 8, label: '8.0+' },
  { id: 9, label: '9.0+' },
]

// Discover screen: title search + genre filter + minimum-rating filter +
// sorting, over the full mock catalog. `initialGenre` lets Home's
// "Explore Genres" grid deep-link into a pre-filtered view.
export default function DiscoverView({ initialGenre = 'All', onSelectMovie }) {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState(initialGenre)
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('rating-desc')
  const [year, setYear] = useState('all')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  useEffect(() => {
    setLoading(true); setError(null); setPage(1)
    const load = query.trim() ? searchMoviesPage(query.trim(), 1, year) : genre !== 'All' ? fetchMoviesByGenrePage(genre, 1, year) : fetchMovies(1, year)
    load.then((result) => { const payload = Array.isArray(result) ? { movies: result } : result; setMovies(payload.movies || result); setPagination(payload.pagination || { page: 1, totalPages: 1 }) }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [query, genre, year])
  const loadMore = () => {
    const nextPage = page + 1
    const load = query.trim() ? searchMoviesPage(query.trim(), nextPage, year) : genre !== 'All' ? fetchMoviesByGenrePage(genre, nextPage, year) : fetchMovies(nextPage, year)
    load.then((payload) => { setMovies((current) => [...current, ...(payload.movies || [])]); setPagination(payload.pagination || pagination); setPage(nextPage) }).catch((e) => setError(e.message))
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = movies.filter((m) => {
      const matchesQuery = !q || m.title.toLowerCase().includes(q)
      const matchesGenre = genre === 'All' || m.genres.includes(genre)
      const matchesRating = m.rating >= minRating
       const releaseYear = m.year ?? m.releaseYear ?? (m.releaseDate || m.release_date || '').slice(0, 4)
       const matchesYear = year === 'all' || String(releaseYear) === String(year)
      return matchesQuery && matchesGenre && matchesRating && matchesYear
    })

    switch (sort) {
      case 'year-desc':
        list = [...list].sort((a, b) => b.year - a.year)
        break
      case 'title-asc':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating-desc':
      default:
        list = [...list].sort((a, b) => b.rating - a.rating)
    }
    return list
  }, [movies, query, genre, minRating, year, sort])

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      <div className="mb-7"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-secondary">The catalogue</p><h1 className="font-headline-xl-mobile sm:font-headline-xl text-white mb-2">Discover</h1><p className="max-w-xl text-sm leading-6 text-on-surface-variant">Find your next favourite film by mood, era, rating, or a title you already have in mind.</p></div>
      {loading && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{Array.from({ length: 10 }, (_, index) => <div key={index} className="skeleton aspect-[2/3] rounded-2xl" />)}</div>}
      {error && <p className="text-error py-6">Unable to load movies. {error}</p>}

      {/* Title search */}
      <div className="cinema-panel relative mb-4 p-2">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="w-full h-12 pl-11 pr-4 rounded-lg bg-transparent text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none transition-all"
        />
      </div>

      {/* Genre filter pills */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-3 no-scrollbar">
        {['All', ...GENRES].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenre(g)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-label-caps text-label-caps transition-all active:scale-95 ${
              genre === g
                ? 'bg-primary-container text-on-primary-container'
                : 'border border-white/10 bg-surface-container-low text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Rating + Sort */}
      <div className="cinema-panel grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 p-2">
        <select
          aria-label="Minimum rating"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-white/10 focus:outline-none focus:border-primary-container"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <select aria-label="Release year" value={year} onChange={(e) => setYear(e.target.value)} className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-white/10 focus:outline-none focus:border-primary-container"><option value="all">Any year</option>{Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select
          aria-label="Sort by"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-white/10 focus:outline-none focus:border-primary-container"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {!loading && results.length === 0 ? (
        <p className="text-on-surface-variant font-body-md text-body-md text-center py-10">
          No movies match your filters. Try adjusting search, genre, or rating.
        </p>
      ) : !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
          {results.map((movie) => (
            <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
          ))}
        </div>
      )}
      {!loading && pagination.page < pagination.totalPages && <button type="button" onClick={loadMore} className="mt-6 w-full rounded-xl bg-surface-container-high py-3 text-on-surface">Load more movies</button>}
    </section>
  )
}
