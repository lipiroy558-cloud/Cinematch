import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import HomeView from './components/HomeView'
import DiscoverView from './components/DiscoverView'
import ForYouView from './components/ForYouView'
import WatchlistView from './components/WatchlistView'
import MovieModal from './components/MovieModal'
import ProfileHeader from './components/ProfileHeader'
import QuickStats from './components/QuickStats'
import TasteDNA from './components/TasteDNA'
import MovieSection from './components/MovieSection'
import AIPreferences from './components/AIPreferences'
import AccountSettings from './components/AccountSettings'
import Footer from './components/Footer'
import { LibraryProvider, useLibrary } from './context/LibraryContext'
import { fetchMovies } from './services/api'
import './App.css'

// Renders the currently-active bottom-nav view. Kept as a small lookup
// instead of a router, since only one screen is ever visible at a time
// and no extra routing dependency is needed for that.
function AppContent() {
  const [view, setView] = useState('home')
  const [discoverGenre, setDiscoverGenre] = useState('All')
  const [discoverIndustry, setDiscoverIndustry] = useState('all')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [profileMovies, setProfileMovies] = useState([])
  const { watchlistIds, likedIds, authPrompt, dismissAuthPrompt } = useLibrary()
  useEffect(() => { fetchMovies().then((result) => setProfileMovies(result.movies.slice(0, 6))).catch(() => {}) }, [])

  // Deep-link helpers into Discover with pre-filtered genre or cinema industry
  const goToDiscoverWithGenre = (genre) => {
    setDiscoverGenre(genre)
    setDiscoverIndustry('all')
    setView('discover')
  }

  const goToDiscoverWithIndustry = (industry) => {
    setDiscoverIndustry(industry)
    setDiscoverGenre('All')
    setView('discover')
  }

  return (
    <>
      <Navbar activeView={view} onNavigate={setView} onProfileClick={() => setView('profile')} onSelectMovie={setSelectedMovie} />

      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        {view === 'home' && (
          <HomeView
            onNavigate={setView}
            onSelectGenre={goToDiscoverWithGenre}
            onSelectIndustry={goToDiscoverWithIndustry}
            onSelectMovie={setSelectedMovie}
          />
        )}

        {view === 'discover' && (
          <DiscoverView
            initialGenre={discoverGenre}
            initialIndustry={discoverIndustry}
            onSelectMovie={setSelectedMovie}
          />
        )}

        {view === 'for-you' && <ForYouView onSelectMovie={setSelectedMovie} />}

        {view === 'watchlist' && <WatchlistView onSelectMovie={setSelectedMovie} onNavigate={setView} />}

        {view === 'profile' && (
            <div className="page-shell flex flex-col w-full pb-10">
            <ProfileHeader />
            <QuickStats watchlistCount={watchlistIds.length} likedCount={likedIds.length} />
            <TasteDNA />
            <MovieSection
              icon="history_toggle_off"
              title="Recently Watched & Rated"
              linkLabel="All (88)"
               movies={profileMovies}
               onSelectMovie={setSelectedMovie}
            />

            <AIPreferences />
            <AccountSettings />
            <Footer />
          </div>
        )}
      </main>

      <BottomNav activeTab={view} onChange={setView} watchlistCount={watchlistIds.length} />

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      {authPrompt && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-[70] max-w-sm flex items-center gap-3 p-4 rounded-2xl bg-[#1e2029]/95 text-white border border-white/10 shadow-2xl backdrop-blur-xl animate-float-in"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant font-medium leading-snug">{authPrompt}</p>
            <button
              type="button"
              onClick={() => {
                dismissAuthPrompt()
                setSelectedMovie(null)
                setView('profile')
              }}
              className="mt-1 text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>Sign In / Create Account</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={dismissAuthPrompt}
            className="p-1 rounded-lg text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </aside>
      )}
    </>
  )
}

function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  )
}

export default App
