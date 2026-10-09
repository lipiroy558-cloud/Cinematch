// Reusable 2:3 poster card used in the "Recently Watched & Rated" rail
// (and any future movie rail). Matches the Stitch card markup exactly.
export default function MovieCard({ movie }) {
  return (
    <div className="snap-start flex-shrink-0 w-36 flex flex-col group cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-container-high shadow-md">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          alt={movie.alt || movie.title}
          src={movie.poster}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90" />

        {/* Personal Rating Badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 shadow-sm">
          <span
            className="material-symbols-outlined text-[14px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-title-sm text-label-caps text-secondary font-bold">
            {movie.rating}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2">
          <span className={`font-label-caps text-[9px] uppercase tracking-wider font-bold ${movie.tagColor}`}>
            {movie.tag}
          </span>
          <h3 className="font-title-sm text-body-sm text-on-surface font-semibold truncate leading-tight">
            {movie.title}
          </h3>
        </div>
      </div>
      <p className="font-body-sm text-[11px] text-on-surface-variant truncate mt-1.5">
        {movie.quote}
      </p>
    </div>
  )
}
