import { MOVIES } from '../data/movies.js'

const BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function request(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cinematch:token') : null
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

const INDUSTRY_INTENTS = [
  { key: 'bollywood', regex: /\b(bollywood|hindi|indian)\s*(movies?|films?|cinema)?\b/gi },
  { key: 'french', regex: /\b(french)\s*(movies?|films?|cinema)?\b/gi },
  { key: 'korean', regex: /\b(korean)\s*(movies?|films?|cinema)?\b/gi },
  { key: 'japanese', regex: /\b(japanese|anime)\s*(movies?|films?|cinema)?\b/gi },
  { key: 'spanish', regex: /\b(spanish)\s*(movies?|films?|cinema)?\b/gi },
  { key: 'hollywood', regex: /\b(hollywood|american)\s*(movies?|films?|cinema)?\b/gi },
]

const parseYearFilter = (yr) => {
  if (!yr || yr === 'all') return null
  const s = String(yr).trim().toLowerCase()
  if (/^\d{4}$/.test(s)) return (y) => y === Number(s)
  if (s === 'before-2016' || s === 'lte-2015') return (y) => (y || 0) <= 2015
  if (s === 'before-2015' || s === 'lte-2014') return (y) => (y || 0) <= 2014
  if (s === '2010-2015') return (y) => (y || 0) >= 2010 && (y || 0) <= 2015
  if (s === '2000s') return (y) => (y || 0) >= 2000 && (y || 0) <= 2009
  if (s === '1990s') return (y) => (y || 0) >= 1990 && (y || 0) <= 1999
  if (s === '1980s') return (y) => (y || 0) >= 1980 && (y || 0) <= 1989
  if (s === 'classic-pre-1980' || s === 'before-1980') return (y) => (y || 0) <= 1979
  return null
}

const localFallbackPage = (path) => {
  let list = [...MOVIES]
  try {
    const url = new URL(`http://dummy${path}`)
    let query = url.searchParams.get('q') || url.searchParams.get('query') || ''
    const genre = url.searchParams.get('genre') || ''
    let industry = (url.searchParams.get('industry') || 'all').toLowerCase()
    const year = url.searchParams.get('year') || ''
    const minRating = Number(url.searchParams.get('minRating') || url.searchParams.get('rating') || 0)
    const sort = url.searchParams.get('sort') || ''

    // Detect natural language industry intent from query (e.g. "french movie", "bollywood")
    if (query) {
      for (const item of INDUSTRY_INTENTS) {
        if (item.regex.test(query)) {
          if (!industry || industry === 'all') industry = item.key
          query = query.replace(item.regex, ' ').replace(/\s+/g, ' ').trim()
          break
        }
      }
    }

    if (industry && industry !== 'all') {
      list = list.filter((m) => (m.industry || '').toLowerCase() === industry)
    }
    if (query) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
    }
    if (genre && genre.toLowerCase() !== 'all') {
      const g = genre.toLowerCase()
      list = list.filter((m) => (m.genres || []).some((x) => x.toLowerCase() === g || x.toLowerCase().includes(g)))
    }
    const yearCheck = parseYearFilter(year)
    if (yearCheck) {
      list = list.filter((m) => yearCheck(m.year))
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

const TMDB_CLIENT_KEY = 'bc0ad1b6c5aa93f7633b2744aaf69dd6'

const TMDB_GENRE_MAP = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  'science fiction': 878,
  thriller: 53,
  'psych thriller': 53,
  'neo-noir': 80,
  dystopian: 878,
  'art house': 18,
  war: 10752,
  western: 37,
}

const TMDB_INDUSTRY_PARAMS = {
  bollywood: { with_original_language: 'hi|te|ta|ml|bn', with_origin_country: 'IN' },
  hollywood: { with_original_language: 'en', with_origin_country: 'US' },
  french: { with_original_language: 'fr' },
  korean: { with_original_language: 'ko' },
  japanese: { with_original_language: 'ja' },
  spanish: { with_original_language: 'es' },
}

const formatTmdbItem = (m) => {
  const rel = m.release_date || ''
  return {
    id: `tmdb-${m.id}`,
    tmdbId: m.id,
    title: m.title || m.original_title || 'Untitled',
    year: Number(rel.slice(0, 4)) || null,
    rating: Number(m.vote_average ? m.vote_average.toFixed(1) : 0),
    genres: [],
    description: m.overview || '',
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
    popularity: Number(m.popularity || 0),
  }
}

async function fetchFromTmdbClient(path) {
  try {
    const url = new URL(`http://dummy${path}`)
    const page = url.searchParams.get('page') || '1'
    let query = url.searchParams.get('q') || url.searchParams.get('query') || ''
    const genre = (url.searchParams.get('genre') || '').toLowerCase()
    let industry = (url.searchParams.get('industry') || 'all').toLowerCase()
    const year = (url.searchParams.get('year') || '').toLowerCase()
    const minRating = Number(url.searchParams.get('minRating') || 0)
    const sort = url.searchParams.get('sort') || 'popularity.desc'

    // Detect natural language industry intent
    if (query) {
      for (const item of INDUSTRY_INTENTS) {
        if (item.regex.test(query)) {
          if (!industry || industry === 'all') industry = item.key
          query = query.replace(item.regex, ' ').replace(/\s+/g, ' ').trim()
          break
        }
      }
    }

    const tmdbUrl = new URL(query ? 'https://api.themoviedb.org/3/search/movie' : 'https://api.themoviedb.org/3/discover/movie')
    tmdbUrl.searchParams.set('api_key', TMDB_CLIENT_KEY)
    tmdbUrl.searchParams.set('language', 'en-US')
    tmdbUrl.searchParams.set('page', page)
    tmdbUrl.searchParams.set('include_adult', 'false')

    if (query) {
      tmdbUrl.searchParams.set('query', query)
      if (/^\d{4}$/.test(year)) tmdbUrl.searchParams.set('primary_release_year', year)
    } else {
      tmdbUrl.searchParams.set('sort_by', sort === 'rating-desc' ? 'vote_average.desc' : sort === 'year-desc' ? 'primary_release_date.desc' : 'popularity.desc')
      if (sort === 'rating-desc') tmdbUrl.searchParams.set('vote_count.gte', '50')
      if (minRating > 0) tmdbUrl.searchParams.set('vote_average.gte', String(minRating))

      if (industry && industry !== 'all' && TMDB_INDUSTRY_PARAMS[industry]) {
        for (const [k, v] of Object.entries(TMDB_INDUSTRY_PARAMS[industry])) {
          tmdbUrl.searchParams.set(k, v)
        }
      }

      if (genre && genre !== 'all' && TMDB_GENRE_MAP[genre]) {
        tmdbUrl.searchParams.set('with_genres', String(TMDB_GENRE_MAP[genre]))
      }

      if (/^\d{4}$/.test(year)) {
        tmdbUrl.searchParams.set('primary_release_year', year)
      } else if (year === 'before-2016' || year === 'lte-2015') {
        tmdbUrl.searchParams.set('primary_release_date.lte', '2015-12-31')
      } else if (year === 'before-2015' || year === 'lte-2014') {
        tmdbUrl.searchParams.set('primary_release_date.lte', '2014-12-31')
      } else if (year === '2010-2015') {
        tmdbUrl.searchParams.set('primary_release_date.gte', '2010-01-01')
        tmdbUrl.searchParams.set('primary_release_date.lte', '2015-12-31')
      } else if (year === '2000s') {
        tmdbUrl.searchParams.set('primary_release_date.gte', '2000-01-01')
        tmdbUrl.searchParams.set('primary_release_date.lte', '2009-12-31')
      } else if (year === '1990s') {
        tmdbUrl.searchParams.set('primary_release_date.gte', '1990-01-01')
        tmdbUrl.searchParams.set('primary_release_date.lte', '1999-12-31')
      } else if (year === '1980s') {
        tmdbUrl.searchParams.set('primary_release_date.gte', '1980-01-01')
        tmdbUrl.searchParams.set('primary_release_date.lte', '1989-12-31')
      } else if (year === 'classic-pre-1980' || year === 'before-1980') {
        tmdbUrl.searchParams.set('primary_release_date.lte', '1979-12-31')
      }
    }

    const res = await fetch(tmdbUrl.toString())
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`)
    const data = await res.json()
    const results = Array.isArray(data.results) ? data.results : []
    const movies = results.map(formatTmdbItem)

    return {
      movies,
      pagination: {
        page: Number(page),
        totalPages: Math.min(data.total_pages || 1, 500),
        totalResults: data.total_results || movies.length,
      },
    }
  } catch (e) {
    console.warn('fetchFromTmdbClient fallback notice:', e.message)
    return null
  }
}

const moviesPage = async (path) => {
  try {
    const payload = await request(path)
    if (payload && Array.isArray(payload.movies) && payload.movies.length > 0) {
      return payload
    }
    if (Array.isArray(payload) && payload.length > 0) {
      return { movies: payload, pagination: { page: 1, totalPages: 1, totalResults: payload.length } }
    }
  } catch (err) {
    console.warn(`API request to ${path} notice: ${err.message}; trying direct TMDB catalog`)
  }

  // Fallback 1: Direct TMDB Client Service
  const tmdbRes = await fetchFromTmdbClient(path)
  if (tmdbRes && tmdbRes.movies && tmdbRes.movies.length > 0) {
    return tmdbRes
  }

  // Fallback 2: Local Built-in Catalog
  return localFallbackPage(path)
}

export function fetchMovies(page = 1, year = 'all') { return moviesPage(`/movies?page=${page}${year !== 'all' ? `&year=${encodeURIComponent(year)}` : ''}`) }
export function fetchTrendingMovies(page = 1) { return moviesPage(`/movies/trending?page=${page}`) }
export function fetchPopularMovies(page = 1) { return moviesPage(`/movies/popular?page=${page}`) }

export async function fetchMovieById(id) {
  try {
    const data = await request(`/movies/${id}`)
    if (data && (data.trailerKey || data.cast?.length > 0)) return data
    if (data) {
      const rawId = String(id).replace(/^tmdb-/, '')
      if (/^\d+$/.test(rawId)) {
        try {
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3/movie/${rawId}?api_key=${TMDB_CLIENT_KEY}&append_to_response=credits,videos,watch/providers`
          )
          if (tmdbRes.ok) {
            const item = await tmdbRes.json()
            const videos = item.videos?.results || []
            const trailerObj =
              videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
              videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
              videos.find((v) => v.site === 'YouTube')
            const wp = item['watch/providers']?.results || {}
            const localWp = wp.IN || wp.US || wp.GB || Object.values(wp)[0] || {}
            return {
              ...data,
              trailerKey: trailerObj ? trailerObj.key : null,
              runtime: item.runtime
                ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
                : data.runtime,
              tagline: item.tagline || data.tagline,
              watchProviders: {
                flatrate: (localWp.flatrate || []).slice(0, 5).map((p) => ({
                  name: p.provider_name,
                  logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
                })),
                rent: (localWp.rent || []).slice(0, 4).map((p) => ({
                  name: p.provider_name,
                  logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
                })),
                buy: (localWp.buy || []).slice(0, 4).map((p) => ({
                  name: p.provider_name,
                  logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
                })),
                justWatchLink: localWp.link || '',
              },
            }
          }
        } catch {}
      }
      return data
    }
  } catch (err) {
    console.warn(`fetchMovieById(${id}) fallback:`, err.message)
  }

  // Client TMDB fetch fallback
  const rawId = String(id).replace(/^tmdb-/, '')
  if (/^\d+$/.test(rawId)) {
    try {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/movie/${rawId}?api_key=${TMDB_CLIENT_KEY}&append_to_response=credits,videos,watch/providers`
      )
      if (tmdbRes.ok) {
        const item = await tmdbRes.json()
        const videos = item.videos?.results || []
        const trailerObj =
          videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
          videos.find((v) => v.site === 'YouTube')
        const wp = item['watch/providers']?.results || {}
        const localWp = wp.IN || wp.US || wp.GB || Object.values(wp)[0] || {}
        const credits = item.credits || {}
        const director = credits.crew?.find((c) => c.job === 'Director')?.name || ''
        const cast = (credits.cast || []).slice(0, 12).map((actor) => ({
          id: actor.id,
          name: actor.name || 'Unknown',
          character: actor.character || '',
          profile: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '',
        }))
        return {
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          title: item.title,
          year: Number(item.release_date?.slice(0, 4)) || null,
          rating: Number(item.vote_average || 0),
          genres: (item.genres || []).map((g) => g.name),
          description: item.overview || '',
          tagline: item.tagline || '',
          runtime: item.runtime
            ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
            : '',
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : '',
          director,
          cast,
          trailerKey: trailerObj ? trailerObj.key : null,
          watchProviders: {
            flatrate: (localWp.flatrate || []).slice(0, 5).map((p) => ({
              name: p.provider_name,
              logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
            })),
            rent: (localWp.rent || []).slice(0, 4).map((p) => ({
              name: p.provider_name,
              logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
            })),
            buy: (localWp.buy || []).slice(0, 4).map((p) => ({
              name: p.provider_name,
              logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : '',
            })),
            justWatchLink: localWp.link || '',
          },
        }
      }
    } catch {}
  }

  return (
    MOVIES.find(
      (m) =>
        m.id === id ||
        `tmdb-${m.id}` === id ||
        m.title?.toLowerCase() === String(id).toLowerCase()
    ) || null
  )
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
    if (data && Array.isArray(data.recommendations)) return data
    if (Array.isArray(data) && data.length > 0) return { recommendations: data, topGenres: [] }
  } catch (err) {
    console.warn('fetchPersonalizedRecommendations fallback:', err.message)
  }
  return {
    recommendations: MOVIES.slice(0, 10).map((m, idx) => ({
      ...m,
      recommendationReason: idx % 2 === 0 ? 'Picked for your taste' : 'A taste match',
    })),
    topGenres: ['Sci-Fi', 'Drama'],
  }
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
