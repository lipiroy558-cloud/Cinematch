// Reusable 2:3 poster card used in the "Recently Watched & Rated" rail
// (and any future movie rail). Matches the Stitch card markup exactly.
export default function MovieCard({ movie, onSelect }) {
  const ratingValue = movie.rating != null ? Number(movie.rating).toFixed(1) : '—'
  const tagText = movie.tag || (movie.genres && movie.genres[0]) || (movie.year ? String(movie.year) : '')
  const tagColor = movie.tagColor || 'text-primary'
  const subtitle = movie.quote || (movie.genres && movie.genres.slice(0, 2).join(' • ')) || (movie.year ? String(movie.year) : '')

  return (
    <div
      className="snap-start flex-shrink-0 w-36 flex flex-col group cursor-pointer"
      onClick={() => onSelect?.(movie)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-high shadow-md">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          alt={movie.alt || movie.title}
          src={movie.poster || '/movie-fallback.svg'}
          onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90" />

        {/* Hover Play Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-md scale-90 group-hover:scale-100 transition-transform">
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 shadow-sm">
          <span
            className="material-symbols-outlined text-[14px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-title-sm text-label-caps text-secondary font-bold">
            {ratingValue}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          {tagText && (
            <span className={`font-label-caps text-[9px] uppercase tracking-wider font-bold ${tagColor}`}>
              {tagText}
            </span>
          )}
          <h3 className="font-title-sm text-body-sm text-on-surface font-semibold truncate leading-tight">
            {movie.title}
          </h3>
        </div>
      </div>
      {subtitle && (
        <p className="font-body-sm text-[11px] text-on-surface-variant truncate mt-1.5">
          {subtitle}
        </p>
      )}
    </div>
  )
}

