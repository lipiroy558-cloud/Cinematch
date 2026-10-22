import { profile } from '../data/profile'
import { useLibrary } from '../context/LibraryContext'

// Avatar + website member badge + name/handle + bio + action buttons.
// Ambient glow blobs are preserved from the Stitch design.
export default function ProfileHeader() {
  const { user, isAuthenticated } = useLibrary()
  const displayName = isAuthenticated && user?.name ? user.name : profile.name
  const displayHandle = isAuthenticated && user?.email ? `@${user.email.split('@')[0]}` : profile.handle

  return (
    <section className="relative px-4 sm:px-8 lg:px-12 pt-8 pb-8 flex flex-col items-center text-center overflow-hidden">
      {/* Atmospheric Ambient Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-container/20 rounded-full blur-[72px] pointer-events-none" />
      <div className="absolute top-20 right-4 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Avatar & Website Badge */}
      <div className="relative mb-3 group">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-[0_12px_38px_rgba(0,0,0,0.6)] p-1 bg-gradient-to-br from-primary-container via-rose-600 to-amber-500">
          <div className="w-full h-full rounded-full bg-surface-container-high flex flex-col items-center justify-center text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {user?.avatar ? (
              <img
                alt={`${displayName} Avatar`}
                className="w-full h-full object-cover"
                src={user.avatar}
              />
            ) : user?.name ? (
              <div className="flex flex-col items-center justify-center select-none">
                <span className="text-4xl font-black text-white tracking-wider">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-[10px] font-bold text-primary-container tracking-widest uppercase mt-0.5">
                  CINEMATCH
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center select-none">
                <span className="material-symbols-outlined text-4xl text-primary-container">
                  movie
                </span>
                <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase mt-1">
                  CINEMATCH
                </span>
              </div>
            )}
          </div>
        </div>
        <div
          title="Verified CineMatch Member Badge"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shadow-lg ring-2 ring-surface"
        >
          <span className="material-symbols-outlined text-[17px]">verified</span>
        </div>
      </div>

      {/* Member Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary text-label-caps font-label-caps uppercase tracking-wider mb-2.5 shadow-sm">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          stars
        </span>
        <span>{profile.memberSince}</span>
      </div>

      {/* Name & Handle */}
      <h1 className="font-headline-lg text-[26px] text-white font-bold tracking-tight mb-0.5">
        {displayName}
      </h1>
      <span className="font-label-md text-label-md text-primary tracking-wide mb-2.5">
        {displayHandle}
      </span>

      {/* Bio */}
      <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
        {profile.bio}
      </p>

      {/* Header Actions */}
      <div className="flex items-center gap-space-sm mt-4">
        <button
          type="button"
          className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container font-title-sm text-body-sm shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_26px_rgba(225,29,72,0.5)] transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">local_activity</span>
          <span>CineMatch VIP</span>
        </button>
        <button
          aria-label="Share Profile"
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'CineMatch Profile', url: window.location.href }).catch(() => {})
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href)
              alert('Profile link copied to clipboard!')
            }
          }}
          className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center active:scale-95 transition-transform hover:bg-surface-bright"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
        </button>
      </div>
    </section>
  )
}
