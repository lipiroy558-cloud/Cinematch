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
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [profileMovies, setProfileMovies] = useState([])
  const { watchlistIds } = useLibrary()
  useEffect(() => { fetchMovies().then((result) => setProfileMovies(result.movies.slice(0, 6))).catch(() => {}) }, [])

  // "Explore Genres" (Home) and genre chips both funnel into Discover
  // pre-filtered by the chosen genre.
  const goToDiscoverWithGenre = (genre) => {
    setDiscoverGenre(genre)
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
            onSelectMovie={setSelectedMovie}
          />
        )}

        {view === 'discover' && (
          <DiscoverView initialGenre={discoverGenre} onSelectMovie={setSelectedMovie} />
        )}

        {view === 'for-you' && <ForYouView onSelectMovie={setSelectedMovie} />}

        {view === 'watchlist' && <WatchlistView onSelectMovie={setSelectedMovie} />}

        {view === 'profile' && (
            <div className="page-shell flex flex-col w-full pb-10">
            <ProfileHeader />
            <QuickStats watchlistCount={watchlistIds.length} />
            <TasteDNA />
            <MovieSection
              icon="history_toggle_off"
              title="Recently Watched & Rated"
              linkLabel="All (88)"
               movies={profileMovies}
            />
            <AIPreferences />
            <AccountSettings />
            <Footer />
          </div>
        )}
      </main>

      <BottomNav activeTab={view} onChange={setView} watchlistCount={watchlistIds.length} />

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
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
