import { useEffect } from 'react'
import { useLibrary } from '../context/LibraryContext'

export default function MovieModal({ movie, onClose }) {
  const { isLiked, isWatchlisted, toggleLike, toggleWatchlist } = useLibrary()

  useEffect(() => {
    const handleKey = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!movie) return null
  const liked = isLiked(movie.id)
  const watchlisted = isWatchlisted(movie.id)

  return <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-6 backdrop-blur-sm" onClick={onClose}>
    <article className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-[1.5rem] sm:rounded-[1.5rem] bg-[#151820] border border-white/10 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={movie.backdrop || movie.poster || '/movie-fallback.svg'} onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }} alt="" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151820] via-[#151820]/20 to-transparent" />
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-4 right-4 h-10 w-10 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-primary-container"><span className="material-symbols-outlined text-[20px]">close</span></button>
      </div>
      <div className="relative grid gap-6 px-5 pb-6 sm:grid-cols-[10rem_1fr] sm:px-8 sm:pb-8">
        <img src={movie.poster || '/movie-fallback.svg'} onError={(event) => { event.currentTarget.src = '/movie-fallback.svg' }} alt={movie.title} className="-mt-20 aspect-[2/3] w-32 rounded-xl object-cover shadow-2xl ring-1 ring-white/10 sm:-mt-28 sm:w-40" />
        <div className="pt-5 sm:pt-3">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-secondary">Movie details</p><h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{movie.title}</h2></div><span className="rounded-lg bg-secondary/10 px-3 py-2 text-sm font-bold text-secondary">★ {(movie.rating || 0).toFixed(1)}</span></div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant"><span>{movie.year || '—'}</span><span>•</span>{(movie.genres || []).map((genre) => <span key={genre} className="rounded-full border border-white/10 px-2 py-1">{genre}</span>)}</div>
          <p className="mt-5 text-sm leading-7 text-on-surface-variant">{movie.description || 'No overview is available for this movie yet.'}</p>
          <div className="mt-6 flex gap-3"><button type="button" onClick={() => toggleWatchlist(movie.id)} className="flex-1 rounded-xl bg-primary-container px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f02a55]"><span className="material-symbols-outlined align-middle mr-1 text-[18px]">{watchlisted ? 'bookmark' : 'bookmark_add'}</span>{watchlisted ? 'In watchlist' : 'Add to watchlist'}</button><button type="button" aria-label={liked ? 'Unlike' : 'Like'} onClick={() => toggleLike(movie.id)} className={`h-12 w-12 rounded-xl border transition ${liked ? 'border-primary-container bg-primary-container text-white' : 'border-white/10 bg-white/[0.05] text-on-surface-variant hover:text-white'}`}><span className="material-symbols-outlined">favorite</span></button></div>
        </div>
      </div>
    </article>
  </div>
}
