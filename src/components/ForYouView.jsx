import { useEffect, useMemo, useState } from 'react'
import { fetchMovies } from '../services/api'
import { useLibrary } from '../context/LibraryContext'
import DiscoverMovieCard from './DiscoverMovieCard'

// Simple rule-based recommendation engine (no AI/API):
// 1. Tally genre counts across the user's liked + watchlisted movies.
// 2. Score every other movie by how many of its genres match that tally.
// 3. Sort by match score, then by public rating, and return the top matches.
function buildRecommendations(movies, likedIds, watchlistIds) {
  const consideredIds = new Set([...likedIds, ...watchlistIds])
  if (consideredIds.size === 0) return { recommendations: [], topGenres: [] }

  const genreScores = {}
  movies.forEach((m) => {
    if (consideredIds.has(m.id)) {
      m.genres.forEach((g) => {
        genreScores[g] = (genreScores[g] || 0) + 1
      })
    }
  })

  const topGenres = Object.entries(genreScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g)

  const recommendations = movies.filter((m) => !consideredIds.has(m.id))
    .map((m) => {
      const matchScore = m.genres.reduce((sum, g) => sum + (genreScores[g] || 0), 0)
      return { movie: m, matchScore }
    })
    .filter((x) => x.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || b.movie.rating - a.movie.rating)
    .map((x) => x.movie)

  return { recommendations, topGenres }
}

export default function ForYouView({ onSelectMovie }) {
  const { likedIds, watchlistIds } = useLibrary()
  const [movies, setMovies] = useState([])
  const [error, setError] = useState(null)
  useEffect(() => { fetchMovies().then((result) => setMovies(result.movies)).catch((e) => setError(e.message)) }, [])

  const { recommendations, topGenres } = useMemo(
    () => buildRecommendations(movies, likedIds, watchlistIds),
    [movies, likedIds, watchlistIds]
  )

  const fallback = useMemo(() => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 6), [movies])

  const hasSignal = likedIds.length > 0 || watchlistIds.length > 0

  return (
    <section className="page-shell px-4 sm:px-8 lg:px-12 pt-7 pb-10">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-primary-container">Personalised picks</p><h1 className="font-headline-xl-mobile sm:font-headline-xl text-white mb-2">For you</h1>
      {error && <p className="text-error py-4">Unable to load recommendations: {error}</p>}

      {hasSignal ? (
        <>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            {recommendations.length > 0
              ? `Based on your taste for ${topGenres.join(', ')}`
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
            {fallback.map((movie) => (
              <DiscoverMovieCard key={movie.id} movie={movie} onSelect={onSelectMovie} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
