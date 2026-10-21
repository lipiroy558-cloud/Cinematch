import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMovies, fetchPersonalizedRecommendations } from '../services/api'
import { useLibrary } from '../context/LibraryContext'
import DiscoverMovieCard from './DiscoverMovieCard'

// Rule-based fallback if offline or backend is unreachable
function buildClientFallback(movies, likedIds, watchlistIds) {
  const consideredIds = new Set([...likedIds, ...watchlistIds])
  if (consideredIds.size === 0) return { recommendations: [], topGenres: [] }

  const genreScores = {}
  movies.forEach((m) => {
    if (consideredIds.has(m.id)) {
      m.genres?.forEach((g) => {
        genreScores[g] = (genreScores[g] || 0) + 1
      })
    }
  })

  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g)

  const recommendations = movies
    .filter((m) => !consideredIds.has(m.id))
    .map((m) => {
      const matchScore = (m.genres || []).reduce((sum, g) => sum + (genreScores[g] || 0), 0)
      return {
        ...m,
        matchScore,
        reason: 'Picked for your taste',
      }
    })
    .filter((x) => x.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating)

  return { recommendations, topGenres }
}

export default function ForYouView({ onSelectMovie }) {
  const { likedIds, watchlistIds, refreshLibrary } = useLibrary()
  const [recommendations, setRecommendations] = useState([])
  const [topGenres, setTopGenres] = useState([])
  const [fallbackMovies, setFallbackMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const hasSignal = likedIds.length > 0 || watchlistIds.length > 0

  const loadRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPersonalizedRecommendations({
        liked: likedIds,
        watchlist: watchlistIds,
      })
      if (result && Array.isArray(result.recommendations)) {
        setRecommendations(result.recommendations)
        setTopGenres(result.topGenres || [])
      } else {
        throw new Error('Invalid recommendation payload')
      }
    } catch (err) {
      console.warn('API recommendation fetch failed; using catalog fallback:', err.message)
      try {
        const catalog = await fetchMovies()
        const movies = catalog.movies || []
        setFallbackMovies(movies)
        const local = buildClientFallback(movies, likedIds, watchlistIds)
        setRecommendations(local.recommendations)
        setTopGenres(local.topGenres)
      } catch (innerErr) {
        setError(innerErr.message)
      }
    } finally {
      setLoading(false)
    }
  }, [likedIds, watchlistIds])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const handleRecalibrate = async () => {
    if (loading) return
    try {
      await refreshLibrary()
    } catch {
      // ignore library refresh error; still reload recommendations
    }
    await loadRecommendations()
  }

  const coldStartList = useMemo(() => {
    if (recommendations.length > 0) return recommendations
    return [...fallbackMovies].sort((a, b) => b.rating - a.rating).slice(0, 10)
  }, [recommendations, fallbackMovies])

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[.24em] text-primary-container">
          Personalised picks
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={handleRecalibrate}
          className="text-primary font-title-sm text-body-sm flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          <span>{loading ? 'Recalibrating...' : 'Recalibrate'}</span>
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
            tune
          </span>
        </button>
      </div>

      <h1 className="font-headline-xl-mobile sm:font-headline-xl text-white mb-2">For you</h1>
      {error && <p className="text-error py-4">Unable to load recommendations: {error}</p>}

      {hasSignal ? (
        <>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            {recommendations.length > 0
              ? topGenres.length > 0
                ? `Based on your taste for ${topGenres.join(', ')}`
                : 'Curated based on your liked and watchlisted films'
              : "You've liked or saved everything that matches your taste so far — check back after adding more!"}
          </p>
          {recommendations.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
              {recommendations.map((movie) => (
                <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Like or add a few movies to your watchlist and we&apos;ll start recommending titles based
            on your taste. In the meantime, here&apos;s what&apos;s popular:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {coldStartList.map((movie) => (
              <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

