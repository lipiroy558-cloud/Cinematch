import { profile } from '../data/profile'

// 4-column quick-stats bar (Watched / Rated / Watchlist / AI Match).
// The "Watchlist" figure reflects the user's real, persisted watchlist
// count when provided; every other stat stays mock data for now.
export default function QuickStats({ watchlistCount }) {
  return (
    <section className="px-4 sm:px-8 lg:px-12 mb-8">
      <div className="cinema-panel grid grid-cols-4 gap-2 p-4">
        {profile.stats.map((stat) => {
          const value =
            stat.label === 'Watchlist' && typeof watchlistCount === 'number'
              ? String(watchlistCount)
              : stat.value
          return (
            <div key={stat.label} className="flex flex-col items-center text-center py-1">
              <span className={`font-headline-md text-headline-md font-bold ${stat.valueClass}`}>
                {value}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase mt-0.5">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
