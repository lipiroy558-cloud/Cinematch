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
  const [authPrompt, setAuthPrompt] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

  const openAuth = useCallback((mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }, [])

  const closeAuth = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setWatchlistIds([])
    setLikedIds([])
  }, [])

  const triggerAuthPrompt = useCallback((message = 'Please log in to manage your library') => {
    setAuthPrompt(message)
    openAuth('login')
  }, [openAuth])

  const dismissAuthPrompt = useCallback(() => {
    setAuthPrompt(null)
  }, [])

  useEffect(() => {
    if (!authPrompt) return undefined
    const timer = setTimeout(() => setAuthPrompt(null), 6000)
    return () => clearTimeout(timer)
  }, [authPrompt])

  const refreshLibrary = useCallback(async () => {
    if (!token) return
    setLibraryLoading(true)
    setLibraryError(null)
    try {
      const [me, library] = await Promise.all([api.fetchMe(), api.fetchLibrary()])
      setUser(me)
      setWatchlistIds(library.watchlistIds || [])
      setLikedIds(library.likedIds || [])
    } catch (error) {
      setLibraryError(error.message)
      if (/authentication|token|user/i.test(error.message)) clearAuth()
    } finally {
      setLibraryLoading(false)
    }
  }, [token, clearAuth])

  useEffect(() => {
    refreshLibrary()
  }, [refreshLibrary])

  const authenticate = useCallback(async (operation, payload) => {
    const result = await operation(payload)
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(() => clearAuth(), [clearAuth])

  const toggleWatchlist = useCallback(
    async (id) => {
      if (!token) {
        triggerAuthPrompt('Sign in to add movies to your watchlist')
        return false
      }
      const ids = watchlistIds.includes(id)
        ? await api.removeFromWatchlist(id)
        : await api.addToWatchlist(id)
      setWatchlistIds(ids)
      return true
    },
    [token, watchlistIds, triggerAuthPrompt]
  )

  const toggleLike = useCallback(
    async (id) => {
      if (!token) {
        triggerAuthPrompt('Sign in to like movies and train your recommendations')
        return false
      }
      const ids = likedIds.includes(id)
        ? await api.unlikeMovie(id)
        : await api.likeMovie(id)
      setLikedIds(ids)
      return true
    },
    [token, likedIds, triggerAuthPrompt]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      libraryLoading,
      libraryError,
      authPrompt,
      authModalOpen,
      authModalMode,
      openAuth,
      closeAuth,
      triggerAuthPrompt,
      dismissAuthPrompt,
      refreshLibrary,
      login: (payload) => authenticate(api.login, payload),
      register: (payload) => authenticate(api.register, payload),
      logout,
      watchlistIds,
      likedIds,
      toggleWatchlist,
      toggleLike,
      isWatchlisted: (id) => watchlistIds.includes(id),
      isLiked: (id) => likedIds.includes(id),
    }),
    [
      user,
      token,
      libraryLoading,
      libraryError,
      authPrompt,
      authModalOpen,
      authModalMode,
      openAuth,
      closeAuth,
      triggerAuthPrompt,
      dismissAuthPrompt,
      refreshLibrary,
      authenticate,
      logout,
      watchlistIds,
      likedIds,
      toggleWatchlist,
      toggleLike,
    ]
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within a <LibraryProvider>')
  return context
}
