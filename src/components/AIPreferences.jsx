// "AI Taste Preferences & Fine-Tuning" card: pacing, synced streamers,
// and excluded-content filters. Each row has a small action button.
export default function AIPreferences() {
  return (
    <section className="px-margin-mobile mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="material-symbols-outlined text-primary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
          <h2 className="font-title-sm text-title-sm text-on-surface font-bold">
            AI Taste Preferences &amp; Fine-Tuning
          </h2>
        </div>
        <button
          aria-label="Fine tuning info"
          type="button"
          className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">info</span>
        </button>
      </div>

      <div className="bg-surface-container rounded-2xl p-4 shadow-sm space-y-4">
        {/* Pacing Setting */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">speed</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-semibold block leading-tight">
                Pacing Preference
              </span>
              <span className="font-body-sm text-body-sm text-primary font-medium block mt-0.5">
                Slow burn / atmospheric
              </span>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Prioritizes deep worldbuilding, silence, and subtle tension buildup.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-[10px] uppercase font-bold tracking-wider active:scale-95 transition-all flex-shrink-0"
          >
            Change
          </button>
        </div>

        {/* Sync Streamers */}
        <div className="flex items-start justify-between gap-3 pt-3 bg-surface-container-low/50 -mx-4 px-4 py-3 rounded-xl">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">tv</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-semibold block leading-tight">
                Sync Streamers
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {['Max', 'Apple TV+', 'Mubi'].map((streamer) => (
                  <span
                    key={streamer}
                    className="px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-label-caps text-[10px] font-bold"
                  >
                    {streamer}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-[10px] uppercase font-bold tracking-wider active:scale-95 transition-all flex-shrink-0"
          >
            Manage
          </button>
        </div>

        {/* Excluded Content */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high text-error flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">block</span>
            </div>
            <div className="min-w-0">
              <span className="font-title-sm text-body-md text-on-surface font-semibold block leading-tight">
                Excluded Content
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                Gore / Slasher / Jump Scares
              </span>
              <span className="font-body-sm text-[11px] text-outline block mt-0.5">
                Recommendations hide graphic violence.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-[10px] uppercase font-bold tracking-wider active:scale-95 transition-all flex-shrink-0"
          >
            Edit
          </button>
        </div>
      </div>
    </section>
  )
}
