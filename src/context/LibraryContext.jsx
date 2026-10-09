import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'

const LibraryContext = createContext(null)
const TOKEN_KEY = 'cinematch:token'

export function LibraryProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [watchlistIds, setWatchlistIds] = useState([])
  const [likedIds, setLikedIds] = useState([])
  const [libraryLoading, setLibraryLoading] = useState(Boolean(token))
  const [libraryError, setLibraryError] = useState(null)

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null); setUser(null); setWatchlistIds([]); setLikedIds([])
  }, [])

  const refreshLibrary = useCallback(async () => {
    if (!token) return
    setLibraryLoading(true); setLibraryError(null)
    try {
      const [me, library] = await Promise.all([api.fetchMe(), api.fetchLibrary()])
      setUser(me); setWatchlistIds(library.watchlistIds || []); setLikedIds(library.likedIds || [])
    } catch (error) {
      setLibraryError(error.message)
      if (/authentication|token|user/i.test(error.message)) clearAuth()
    } finally { setLibraryLoading(false) }
  }, [token, clearAuth])

  useEffect(() => { refreshLibrary() }, [refreshLibrary])

  const authenticate = useCallback(async (operation, payload) => {
    const result = await operation(payload)
    localStorage.setItem(TOKEN_KEY, result.token); setToken(result.token); setUser(result.user)
    return result.user
  }, [])
  const logout = useCallback(() => clearAuth(), [clearAuth])

  const toggleWatchlist = useCallback(async (id) => {
    if (!token) throw new Error('Please log in to manage your watchlist')
    const ids = watchlistIds.includes(id) ? await api.removeFromWatchlist(id) : await api.addToWatchlist(id)
    setWatchlistIds(ids)
  }, [token, watchlistIds])
  const toggleLike = useCallback(async (id) => {
    if (!token) throw new Error('Please log in to like movies')
    const ids = likedIds.includes(id) ? await api.unlikeMovie(id) : await api.likeMovie(id)
    setLikedIds(ids)
  }, [token, likedIds])

  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(token), libraryLoading, libraryError, refreshLibrary, login: (payload) => authenticate(api.login, payload), register: (payload) => authenticate(api.register, payload), logout, watchlistIds, likedIds, toggleWatchlist, toggleLike, isWatchlisted: (id) => watchlistIds.includes(id), isLiked: (id) => likedIds.includes(id) }), [user, token, libraryLoading, libraryError, refreshLibrary, authenticate, logout, watchlistIds, likedIds, toggleWatchlist, toggleLike])
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within a <LibraryProvider>')
  return context
}
