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

const moviesPage = async (path) => {
  const payload = await request(path)
  if (payload && payload.movies && payload.pagination) {
    return payload
  }
  return Array.isArray(payload) ? { movies: payload, pagination: { page: 1, totalPages: 1, totalResults: payload.length } } : payload
}


export function fetchMovies(page = 1, year = 'all') { return moviesPage(`/movies?page=${page}${year !== 'all' ? `&year=${encodeURIComponent(year)}` : ''}`) }
export function fetchTrendingMovies(page = 1) { return moviesPage(`/movies/trending?page=${page}`) }
export function fetchPopularMovies(page = 1) { return moviesPage(`/movies/popular?page=${page}`) }

export function fetchMovieById(id) {
  return request(`/movies/${id}`);
}

export async function fetchMoviesByIds(ids = []) {
  if (!ids || ids.length === 0) return []
  try {
    const result = await request(`/movies?ids=${ids.map(encodeURIComponent).join(',')}`)
    const list = Array.isArray(result) ? result : result.movies || []
    if (list.length > 0) return list
  } catch (err) {
    console.warn('Batch movie fetch failed, falling back to individual lookups:', err.message)
  }
  const settled = await Promise.allSettled(ids.map((id) => fetchMovieById(id)))
  return settled.filter((s) => s.status === 'fulfilled' && s.value).map((s) => s.value)
}

export function fetchMoviesByGenre(genre) {
  return request(`/movies/genre/${encodeURIComponent(genre)}`);
}

export function fetchTopRatedMovies() {
  return request("/movies/top-rated");
}

export const searchMoviesPage = (query, page = 1, year = 'all') => moviesPage(`/movies/search?q=${encodeURIComponent(query)}&page=${page}${year !== 'all' ? `&year=${encodeURIComponent(year)}` : ''}`)
export const searchMovies = async (query, page = 1) => (await searchMoviesPage(query, page)).movies
export const fetchMoviesByGenrePage = (genre, page = 1, year = 'all') => moviesPage(`/movies/genre/${encodeURIComponent(genre)}?page=${page}${year !== 'all' ? `&year=${encodeURIComponent(year)}` : ''}`)
export const fetchLibrary = () => request('/users/me/library')
export const addToWatchlist = (movieId) => request('/users/me/watchlist', { method: 'POST', body: JSON.stringify({ movieId }) })
export const removeFromWatchlist = (movieId) => request(`/users/me/watchlist/${encodeURIComponent(movieId)}`, { method: 'DELETE' })
export const likeMovie = (movieId) => request(`/users/me/like/${encodeURIComponent(movieId)}`, { method: 'POST' })
export const unlikeMovie = (movieId) => request(`/users/me/like/${encodeURIComponent(movieId)}`, { method: 'DELETE' })
export const register = (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
export const login = (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
export const fetchMe = () => request('/auth/me')
