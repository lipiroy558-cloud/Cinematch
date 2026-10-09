import { profile } from '../data/profile'

// Avatar + member badge + name/handle + bio + action buttons.
// Ambient glow blobs are preserved from the Stitch design.
export default function ProfileHeader() {
  return (
    <section className="relative px-4 sm:px-8 lg:px-12 pt-8 pb-8 flex flex-col items-center text-center overflow-hidden">
      {/* Atmospheric Ambient Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-container/20 rounded-full blur-[72px] pointer-events-none" />
      <div className="absolute top-20 right-4 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Avatar & Edit Badge */}
      <div className="relative mb-3 group cursor-pointer">
        <div className="w-28 h-28 rounded-full overflow-hidden shadow-[0_12px_38px_rgba(0,0,0,0.6)] p-1 bg-gradient-to-br from-primary-container to-secondary">
          <img
            alt={`${profile.name} Avatar`}
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
            src={profile.avatar}
          />
        </div>
        <button
          aria-label="Edit Profile Picture"
          type="button"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[17px]">photo_camera</span>
        </button>
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
        {profile.name}
      </h1>
      <span className="font-label-md text-label-md text-primary tracking-wide mb-2.5">
        {profile.handle}
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
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span>Edit Taste Bio</span>
        </button>
        <button
          aria-label="Share Taste Card"
          type="button"
          className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center active:scale-95 transition-transform hover:bg-surface-bright"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
        </button>
      </div>
    </section>
  )
}
