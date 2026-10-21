import https from 'https'
import dns from 'dns'
import { env } from '../config/env.js'

const IMAGE_BASE = 'https://image.tmdb.org/t/p'
const genreCache = new Map()
const TMDB_TIMEOUT_MS = 8000

dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1'])

function requireTmdb() {
  if (!env.tmdbApiKey) throw new Error('TMDB_API_KEY is not configured')
}

export function imageUrl(path, size = 'w500') {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${IMAGE_BASE}/${size}/${String(path).replace(/^\//, '')}`
}

function dnsSafeLookup(hostname, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (hostname === 'api.themoviedb.org') {
    dns.resolve4(hostname, (err, addrs) => {
      if (!err && addrs && addrs.length) {
        if (opts && opts.all) {
          cb(null, addrs.map((a) => ({ address: a, family: 4 })))
        } else {
          cb(null, addrs[0], 4)
        }
      } else {
        dns.lookup(hostname, opts, cb)
      }
    })
  } else {
    dns.lookup(hostname, opts, cb)
  }
}

export async function tmdbRequest(path, params = {}) {
  requireTmdb()
  const searchParams = new URLSearchParams()
  searchParams.set('api_key', env.tmdbApiKey)
  searchParams.set('language', env.tmdbLanguage)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value))
  })

  const fullPath = `/3${path}${path.includes('?') ? '&' : '?'}${searchParams.toString()}`

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.themoviedb.org',
      path: fullPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Cinematch/1.0',
        'Accept': 'application/json',
      },
      lookup: dnsSafeLookup,
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          return reject(new Error(`TMDB request failed with status ${res.statusCode}`))
        }
        try {
          resolve(JSON.parse(body))
        } catch (err) {
          reject(new Error(`Failed to parse TMDB response: ${err.message}`))
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(TMDB_TIMEOUT_MS, () => {
      req.destroy(new Error(`TMDB request timed out after ${TMDB_TIMEOUT_MS / 1000}s`))
    })
    req.end()
  })
}

export async function getGenreMap() {
  if (genreCache.has(env.tmdbLanguage)) return genreCache.get(env.tmdbLanguage)
  const result = await tmdbRequest('/genre/movie/list')
  const map = new Map(result.genres.map((genre) => [genre.id, genre.name]))
  genreCache.set(env.tmdbLanguage, map)
  return map
}

export async function normalizeMovie(item, genresById) {
  const releaseDate = item.release_date || ''
  const genreMap = genresById || await getGenreMap()
  const genreNames = item.genres?.map((genre) => genre.name) || (item.genre_ids || []).map((id) => genreMap.get(Number(id))).filter(Boolean)
  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title: item.title || item.name || 'Untitled movie',
    releaseDate,
    year: Number(releaseDate.slice(0, 4)) || null,
    rating: Number(item.vote_average || 0),
    genres: genreNames,
    description: item.overview || '',
    poster: imageUrl(item.poster_path),
    backdrop: imageUrl(item.backdrop_path, 'w1280'),
    posterPath: item.poster_path || '',
    backdropPath: item.backdrop_path || '',
    popularity: Number(item.popularity || 0),
  }
}

export async function getPaginatedMovies(path, params = {}) {
  const result = await tmdbRequest(path, params)
  const genres = await getGenreMap()
  return {
    movies: await Promise.all((result.results || []).map((movie) => normalizeMovie(movie, genres))),
    page: result.page || Number(params.page || 1),
    totalPages: result.total_pages || 0,
    totalResults: result.total_results || 0,
  }
}

export async function findExactMovie(title, year) {
  const result = await tmdbRequest('/search/movie', { query: title, year, include_adult: false })
  const normalizedTitle = title.trim().toLowerCase()
  const exact = (result.results || []).find((item) => {
    const itemTitle = String(item.title || '').trim().toLowerCase()
    const itemYear = Number(String(item.release_date || '').slice(0, 4))
    return itemTitle === normalizedTitle && (!year || itemYear === Number(year))
  })
  return exact ? normalizeMovie(exact) : null
}
