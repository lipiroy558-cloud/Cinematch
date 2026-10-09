import MovieCard from './MovieCard'

// A titled, horizontally snap-scrolling rail of MovieCards.
// Used for "Recently Watched & Rated"; reusable for future rails
// (e.g. "Because You Watched...", "Trending Now").
export default function MovieSection({ icon, title, linkLabel, movies }) {
  return (
    <section className="mb-6">
      <div className="px-margin-mobile flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-primary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <h2 className="font-title-sm text-title-sm text-on-surface font-bold">{title}</h2>
        </div>
        {linkLabel && (
          <a
            href="#"
            className="font-label-caps text-label-caps text-primary uppercase tracking-wider hover:underline"
          >
            {linkLabel}
          </a>
        )}
      </div>

      <div className="flex overflow-x-auto gap-3 px-margin-mobile pb-2 snap-x snap-mandatory scroll-smooth no-scrollbar">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}
