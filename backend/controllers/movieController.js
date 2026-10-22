import mongoose from 'mongoose'
import Movie from '../models/Movie.js'
import User from '../models/User.js'
import staticMovies from '../data/movies.js'
import { env } from '../config/env.js'
import {
  findExactMovie,
  getPaginatedMovies,
  normalizeMovie,
  tmdbRequest,
  getRecommendationsForMovie,
  getSimilarForMovie,
  resolveGenreId,
  GENRE_ALIASES,
} from '../services/tmdbService.js'

const shapeCached = (movie) => ({
  id: movie.movieId,
  tmdbId: movie.tmdbId,
  title: movie.title,
  year: movie.year,
  releaseDate: movie.releaseDate || '',
  genres: movie.genres || [],
  rating: movie.rating || 0,
  poster: movie.poster || '',
  backdrop: movie.backdrop || '',
  description: movie.description || '',
  director: movie.director || '',
  cast: movie.cast || [],
})
const pageNumber = (value) => Math.min(Math.max(Number.parseInt(value, 10) || 1, 1), 500)
const fallbackPage = async (query, page, sort = { rating: -1 }) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const totalResults = await Movie.countDocuments(query)
      return { movies: (await Movie.find(query).sort(sort).skip((page - 1) * 20).limit(20)).map(shapeCached), page, totalPages: Math.max(1, Math.ceil(totalResults / 20)), totalResults }
    } catch (e) {
      console.warn('Fallback Mongo query failed, using staticMovies:', e.message)
    }
  }
  const totalResults = staticMovies.length
  return { movies: staticMovies.slice((page - 1) * 20, page * 20), page, totalPages: Math.max(1, Math.ceil(totalResults / 20)), totalResults }
}
async function tmdbOrFallback(fetchTmdb, fallback) {
  if (!env.tmdbApiKey) return fallback()
  try { return await fetchTmdb() } catch (error) { console.error(`TMDB request failed; using cached catalog: ${error.message}`); return fallback() }
}
function sendPage(res, result) { res.json({ success: true, data: result.movies, pagination: { page: result.page, totalPages: result.totalPages, totalResults: result.totalResults } }) }

const INDUSTRY_MAP = {
  bollywood: { with_original_language: 'hi|te|ta|ml|bn', with_origin_country: 'IN' },
  hollywood: { with_original_language: 'en', with_origin_country: 'US' },
  french: { with_original_language: 'fr' },
  korean: { with_original_language: 'ko' },
  japanese: { with_original_language: 'ja' },
  spanish: { with_original_language: 'es' },
}

export async function getAllMovies(req, res) {
  if (req.query.ids) {
    const ids = String(req.query.ids).split(',').map((id) => id.trim()).filter(Boolean)
    if (ids.length === 0) {
      return res.json({ success: true, data: [], pagination: { page: 1, totalPages: 1, totalResults: 0 } })
    }

    const cached = mongoose.connection.readyState === 1 ? await Movie.find({ movieId: { $in: ids } }).catch(() => []) : []
    const cachedMap = new Map(cached.map((m) => [m.movieId, shapeCached(m)]))
    const missing = ids.filter((id) => !cachedMap.has(id))

    if (env.tmdbApiKey && missing.length > 0) {
      await Promise.all(
        missing.map(async (id) => {
          const rawId = id.replace(/^tmdb-/, '')
          if (/^\d+$/.test(rawId)) {
            try {
              const movie = await normalizeMovie(await tmdbRequest(`/movie/${rawId}`))
              if (mongoose.connection.readyState === 1) {
                Movie.updateOne(
                  { movieId: movie.id },
                  { $set: { movieId: movie.id, tmdbId: movie.tmdbId, title: movie.title, year: movie.year, releaseDate: movie.releaseDate, genres: movie.genres, rating: movie.rating, poster: movie.poster, backdrop: movie.backdrop, description: movie.description, popularity: movie.popularity } },
                  { upsert: true }
                ).catch(() => {})
              }
              cachedMap.set(id, movie)
            } catch (err) {
              console.error(`Failed to fetch TMDB movie ${id}: ${err.message}`)
            }
          } else {
            const staticMatch = staticMovies.find((m) => m.id === id)
            if (staticMatch) cachedMap.set(id, staticMatch)
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
  let rawQuery = String(req.query.q || req.query.query || '').trim()
  let genre = String(req.query.genre || '').trim()
  let industry = String(req.query.industry || 'all').trim().toLowerCase()
  const minRating = Number(req.query.minRating || req.query.rating || 0)
  const sort = String(req.query.sort || 'popularity.desc').trim()
  const rawYear = String(req.query.year || '').trim()

  // Smart detect industry and genre inside search query (e.g. "french movie", "bollywood films", "french comedy")
  const INDUSTRY_INTENTS = [
    { key: 'bollywood', regex: /\b(bollywood|hindi|indian)\s*(movies?|films?|cinema)?\b/gi },
    { key: 'french', regex: /\b(french)\s*(movies?|films?|cinema)?\b/gi },
    { key: 'korean', regex: /\b(korean)\s*(movies?|films?|cinema)?\b/gi },
    { key: 'japanese', regex: /\b(japanese|anime)\s*(movies?|films?|cinema)?\b/gi },
    { key: 'spanish', regex: /\b(spanish)\s*(movies?|films?|cinema)?\b/gi },
    { key: 'hollywood', regex: /\b(hollywood|american)\s*(movies?|films?|cinema)?\b/gi },
  ]

  let detectedIndustry = null
  let query = rawQuery
  if (query) {
    for (const item of INDUSTRY_INTENTS) {
      if (item.regex.test(query)) {
        detectedIndustry = item.key
        query = query.replace(item.regex, ' ').replace(/\s+/g, ' ').trim()
        break
      }
    }
  }

  if (detectedIndustry && (!industry || industry === 'all')) {
    industry = detectedIndustry
  }

  // Parse release year filter (exact year or range)
  let yearFilter = null
  if (rawYear && rawYear !== 'all') {
    const yStr = rawYear.toLowerCase()
    if (/^\d{4}$/.test(yStr)) {
      const yr = Number(yStr)
      yearFilter = { exact: yr, mongo: yr, check: (y) => y === yr }
    } else if (yStr === 'before-2016' || yStr === 'lte-2015') {
      yearFilter = { lteDate: '2015-12-31', mongo: { $lte: 2015 }, check: (y) => (y || 0) <= 2015 }
    } else if (yStr === 'before-2015' || yStr === 'lte-2014') {
      yearFilter = { lteDate: '2014-12-31', mongo: { $lte: 2014 }, check: (y) => (y || 0) <= 2014 }
    } else if (yStr === '2010-2015') {
      yearFilter = { gteDate: '2010-01-01', lteDate: '2015-12-31', mongo: { $gte: 2010, $lte: 2015 }, check: (y) => (y || 0) >= 2010 && (y || 0) <= 2015 }
    } else if (yStr === '2000s') {
      yearFilter = { gteDate: '2000-01-01', lteDate: '2009-12-31', mongo: { $gte: 2000, $lte: 2009 }, check: (y) => (y || 0) >= 2000 && (y || 0) <= 2009 }
    } else if (yStr === '1990s') {
      yearFilter = { gteDate: '1990-01-01', lteDate: '1999-12-31', mongo: { $gte: 1990, $lte: 1999 }, check: (y) => (y || 0) >= 1990 && (y || 0) <= 1999 }
    } else if (yStr === '1980s') {
      yearFilter = { gteDate: '1980-01-01', lteDate: '1989-12-31', mongo: { $gte: 1980, $lte: 1989 }, check: (y) => (y || 0) >= 1980 && (y || 0) <= 1989 }
    } else if (yStr === 'classic-pre-1980' || yStr === 'before-1980') {
      yearFilter = { lteDate: '1979-12-31', mongo: { $lte: 1979 }, check: (y) => (y || 0) <= 1979 }
    }
  }

  let sortBy = 'popularity.desc'
  let voteCountGte = minRating > 0 ? 30 : undefined
  if (sort === 'rating-desc') {
    sortBy = 'vote_average.desc'
    voteCountGte = 100
  } else if (sort === 'year-desc') {
    sortBy = 'primary_release_date.desc'
  } else if (sort === 'title-asc') {
    sortBy = 'original_title.asc'
  }

  const runFallback = async () => {
    if (mongoose.connection.readyState === 1) {
      const mongoQuery = {}
      if (query) {
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        mongoQuery.title = { $regex: safeQuery, $options: 'i' }
      }
      if (industry && industry !== 'all') {
        mongoQuery.industry = industry
      }
      if (yearFilter?.mongo) {
        mongoQuery.year = yearFilter.mongo
      }
      if (minRating > 0) {
        mongoQuery.rating = { $gte: minRating }
      }
      if (genre && genre.toLowerCase() !== 'all') {
        const alias = GENRE_ALIASES[genre.toLowerCase()] || genre
        mongoQuery.genres = {
          $in: [
            new RegExp(`^${genre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
            new RegExp(`^${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          ],
        }
      }

      let mongoSort = { popularity: -1, rating: -1 }
      if (sort === 'rating-desc') mongoSort = { rating: -1, popularity: -1 }
      else if (sort === 'year-desc') mongoSort = { year: -1, rating: -1 }
      else if (sort === 'title-asc') mongoSort = { title: 1 }

      try {
        const result = await fallbackPage(mongoQuery, page, mongoSort)
        if (result.movies.length > 0) return result
      } catch {}
    }

    let list = [...staticMovies]
    if (industry && industry !== 'all') {
      list = list.filter((m) => (m.industry || '').toLowerCase() === industry)
    }
    if (query) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.title?.toLowerCase().includes(q))
    }
    if (yearFilter?.check) {
      list = list.filter((m) => yearFilter.check(m.year))
    }
    if (minRating > 0) {
      list = list.filter((m) => (m.rating || 0) >= minRating)
    }
    if (genre && genre.toLowerCase() !== 'all') {
      const alias = (GENRE_ALIASES[genre.toLowerCase()] || genre).toLowerCase()
      list = list.filter((m) =>
        (m.genres || []).some(
          (g) => g.toLowerCase() === genre.toLowerCase() || g.toLowerCase() === alias
        )
      )
    }
    if (sort === 'rating-desc') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'year-desc') list.sort((a, b) => (b.year || 0) - (a.year || 0))
    else if (sort === 'title-asc') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))

    const totalResults = list.length
    return {
      movies: list.slice((page - 1) * 20, page * 20),
      page,
      totalPages: Math.max(1, Math.ceil(totalResults / 20)),
      totalResults,
    }
  }

  const result = await tmdbOrFallback(async () => {
    // If a title query is still present after removing industry intents:
    if (query) {
      const searchParams = {
        page,
        query,
        include_adult: false,
      }
      if (yearFilter?.exact) {
        searchParams.primary_release_year = yearFilter.exact
      } else if (yearFilter?.exactYear) {
        searchParams.primary_release_year = yearFilter.exactYear
      }

      const searchRes = await getPaginatedMovies('/search/movie', searchParams)
      let list = searchRes.movies || []

      // If user had an industry filter or detected one, prioritize those results
      if (industry && industry !== 'all' && list.length > 0) {
        const indConfig = INDUSTRY_MAP[industry]
        if (indConfig?.with_original_language) {
          const allowedLangs = indConfig.with_original_language.split('|')
          const filtered = list.filter((m) => allowedLangs.includes(m.originalLanguage || ''))
          if (filtered.length > 0) list = filtered
        }
      }

      if (yearFilter?.check) {
        list = list.filter((m) => yearFilter.check(m.year))
      }

      if (minRating > 0) {
        list = list.filter((m) => (m.rating || 0) >= minRating)
      }
      if (genre && genre.toLowerCase() !== 'all') {
        const alias = (GENRE_ALIASES[genre.toLowerCase()] || genre).toLowerCase()
        list = list.filter((m) =>
          (m.genres || []).some(
            (g) => g.toLowerCase() === genre.toLowerCase() || g.toLowerCase() === alias
          )
        )
      }
      if (sort === 'rating-desc') {
        list.sort((a, b) => b.rating - a.rating)
      } else if (sort === 'year-desc') {
        list.sort((a, b) => b.year - a.year)
      } else if (sort === 'title-asc') {
        list.sort((a, b) => a.title.localeCompare(b.title))
      }

      if (list.length > 0) {
        return {
          movies: list,
          page: searchRes.page,
          totalPages: searchRes.totalPages,
          totalResults: list.length,
        }
      }
    }

    // Discover movies by industry, year (exact or range), genre, rating
    const genreId = await resolveGenreId(genre)
    const industryParams = INDUSTRY_MAP[industry] || {}
    const discoverParams = {
      page,
      sort_by: sortBy,
      include_adult: false,
      ...industryParams,
    }

    if (yearFilter?.exact) {
      discoverParams.primary_release_year = yearFilter.exact
    }
    if (yearFilter?.gteDate) {
      discoverParams['primary_release_date.gte'] = yearFilter.gteDate
    }
    if (yearFilter?.lteDate) {
      discoverParams['primary_release_date.lte'] = yearFilter.lteDate
    }
    if (genreId) discoverParams.with_genres = genreId
    if (minRating > 0) discoverParams['vote_average.gte'] = minRating
    if (voteCountGte) discoverParams['vote_count.gte'] = voteCountGte

    return getPaginatedMovies('/discover/movie', discoverParams)
  }, runFallback)

  sendPage(res, result)
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
      const item = await tmdbRequest(`/movie/${rawId}`, { append_to_response: 'credits,videos,watch/providers' })
      const movie = await normalizeMovie(item)
      if (mongoose.connection.readyState === 1) {
        Movie.updateOne(
          { movieId: movie.id },
          {
            $set: {
              movieId: movie.id,
              tmdbId: movie.tmdbId,
              title: movie.title,
              year: movie.year,
              releaseDate: movie.releaseDate,
              genres: movie.genres,
              rating: movie.rating,
              poster: movie.poster,
              backdrop: movie.backdrop,
              description: movie.description,
              popularity: movie.popularity,
              director: movie.director,
              cast: movie.cast,
            },
          },
          { upsert: true }
        ).catch(() => {})
      }
      return res.json({ success: true, data: movie })
    } catch (error) {
      console.error(`TMDB detail failed; using cache: ${error.message}`)
    }
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const movie = await Movie.findOne({ movieId: req.params.id })
      if (movie) {
        if (env.tmdbApiKey) {
          try {
            let tmdbId = movie.tmdbId
            if (!tmdbId) {
              const matched = await findExactMovie(movie.title, movie.year)
              if (matched) tmdbId = matched.tmdbId
            }
            if (tmdbId) {
              const item = await tmdbRequest(`/movie/${tmdbId}`, { append_to_response: 'credits,videos,watch/providers' })
              const enriched = await normalizeMovie(item)
              Movie.updateOne(
                { _id: movie._id },
                {
                  $set: {
                    tmdbId,
                    releaseDate: enriched.releaseDate,
                    genres: enriched.genres,
                    rating: enriched.rating,
                    poster: enriched.poster || movie.poster,
                    backdrop: enriched.backdrop || movie.backdrop,
                    description: enriched.description || movie.description,
                    popularity: enriched.popularity,
                    director: enriched.director,
                    cast: enriched.cast,
                  },
                }
              ).catch(() => {})
              return res.json({ success: true, data: { ...enriched, id: movie.movieId } })
            }
          } catch (error) {
            console.error(`Legacy movie enrich notice: ${error.message}`)
          }
        }
        return res.json({ success: true, data: shapeCached(movie) })
      }
    } catch (err) {
      console.warn('MongoDB query failed:', err.message)
    }
  }

  const staticMatch = staticMovies.find((m) => m.id === req.params.id || `tmdb-${m.id}` === req.params.id || m.title?.toLowerCase() === req.params.id.toLowerCase())
  if (staticMatch) {
    return res.json({ success: true, data: staticMatch })
  }

  res.status(404).json({ success: false, message: 'Movie not found' })
}
export async function searchMovies(req, res) {
  return getAllMovies(req, res)
}
export async function getMoviesByGenre(req, res) {
  req.query.genre = req.params.genre
  return getAllMovies(req, res)
}
export async function getTopRated(req, res) {
  const page = pageNumber(req.query.page)
  sendPage(res, await tmdbOrFallback(() => getPaginatedMovies('/movie/top_rated', { page }), () => fallbackPage({}, page)))
}

async function resolveMovieSeed(id) {
  let movie = await Movie.findOne({ movieId: id })
  if (!movie) {
    const rawId = String(id).replace(/^tmdb-/, '')
    if (env.tmdbApiKey && /^\d+$/.test(rawId)) {
      try {
        const item = await tmdbRequest(`/movie/${rawId}`)
        const normalized = await normalizeMovie(item)
        movie = await Movie.findOneAndUpdate(
          { movieId: normalized.id },
          {
            $set: {
              movieId: normalized.id,
              tmdbId: normalized.tmdbId,
              title: normalized.title,
              year: normalized.year,
              releaseDate: normalized.releaseDate,
              genres: normalized.genres,
              rating: normalized.rating,
              poster: normalized.poster,
              backdrop: normalized.backdrop,
              description: normalized.description,
              popularity: normalized.popularity,
            },
          },
          { upsert: true, new: true }
        )
      } catch (e) {
        console.warn(`Failed resolving seed movie ${id}: ${e.message}`)
      }
    }
  }
  return movie ? (movie.movieId ? shapeCached(movie) : movie) : null
}

export async function getPersonalizedRecommendations(req, res) {
  let userLiked = []
  let userWatchlist = []

  if (req.auth?.sub) {
    const user = await User.findById(req.auth.sub).lean()
    if (user) {
      userLiked = user.likedMovies || []
      userWatchlist = user.watchlist || []
    }
  }

  const queryLiked = req.query.liked ? String(req.query.liked).split(',').map((s) => s.trim()).filter(Boolean) : []
  const queryWatchlist = req.query.watchlist ? String(req.query.watchlist).split(',').map((s) => s.trim()).filter(Boolean) : []

  const likedIds = [...new Set([...userLiked, ...queryLiked])]
  const watchlistIds = [...new Set([...userWatchlist, ...queryWatchlist])]
  const allKnownIds = new Set([...likedIds, ...watchlistIds])

  // Cold Start: new user with no history
  if (allKnownIds.size === 0) {
    const fallback = await tmdbOrFallback(
      () => getPaginatedMovies('/trending/movie/week', { page: 1 }),
      () => fallbackPage({}, 1, { popularity: -1, rating: -1 })
    )
    const recommendations = (fallback.movies || []).slice(0, 15).map((m) => ({
      ...m,
      reason: 'Popular this week',
      matchScore: Math.round((m.rating || 7.0) * 10),
    }))

    return res.json({
      success: true,
      data: {
        recommendations,
        topGenres: [],
        isPersonalized: false,
        seedCount: 0,
      },
    })
  }

  // Resolve seed movies to get titles, genres, and TMDB IDs
  const seedIds = [...likedIds, ...watchlistIds]
  const seedMovies = (await Promise.all(seedIds.map((id) => resolveMovieSeed(id)))).filter(Boolean)

  const genreWeights = {}
  seedMovies.forEach((m) => {
    const weight = likedIds.includes(m.id) ? 2 : 1
    ;(m.genres || []).forEach((g) => {
      genreWeights[g] = (genreWeights[g] || 0) + weight
    })
  })

  const topGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g)

  const candidateMap = new Map()

  // For up to 5 prioritized seed movies, fetch TMDB recommendations & similar
  const prioritizedSeeds = [
    ...seedMovies.filter((m) => likedIds.includes(m.id)),
    ...seedMovies.filter((m) => !likedIds.includes(m.id)),
  ].slice(0, 5)

  if (env.tmdbApiKey) {
    await Promise.all(
      prioritizedSeeds.map(async (seed) => {
        if (!seed.tmdbId) return
        const isLiked = likedIds.includes(seed.id)
        let recs = await getRecommendationsForMovie(seed.tmdbId)
        if (recs.length < 5) {
          const similar = await getSimilarForMovie(seed.tmdbId)
          recs = [...recs, ...similar]
        }

        recs.forEach((rec) => {
          if (allKnownIds.has(rec.id) || allKnownIds.has(String(rec.tmdbId))) return

          // Compute scoring
          const genreOverlap = (rec.genres || []).filter((g) => genreWeights[g]).length
          const baseWeight = isLiked ? 3 : 2
          const score = baseWeight * 2 + genreOverlap * 1.5 + (rec.rating || 0) * 0.5
          const reason = seed?.title ? `Similar to ${seed.title}` : 'Picked for your taste'

          if (!candidateMap.has(rec.id) || candidateMap.get(rec.id).score < score) {
            candidateMap.set(rec.id, {
              ...rec,
              score,
              matchScore: Math.min(Math.round((score / 12) * 100), 99),
              reason,
            })
          }
        })
      })
    )
  }

  // If candidate pool is still low (< 10) or TMDB was offline, supplement from MongoDB catalog
  if (candidateMap.size < 10) {
    const catalog = await Movie.find({ movieId: { $nin: Array.from(allKnownIds) } }).lean()
    catalog.forEach((doc) => {
      const m = shapeCached(doc)
      const matchingGenre = (m.genres || []).find((g) => genreWeights[g])
      if (matchingGenre) {
        const score = (genreWeights[matchingGenre] || 1) + (m.rating || 0) * 0.5
        const reason = 'Picked for your taste'
        if (!candidateMap.has(m.id)) {
          candidateMap.set(m.id, {
            ...m,
            score,
            matchScore: Math.min(Math.round((score / 10) * 100), 95),
            reason,
          })
        }
      }
    })
  }

  const recommendations = Array.from(candidateMap.values())
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .slice(0, 20)

  res.json({
    success: true,
    data: {
      recommendations,
      topGenres: topGenres.slice(0, 3),
      isPersonalized: true,
      seedCount: allKnownIds.size,
    },
  })
}

