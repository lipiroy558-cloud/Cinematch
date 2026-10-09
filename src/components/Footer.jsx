// App version / build identifier shown at the bottom of the Profile screen.
export default function Footer() {
  return (
    <div className="px-margin-mobile text-center mt-6">
      <span className="font-label-caps text-label-caps text-outline tracking-wider uppercase block">
        CineMatch Mobile Engine v3.12.4 • Build 804
      </span>
      <span className="font-body-sm text-[11px] text-on-surface-variant/60 mt-1 block">
        Crafted for Film Purists
      </span>
      <span className="font-body-sm text-[10px] text-on-surface-variant/50 mt-2 block">
        Movie data and images supplied by{' '}
        <a className="underline hover:text-on-surface-variant" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </span>
    </div>
  )
}
