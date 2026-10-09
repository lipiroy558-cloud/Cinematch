import { useState } from 'react'
import { genreAffinity } from '../data/movies'

// "Taste DNA & Top Genres": stacked affinity bar + clickable genre pills.
// Clicking a pill toggles a tactile ring highlight, replicating the
// vanilla-JS micro-interaction from the Stitch HTML (#genrePillContainer).
export default function TasteDNA() {
  const [selected, setSelected] = useState(new Set())

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
          Calibrated
        </span>
      </div>

      <div className="w-full bg-surface-container rounded-2xl p-4 shadow-sm space-y-3">
        {/* Affinity Graph Bar */}
        <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface-container-highest">
          {genreAffinity.map((g) => (
            <div
              key={g.id}
              className={`${g.barClass} h-full transition-all`}
              style={{ width: `${g.pct}%` }}
              title={`${g.label} ${g.pct}%`}
            />
          ))}
        </div>

        {/* Interactive Affinity Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {genreAffinity.map((g, i) => {
            const isActive = selected.has(g.id)
            const isDefaultActive = i === 0
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
            Calculated across 88 movie reviews &amp; watch habits
          </span>
          <button
            type="button"
            className="text-primary font-title-sm text-body-sm flex items-center gap-0.5 hover:underline"
          >
            Recalibrate
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </button>
        </div>
      </div>
    </section>
  )
}
