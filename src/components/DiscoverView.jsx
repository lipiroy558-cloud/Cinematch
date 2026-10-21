import { useCallback, useEffect, useMemo, useState } from 'react'
import { GENRES } from '../data/movies'
import { fetchDiscoverMovies } from '../services/api'
import DiscoverMovieCard from './DiscoverMovieCard'

const SORT_OPTIONS = [
  { id: 'popularity.desc', label: 'Most Popular' },
  { id: 'rating-desc', label: 'Top Rated' },
  { id: 'year-desc', label: 'Newest First' },
  { id: 'title-asc', label: 'Title A–Z' },
]

const RATING_OPTIONS = [
  { id: 0, label: 'Any Rating' },
  { id: 7, label: '7.0+ Rating' },
  { id: 8, label: '8.0+ Rating' },
  { id: 9, label: '9.0+ Rating' },
]

// Generate release year options from current year down to 1970
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i)

export default function DiscoverView({ initialGenre = 'All', onSelectMovie }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [genre, setGenre] = useState(initialGenre)
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('popularity.desc')
  const [year, setYear] = useState('all')

  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalResults: 0 })

  // Synchronize initialGenre prop if it changes (e.g. deep-link from Home)
  useEffect(() => {
    if (initialGenre && initialGenre !== genre) {
      setGenre(initialGenre)
    }
  }, [initialGenre])

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      debouncedQuery ||
      genre !== 'All' ||
      minRating > 0 ||
      year !== 'all' ||
      sort !== 'popularity.desc'
    )
  }, [debouncedQuery, genre, minRating, year, sort])

  // Reset all filters to baseline
  const resetFilters = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    setGenre('All')
    setMinRating(0)
    setYear('all')
    setSort('popularity.desc')
  }, [])

  // Primary data loader (page 1)
  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)
    setPage(1)

    fetchDiscoverMovies({
      page: 1,
      query: debouncedQuery,
      genre,
      minRating,
      year,
      sort,
    })
      .then((result) => {
        if (isCancelled) return
        const list = Array.isArray(result) ? result : result.movies || []
        setMovies(list)
        setPagination(
          result.pagination || { page: 1, totalPages: 1, totalResults: list.length }
        )
      })
      .catch((err) => {
        if (!isCancelled) setError(err.message)
      })
      .finally(() => {
        if (!isCancelled) setLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [debouncedQuery, genre, minRating, year, sort])

  // Pagination loader (page 2+)
  const loadMore = async () => {
    if (loadingMore || page >= pagination.totalPages) return
    const nextPage = page + 1
    setLoadingMore(true)

    try {
      const result = await fetchDiscoverMovies({
        page: nextPage,
        query: debouncedQuery,
        genre,
        minRating,
        year,
        sort,
      })
      const newMovies = Array.isArray(result) ? result : result.movies || []
      setMovies((current) => {
        const seen = new Set(current.map((m) => m.id))
        const unique = newMovies.filter((m) => !seen.has(m.id))
        return [...current, ...unique]
      })
      setPagination(
        result.pagination || { ...pagination, page: nextPage }
      )
      setPage(nextPage)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.24em] text-secondary">
            The catalogue
          </p>
          <h1 className="font-headline-xl-mobile sm:font-headline-xl text-white">
            Discover
          </h1>
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant mt-1">
            Explore cinema by mood, era, rating, or a title you already have in mind.
          </p>
        </div>

        {/* Active filter counter + Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-primary border border-outline-variant/30 hover:border-primary-container/40 font-label-caps text-label-caps tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="space-y-3 mb-6">
        {/* Title search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, directors, keywords..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-high text-on-surface placeholder:text-outline border border-outline-variant/30 focus:border-primary-container/60 focus:outline-none font-body-sm text-body-sm transition-all shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-bright transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] leading-none block">close</span>
            </button>
          )}
        </div>

        {/* Genre filter pills */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {['All', ...GENRES].map((g) => {
            const isActive = genre === g
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(isActive && g !== 'All' ? 'All' : g)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-caps text-label-caps transition-all active:scale-95 shadow-sm ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold ring-2 ring-primary-container/30'
                    : 'border border-outline-variant/30 bg-surface-container-high text-on-surface-variant hover:border-primary-container/40 hover:text-on-surface'
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>

        {/* Secondary Filters (Rating, Year, Sort) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2 rounded-2xl bg-surface-container/60 border border-outline-variant/20 shadow-sm">
          {/* Rating */}
          <div className="relative">
            <select
              aria-label="Minimum rating"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary-container/60 cursor-pointer appearance-none transition-all"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-surface-container">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              expand_more
            </span>
          </div>

          {/* Release Year */}
          <div className="relative">
            <select
              aria-label="Release year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary-container/60 cursor-pointer appearance-none transition-all"
            >
              <option value="all" className="bg-surface-container">Any Year</option>
              {YEAR_OPTIONS.map((val) => (
                <option key={val} value={val} className="bg-surface-container">
                  {val}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              expand_more
            </span>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              aria-label="Sort by"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-xl bg-surface-container-high text-on-surface font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:border-primary-container/60 cursor-pointer appearance-none transition-all"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-surface-container">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error mb-6 flex items-center justify-between">
          <p className="font-body-sm text-body-sm">Unable to load movies: {error}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Retry defaults
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-7">
          {Array.from({ length: 15 }, (_, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="skeleton aspect-[2/3] rounded-2xl w-full" />
              <div className="h-4 bg-surface-container-high rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-surface-container-high rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty Result State */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-surface-container/30 border border-outline-variant/20 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-outline text-[48px] mb-3 block">
            search_off
          </span>
          <h2 className="font-title-sm text-title-sm text-on-surface font-semibold mb-1">
            No films found
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
            {hasActiveFilters
              ? 'No movies matched your current combination of search, genre, rating, and year.'
              : 'The catalogue is currently updating. Please check back shortly.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-md"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Movie Grid */}
      {!loading && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-7">
            {movies.map((movie) => (
              <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
            ))}
          </div>

          {/* Load More Pagination */}
          {pagination.page < pagination.totalPages && (
            <div className="mt-10 text-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={loadMore}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 hover:border-primary-container/40 font-title-sm text-body-sm font-semibold transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore && (
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>
                  {loadingMore
                    ? 'Loading more films...'
                    : `Load more (${pagination.totalResults - movies.length > 0 ? `${pagination.totalResults - movies.length} more` : 'Next page'})`}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

