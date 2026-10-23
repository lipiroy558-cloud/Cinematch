import { useLibrary } from '../context/LibraryContext'

// Interactive poster card used across Discover, Watchlist & Diary, and Rails.
function formatAttribution(reason) {
  if (!reason) return null
  const cleaned = String(reason).trim()
  const match = cleaned.match(/^Because you (?:liked|saved) ["']?(.+?)["']?$/i)
  if (match) {
    return `Similar to ${match[1]}`
  }
  if (/^Based on your (?:interest|taste)/i.test(cleaned) || /^Recommended/i.test(cleaned)) {
    return 'Picked for your taste'
  }
  if (/^Trending/i.test(cleaned) || /^Popular/i.test(cleaned)) {
    return 'Popular this week'
  }
  return cleaned
}

export default function DiscoverMovieCard({ movie, onSelect }) {
  const { isLiked, isWatchlisted, isWatched, toggleLike, toggleWatchlist, toggleWatched } = useLibrary()
  const liked = isLiked(movie.id)
  const watchlisted = isWatchlisted(movie.id)
  const watched = isWatched(movie.id)
  const attribution = formatAttribution(movie.reason)

  return (
    <div className="movie-card flex flex-col group cursor-pointer" onClick={() => onSelect(movie)}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-high shadow-lg">
        <img
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          alt={movie.alt || movie.title}
          src={movie.poster || '/movie-fallback.svg'}
          loading="lazy"
          onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent opacity-95" />

        {/* Hover Play Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.8)] backdrop-blur-md scale-90 group-hover:scale-100 transition-transform border border-white/50">
            <span className="material-symbols-outlined text-[24px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </div>
        </div>

        {/* Rating and Watched badges */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
          <div className="px-2 py-0.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 shadow-sm">
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
          {watched && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white font-bold text-[9px] uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              Watched
            </span>
          )}
        </div>

        {/* Quick actions: watchlist + watched + like */}
        <div className="movie-card-actions absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            aria-label={watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            title={watchlisted ? 'In Watchlist' : 'Add to Watchlist'}
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
            aria-label={watched ? 'Remove from Watched Diary' : 'Mark as Watched'}
            title={watched ? 'Watched (Logged in Diary)' : 'Mark as Watched'}
            onClick={(e) => {
              e.stopPropagation()
              toggleWatched(movie.id)
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all active:scale-90 ${
              watched
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-surface-container-lowest/80 text-on-surface hover:text-emerald-400'
            }`}
          >
            <span
              className="material-symbols-outlined text-[15px]"
              style={watched ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              check_circle
            </span>
          </button>
          <button
            type="button"
            aria-label={liked ? 'Unlike' : 'Like'}
            title={liked ? 'Liked' : 'Like'}
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
      {attribution && (
        <p
          className="font-body-sm text-[11px] text-on-surface-variant/80 truncate flex items-center gap-1 mt-0.5"
          title={attribution}
        >
          <span className="text-[10px] text-primary/75 leading-none select-none font-medium">↗</span>
          <span className="truncate">{attribution}</span>
        </p>
      )}
    </div>
  )
}
