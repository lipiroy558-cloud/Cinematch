import { useEffect, useMemo, useState } from 'react'
import { genreAffinity as defaultGenreAffinity } from '../data/movies'
import { useLibrary } from '../context/LibraryContext'
import { fetchMoviesByIds } from '../services/api'

const PALETTE = [
  { barClass: 'bg-primary-container', dotClass: 'bg-white', activePillClass: 'bg-primary-container text-on-primary-container', pctTextClass: 'opacity-90' },
  { barClass: 'bg-secondary', dotClass: 'bg-secondary', pctTextClass: 'text-secondary' },
  { barClass: 'bg-tertiary-container', dotClass: 'bg-tertiary-container', pctTextClass: 'text-tertiary' },
  { barClass: 'bg-surface-tint', dotClass: 'bg-surface-tint', pctTextClass: 'text-on-surface-variant' },
  { barClass: 'bg-surface-bright', dotClass: 'bg-surface-bright', pctTextClass: 'text-on-surface-variant' },
]

export default function TasteDNA() {
  const { watchlistIds, likedIds, refreshLibrary } = useLibrary()
  const [selected, setSelected] = useState(new Set())
  const [recalibrating, setRecalibrating] = useState(false)
  const [calibratedGenres, setCalibratedGenres] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)

  const signalIds = useMemo(() => [...new Set([...watchlistIds, ...likedIds])], [watchlistIds, likedIds])

  useEffect(() => {
    if (signalIds.length === 0) {
      setCalibratedGenres(null)
      return
    }

    let isMounted = true
    fetchMoviesByIds(signalIds).then((movies) => {
      if (!isMounted) return
      const counts = {}
      movies.forEach((m) => {
        // Liked movies carry 2x affinity weight, watchlist movies carry 1x, scaled by rating
        const baseWeight = likedIds.includes(m.id) ? 2.0 : 1.0
        const ratingMultiplier = m.rating ? Math.min(Math.max(m.rating / 7.5, 0.8), 1.3) : 1.0
        const itemWeight = baseWeight * ratingMultiplier

        ;(m.genres || []).forEach((g) => {
          counts[g] = (counts[g] || 0) + itemWeight
        })
      })

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
      if (sorted.length === 0) {
        setCalibratedGenres(null)
        return
      }

      const totalWeight = sorted.reduce((sum, [, count]) => sum + count, 0) || 1
      let remainingPct = 100
      const list = sorted.map(([genre, count], idx) => {
        const isLast = idx === sorted.length - 1
        const pct = isLast ? Math.max(remainingPct, 5) : Math.max(Math.round((count / totalWeight) * 100), 5)
        remainingPct -= pct
        const theme = PALETTE[idx] || PALETTE[PALETTE.length - 1]
        return {
          id: genre.toLowerCase().replace(/\s+/g, '-'),
          label: genre,
          pct,
          count: Math.round(count * 10) / 10,
          ...theme,
        }
      })
      setCalibratedGenres(list)
    }).catch(() => {
      if (isMounted) setCalibratedGenres(null)
    })

    return () => { isMounted = false }
  }, [signalIds, likedIds])

  const affinity = calibratedGenres || defaultGenreAffinity
  const isPersonalized = Boolean(calibratedGenres && signalIds.length > 0)

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleRecalibrate = async () => {
    setRecalibrating(true)
    setStatusMessage(null)
    try {
      await refreshLibrary()
      setStatusMessage('Recalibrated!')
      setTimeout(() => setStatusMessage(null), 3000)
    } catch {
      setStatusMessage('Could not sync')
    } finally {
      setTimeout(() => setRecalibrating(false), 500)
    }
  }

  return (
    <section className="px-margin-mobile mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-secondary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
          <h2 className="font-title-sm text-title-sm text-on-surface font-bold">
            Taste DNA &amp; Top Genres
          </h2>
        </div>
        <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">
          {isPersonalized ? 'Personalized' : 'Calibrated'}
        </span>
      </div>

      <div className="w-full bg-surface-container rounded-2xl p-4 shadow-sm space-y-3">
        {/* Affinity Graph Bar */}
        <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface-container-highest">
          {affinity.map((g) => (
            <div
              key={g.id}
              className={`${g.barClass} h-full transition-all duration-500`}
              style={{ width: `${g.pct}%` }}
              title={`${g.label} ${g.pct}%`}
            />
          ))}
        </div>

        {/* Interactive Affinity Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {affinity.map((g, i) => {
            const isActive = selected.has(g.id)
            const isDefaultActive = i === 0 && selected.size === 0
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggle(g.id)}
                className={`genre-tag px-3 py-1.5 rounded-full font-label-caps text-label-caps flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                  isDefaultActive
                    ? g.activePillClass
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                } ${isActive ? 'ring-2 ring-primary-container' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${g.dotClass}`} />
                <span>{g.label}</span>
                <span className={`font-bold ${g.pctTextClass}`}>{g.pct}%</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {isPersonalized
              ? `Calculated across ${signalIds.length} saved & liked ${signalIds.length === 1 ? 'film' : 'films'}`
              : 'Default baseline • Like or save films to personalize'}
          </span>
          <button
            type="button"
            disabled={recalibrating}
            onClick={handleRecalibrate}
            className="text-primary font-title-sm text-body-sm flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            <span>{recalibrating ? 'Calibrating...' : statusMessage || 'Recalibrate'}</span>
            <span
              className={`material-symbols-outlined text-[16px] ${recalibrating ? 'animate-spin' : ''}`}
            >
              tune
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

