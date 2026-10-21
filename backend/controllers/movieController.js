import Movie from '../models/Movie.js'
import { env } from '../config/env.js'
import { findExactMovie, getGenreMap, getPaginatedMovies, normalizeMovie, tmdbRequest } from '../services/tmdbService.js'

const shapeCached = (movie) => ({ id: movie.movieId, tmdbId: movie.tmdbId, title: movie.title, year: movie.year, releaseDate: movie.releaseDate || '', genres: movie.genres || [], rating: movie.rating || 0, poster: movie.poster || '', backdrop: movie.backdrop || '', description: movie.description || '' })
const pageNumber = (value) => Math.min(Math.max(Number.parseInt(value, 10) || 1, 1), 500)
const fallbackPage = async (query, page, sort = { rating: -1 }) => {
  const totalResults = await Movie.countDocuments(query)
  return { movies: (await Movie.find(query).sort(sort).skip((page - 1) * 20).limit(20)).map(shapeCached), page, totalPages: Math.max(1, Math.ceil(totalResults / 20)), totalResults }
}
async function tmdbOrFallback(fetchTmdb, fallback) {
  if (!env.tmdbApiKey) return fallback()
  try { return await fetchTmdb() } catch (error) { console.error(`TMDB request failed; using cached catalog: ${error.message}`); return fallback() }
}
function sendPage(res, result) { res.json({ success: true, data: result.movies, pagination: { page: result.page, totalPages: result.totalPages, totalResults: result.totalResults } }) }

export async function getAllMovies(req, res) {
  if (req.query.ids) {
    const ids = String(req.query.ids).split(',').map((id) => id.trim()).filter(Boolean)
    if (ids.length === 0) {
      return res.json({ success: true, data: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } })
    }

    const cached = await Movie.find({ movieId: { $in: ids } })
    const cachedMap = new Map(cached.map((m) => [m.movieId, shapeCached(m)]))
    const missing = ids.filter((id) => !cachedMap.has(id))

    if (env.tmdbApiKey && missing.length > 0) {
      await Promise.all(
        missing.map(async (id) => {
          const rawId = id.replace(/^tmdb-/, '')
          if (/^\d+$/.test(rawId)) {
            try {
              const movie = await normalizeMovie(await tmdbRequest(`/movie/${rawId}`))
              await Movie.updateOne(
                { movieId: movie.id },
                { $set: { movieId: movie.id, tmdbId: movie.tmdbId, title: movie.title, year: movie.year, releaseDate: movie.releaseDate, genres: movie.genres, rating: movie.rating, poster: movie.poster, backdrop: movie.backdrop, description: movie.description, popularity: movie.popularity } },
                { upsert: true }
              )
              cachedMap.set(id, movie)
            } catch (err) {
              console.error(`Failed to fetch TMDB movie ${id}: ${err.message}`)
            }
          }
        })
      )
    }

    const ordered = ids.map((id) => cachedMap.get(id)).filter(Boolean)
    return res.json({
      success: true,
      data: ordered,
      pagination: { page: 1, totalPages: 1, totalResults: ordered.length }
    })
  }

  const page = pageNumber(req.query.page)
  const year = /^\d{4}$/.test(String(req.query.year || '')) ? Number(req.query.year) : undefined
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/discover/movie', { page, year, primary_release_year: year, sort_by: 'popularity.desc', include_adult: false }), () => fallbackPage(year ? { year } : {}, page)))
}

export async function getTrendingMovies(req, res) {
  const page = pageNumber(req.query.page)
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/trending/movie/week', { page }), () => fallbackPage({}, page, { popularity: -1, rating: -1 })))
}
export async function getPopularMovies(req, res) {
  const page = pageNumber(req.query.page)
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/movie/popular', { page }), () => fallbackPage({}, page, { popularity: -1, rating: -1 })))
}
export async function getMovieById(req, res) {
  const rawId = req.params.id.replace(/^tmdb-/, '')
  if (env.tmdbApiKey && /^\d+$/.test(rawId)) {
    try {
      const movie = await normalizeMovie(await tmdbRequest(`/movie/${rawId}`))
      await Movie.updateOne({ movieId: movie.id }, { $set: { movieId: movie.id, tmdbId: movie.tmdbId, title: movie.title, year: movie.year, releaseDate: movie.releaseDate, genres: movie.genres, rating: movie.rating, poster: movie.poster, backdrop: movie.backdrop, description: movie.description, popularity: movie.popularity } }, { upsert: true })
      return res.json({ success: true, data: movie })
    } catch (error) { console.error(`TMDB detail failed; using cache: ${error.message}`) }
  }
  const movie = await Movie.findOne({ movieId: req.params.id })
  if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' })
  if (env.tmdbApiKey && !movie.tmdbId) {
    try {
      const matched = await findExactMovie(movie.title, movie.year)
      if (matched) {
        await Movie.updateOne({ _id: movie._id }, { $set: { tmdbId: matched.tmdbId, releaseDate: matched.releaseDate, genres: matched.genres, rating: matched.rating, poster: matched.poster, backdrop: matched.backdrop, description: matched.description, popularity: matched.popularity } })
        return res.json({ success: true, data: { ...matched, id: movie.movieId } })
      }
    } catch (error) { console.error(`Legacy movie poster repair failed: ${error.message}`) }
  }
  res.json({ success: true, data: shapeCached(movie) })
}
export async function searchMovies(req, res) {
  const query = String(req.query.q || '').trim()
  if (!query) return res.json({ success: true, data: [], pagination: { page: 1, totalPages: 0, totalResults: 0 } })
  const page = pageNumber(req.query.page)
  const year = /^\d{4}$/.test(String(req.query.year || '')) ? Number(req.query.year) : undefined
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/search/movie', { page, query, year, include_adult: false }), () => fallbackPage({ title: { $regex: safeQuery, $options: 'i' }, ...(year ? { year } : {}) }, page)))
}
export async function getMoviesByGenre(req, res) {
  const page = pageNumber(req.query.page)
  const genreValue = decodeURIComponent(req.params.genre)
  const safeGenre = genreValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const year = /^\d{4}$/.test(String(req.query.year || '')) ? Number(req.query.year) : undefined
  const result = await tmdbOrFallback(async () => { const genreMap = await getGenreMap(); const genreId = [...genreMap.entries()].find(([, name]) => name.toLowerCase() === genreValue.toLowerCase())?.[0] || genreValue; return getPaginatedMovies('/discover/movie', { page, with_genres: genreId, primary_release_year: year, sort_by: 'popularity.desc' }) }, () => fallbackPage({ genres: { $regex: `^${safeGenre}$`, $options: 'i' }, ...(year ? { year } : {}) }, page, { popularity: -1, rating: -1 }))
  sendPage(res, result)
}
export async function getTopRated(req, res) {
  const page = pageNumber(req.query.page)
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/movie/top_rated', { page }), () => fallbackPage({}, page)))
}
