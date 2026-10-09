
import { useEffect, useMemo, useState } from 'react'
import { GENRES } from '../data/movies'
import { fetchPopularMovies, fetchTrendingMovies } from '../services/api'
import DiscoverMovieCard from './DiscoverMovieCard'
import { useLibrary } from '../context/LibraryContext'

// Home screen: welcome + "Discover Movies" CTA, "Explore Genres" grid,
// and a trending rail. Uses the same design tokens/components as the
// rest of the app (no new colors, fonts, or card styles introduced).
export default function HomeView({ onNavigate, onSelectGenre, onSelectMovie }) {
  const [movies, setMovies] = useState([])
const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [popular, setPopular] = useState([])
  const { likedIds, watchlistIds } = useLibrary()

useEffect(() => {
  fetchTrendingMovies()
    .then((result) => setMovies(result.movies))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
  }, [])
  useEffect(() => { fetchPopularMovies().then((result) => setPopular(result.movies)).catch(() => {}) }, [])

const trending = [...movies]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 6)
  const recommended = useMemo(() => {
    const signals = new Set([...likedIds, ...watchlistIds])
    if (!signals.size) return popular.slice(0, 6)
    const likedGenres = new Set(movies.filter((movie) => signals.has(movie.id)).flatMap((movie) => movie.genres || []))
    return popular.filter((movie) => (movie.genres || []).some((genre) => likedGenres.has(genre))).slice(0, 6)
  }, [likedIds, watchlistIds, movies, popular])

  return (
    <section className="page-shell flex flex-col px-4 sm:px-8 lg:px-12 pt-5 pb-10">
      {/* Brand-first editorial hero inspired by the supplied reference. */}
      <div className="cinema-hero relative min-h-[31rem] sm:min-h-[38rem] overflow-hidden rounded-[1.75rem] mb-12 border border-white/[0.07] bg-[#0f1118] shadow-2xl animate-float-in">
        {trending[0] && <>
          <img src={trending[0].backdrop || trending[0].poster || '/movie-fallback.svg'} onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }} alt="" className="hero-backdrop absolute inset-y-0 right-0 h-full w-full object-cover object-center opacity-75 sm:left-[38%] sm:w-[62%] sm:object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1118] via-[#0f1118]/95 sm:via-[#0f1118]/80 to-[#0f1118]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1118] via-transparent to-transparent" />
        </>}
        <div className="relative z-10 flex min-h-[31rem] sm:min-h-[38rem] max-w-2xl flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <span className="mb-5 text-[10px] font-bold uppercase tracking-[.24em] text-secondary">Your next favorite movie</span>
          <h1 className="font-headline-xl-mobile sm:text-[4.75rem] sm:leading-[1.02] text-white mb-6 tracking-[-.045em]">Movies that<br /><span className="text-primary-container">match you.</span></h1>
          <p className="max-w-lg text-sm sm:text-base leading-7 text-on-surface-variant mb-8">Discover films based on your taste, mood, and the stories you can&apos;t stop thinking about.</p>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate('discover')} className="rounded-full bg-primary-container px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#f02a55] hover:-translate-y-0.5 active:scale-95">Discover Movies</button><button type="button" onClick={() => document.getElementById('genre-explorer')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.12] hover:-translate-y-0.5">Explore Genres</button></div>
          {trending[0] && <div className="mt-10 flex items-center gap-3 text-xs text-on-surface-variant"><span className="h-px w-8 bg-primary-container" /><span>Featured now</span><strong className="text-white">{trending[0].title}</strong><span>★ {trending[0].rating.toFixed(1)}</span></div>}
        </div>
      </div>

      {/* Explore Genres */}
      <div id="genre-explorer" className="order-2 my-10 scroll-mt-24">
        <div className="section-heading"><div><p className="mb-1 uppercase tracking-[.2em]">Browse by mood</p><h2>Explore genres</h2></div></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => onSelectGenre(genre)}
              className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-surface-container-low px-4 py-4 text-left text-sm font-semibold text-on-surface transition hover:-translate-y-1 hover:border-primary-container/50 hover:bg-surface-container-high active:scale-95"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex gap-4 overflow-hidden pb-4">{Array.from({ length: 6 }, (_, index) => <div key={index} className="skeleton h-64 w-40 flex-shrink-0 rounded-2xl" />)}</div>}
      {error && <div className="rounded-xl bg-error-container/20 p-4 text-error mb-4">Unable to load movies. {error}<button type="button" className="ml-2 underline" onClick={() => window.location.reload()}>Retry</button></div>}
      {!loading && !error && movies.length === 0 && <p className="text-on-surface-variant py-6">No movies are available yet.</p>}

      {/* Trending rail */}
      <div>
        <div className="section-heading"><div><p className="mb-1 uppercase tracking-[.2em]">Curated for you</p><h2>Trending Now</h2></div><button type="button" onClick={() => onNavigate('discover')} className="text-xs font-bold text-secondary">View all <span aria-hidden="true">→</span></button></div>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {trending.map((movie) => (
            <div key={movie.id} className="snap-start flex-shrink-0 w-40 sm:w-44">
              <DiscoverMovieCard movie={movie} onSelect={onSelectMovie} />
            </div>
          ))}
        </div>
      </div>
      <MovieRail title="Popular" eyebrow="Crowd favourites" movies={popular} onSelectMovie={onSelectMovie} onViewAll={() => onNavigate('discover')} />
      <MovieRail title="For you" eyebrow={likedIds.length || watchlistIds.length ? 'Picked from your taste' : 'Start exploring to personalise your picks'} movies={recommended} onSelectMovie={onSelectMovie} onViewAll={() => onNavigate('for-you')} />
    </section>
  )
}

function MovieRail({ title, eyebrow, movies, onSelectMovie, onViewAll }) {
  return <div className="mt-11"><div className="section-heading"><div><p className="mb-1 uppercase tracking-[.2em]">{eyebrow}</p><h2>{title}</h2></div><button type="button" onClick={onViewAll} className="text-xs font-bold text-secondary">View all <span aria-hidden="true">→</span></button></div><div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">{movies.slice(0, 8).map((movie) => <div key={movie.id} className="w-40 sm:w-44 flex-shrink-0"><DiscoverMovieCard movie={movie} onSelect={onSelectMovie} /></div>)}</div></div>
}
