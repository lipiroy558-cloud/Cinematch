import { useLibrary } from '../context/LibraryContext'

// Interactive poster card used everywhere EXCEPT the Profile screen's
// "Recently Watched" rail (which keeps using the original MovieCard so
// that screen stays pixel-identical to the Stitch design).
//
// Adds quick-action like/watchlist buttons and opens the detail modal
// on click, while keeping the same visual language (rounded-xl poster,
// gradient overlay, glass rating pill) as the rest of the Stitch UI.
export default function DiscoverMovieCard({ movie, onSelect }) {
  const { isLiked, isWatchlisted, toggleLike, toggleWatchlist } = useLibrary()
  const liked = isLiked(movie.id)
  const watchlisted = isWatchlisted(movie.id)

  return (
    <div className="movie-card flex flex-col group cursor-pointer" onClick={() => onSelect(movie)}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-high shadow-lg">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={movie.alt || movie.title}
          src={movie.poster || '/movie-fallback.svg'}
          onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent opacity-95" />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 shadow-sm">
          <span
            className="material-symbols-outlined text-[14px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-title-sm text-label-caps text-secondary font-bold">
            {(movie.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Quick actions: watchlist + like */}
        <div className="movie-card-actions absolute top-2 left-2 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            onClick={(e) => {
              e.stopPropagation()
              toggleWatchlist(movie.id)
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all active:scale-90 ${
              watchlisted
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-lowest/80 text-on-surface hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[15px]"
              style={watchlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              bookmark
            </span>
          </button>
          <button
            type="button"
            aria-label={liked ? 'Unlike' : 'Like'}
            onClick={(e) => {
              e.stopPropagation()
              toggleLike(movie.id)
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all active:scale-90 ${
              liked
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-surface-container-lowest/80 text-on-surface hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[15px]"
              style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-title-sm text-body-sm text-on-surface font-semibold truncate leading-tight">
            {movie.title}
          </h3>
          <span className="font-label-caps text-[9px] uppercase tracking-wider text-on-surface-variant">
            {movie.year}
          </span>
        </div>
      </div>
      <p className="font-body-sm text-[11px] text-on-surface-variant truncate mt-1.5">
        {(movie.genres || []).join(' • ')}
      </p>
    </div>
  )
}
