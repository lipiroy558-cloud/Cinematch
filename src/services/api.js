import { MOVIES } from '../data/movies'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function request(path, options = {}) {
  const token = localStorage.getItem('cinematch:token')
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed')
  }

  if (data.pagination) {
    return {
      movies: Array.isArray(data.data) ? data.data : [],
      pagination: data.pagination,
    }
  }

  return data.data
}

const localFallbackPage = (path) => {
  let list = [...MOVIES]
  try {
    const url = new URL(`http://dummy${path}`)
    const query = url.searchParams.get('q') || url.searchParams.get('query') || ''
    const genre = url.searchParams.get('genre') || ''
    const year = url.searchParams.get('year') || ''
    const minRating = Number(url.searchParams.get('minRating') || url.searchParams.get('rating') || 0)
    const sort = url.searchParams.get('sort') || ''

    if (query) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.title?.toLowerCase().includes(q))
    }
    if (genre && genre.toLowerCase() !== 'all') {
      const g = genre.toLowerCase()
      list = list.filter((m) => (m.genres || []).some((x) => x.toLowerCase() === g || x.toLowerCase().includes(g)))
    }
    if (year && year !== 'all') {
      list = list.filter((m) => String(m.year) === String(year))
    }
    if (minRating > 0) {
      list = list.filter((m) => (m.rating || 0) >= minRating)
    }
    if (sort === 'rating-desc') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'year-desc') list.sort((a, b) => (b.year || 0) - (a.year || 0))
    else if (sort === 'title-asc') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))

    const page = Number(url.searchParams.get('page') || 1)
    const limit = 20
    const start = (page - 1) * limit
    return {
      movies: list.slice(start, start + limit),
      pagination: {
        page,
        totalPages: Math.max(1, Math.ceil(list.length / limit)),
        totalResults: list.length,
      },
    }
  } catch {
    return {
      movies: list.slice(0, 20),
      pagination: { page: 1, totalPages: 1, totalResults: list.length },
    }
  }
}

const moviesPage = async (path) => {
  try {
    const payload = await request(path)
    if (payload && payload.movies && payload.pagination) {
      if (payload.movies.length > 0) return payload
    }
    if (Array.isArray(payload) && payload.length > 0) {
      return { movies: payload, pagination: { page: 1, totalPages: 1, totalResults: payload.length } }
    }
  } catch (err) {
    console.warn(`API request to ${path} notice: ${err.message}; using catalog fallback`)
  }
  return localFallbackPage(path)
}

export function fetchMovies(page = 1, year = 'all') { return moviesPage(`/movies?page=${page}${year !== 'all' ? `&year=${encodeURIComponent(year)}` : ''}`) }
export function fetchTrendingMovies(page = 1) { return moviesPage(`/movies/trending?page=${page}`) }
export function fetchPopularMovies(page = 1) { return moviesPage(`/movies/popular?page=${page}`) }

export async function fetchMovieById(id) {
  try {
    const data = await request(`/movies/${id}`)
    if (data) return data
  } catch (err) {
    console.warn(`fetchMovieById(${id}) fallback:`, err.message)
  }
  return MOVIES.find((m) => m.id === id || `tmdb-${m.id}` === id || m.title?.toLowerCase() === String(id).toLowerCase()) || null
}

export async function fetchMoviesByIds(ids = []) {
  if (!ids || ids.length === 0) return []
  try {
    const result = await request(`/movies?ids=${ids.map(encodeURIComponent).join(',')}`)
    const list = Array.isArray(result) ? result : result.movies || []
    if (list.length > 0) return list
  } catch (err) {
    console.warn('Batch movie fetch notice:', err.message)
  }
  const settled = await Promise.allSettled(ids.map((id) => fetchMovieById(id)))
  return settled.filter((s) => s.status === 'fulfilled' && s.value).map((s) => s.value)
}

export function fetchMoviesByGenre(genre) {
  return moviesPage(`/movies/genre/${encodeURIComponent(genre)}`)
}

export function fetchTopRatedMovies() {
  return moviesPage('/movies/top-rated')
}

export async function fetchPersonalizedRecommendations(options = {}) {
  const params = new URLSearchParams()
  if (options.liked && options.liked.length > 0) {
    params.set('liked', options.liked.join(','))
  }
  if (options.watchlist && options.watchlist.length > 0) {
    params.set('watchlist', options.watchlist.join(','))
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  try {
    const data = await request(`/movies/recommendations${query}`)
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    console.warn('fetchPersonalizedRecommendations fallback:', err.message)
  }
  return MOVIES.slice(0, 10).map((m, idx) => ({
    ...m,
    recommendationReason: idx % 2 === 0 ? 'Picked for your taste' : 'A taste match',
  }))
}

export function fetchDiscoverMovies({
  page = 1,
  query = '',
  genre = 'All',
  industry = 'all',
  minRating = 0,
  year = 'all',
  sort = 'popularity.desc',
} = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (query && query.trim()) params.set('q', query.trim())
  if (genre && genre !== 'All') params.set('genre', genre)
  if (industry && industry !== 'all') params.set('industry', industry)
  if (minRating && Number(minRating) > 0) params.set('minRating', String(minRating))
  if (year && year !== 'all') params.set('year', String(year))
  if (sort) params.set('sort', sort)

  return moviesPage(`/movies?${params.toString()}`)
}

export const searchMoviesPage = (query, page = 1, year = 'all') => fetchDiscoverMovies({ page, query, year })
export const searchMovies = async (query, page = 1) => (await searchMoviesPage(query, page)).movies
export const fetchMoviesByGenrePage = (genre, page = 1, year = 'all') => fetchDiscoverMovies({ page, genre, year })
export const fetchLibrary = () => request('/users/me/library')
export const addToWatchlist = (movieId) => request('/users/me/watchlist', { method: 'POST', body: JSON.stringify({ movieId }) })
export const removeFromWatchlist = (movieId) => request(`/users/me/watchlist/${encodeURIComponent(movieId)}`, { method: 'DELETE' })
export const likeMovie = (movieId) => request(`/users/me/like/${encodeURIComponent(movieId)}`, { method: 'POST' })
export const unlikeMovie = (movieId) => request(`/users/me/like/${encodeURIComponent(movieId)}`, { method: 'DELETE' })
export const register = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
export const login = (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
export const fetchMe = () => request('/auth/me')
