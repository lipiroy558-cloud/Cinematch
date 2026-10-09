// Fixed bottom tab bar. Controlled by the parent (App): `activeTab` sets
// which item is highlighted and `onChange` is called with the tab id when
// the user taps one. `watchlistCount` drives the live badge on Watchlist.
const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'discover', label: 'Discover', icon: 'explore' },
  { id: 'for-you', label: 'For You', icon: 'auto_awesome' },
  { id: 'watchlist', label: 'Watchlist', icon: 'bookmark' },
  { id: 'profile', label: 'Profile', icon: 'person' },
]

export default function BottomNav({ activeTab, onChange, watchlistCount = 0 }) {
  return (
    <nav className="fixed md:hidden bottom-0 w-full z-50 pb-safe bg-[#0b0d12]/90 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,.3)] border-t border-white/[0.07]">
      <div className="page-shell h-[4.5rem] px-2 sm:px-8 flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          const badge = tab.id === 'watchlist' && watchlistCount > 0 ? watchlistCount : null

          return (
            <a
              key={tab.id}
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onChange(tab.id)
              }}
              className={`flex flex-col items-center justify-center w-14 h-14 transition-all gap-0.5 group relative ${
                isActive ? 'text-primary-container bg-primary-container/10 rounded-xl' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px] group-hover:scale-105 transition-transform"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {badge != null && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] bg-secondary text-on-secondary rounded-full font-label-caps text-[9px] flex items-center justify-center leading-none font-bold shadow-[0_0_8px_rgba(255,185,95,0.4)]">
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`font-label-caps text-[10px] tracking-wider uppercase ${
                  isActive ? 'font-semibold text-primary-container' : ''
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`w-1 h-1 rounded-full bg-primary-container shadow-[0_0_6px_rgba(225,29,72,0.9)] transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </a>
          )
        })}
      </div>
    </nav>
  )
}
