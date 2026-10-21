import { Router } from 'express'
import {
  getAllMovies,
  getMovieById,
  searchMovies,
  getMoviesByGenre,
  getTopRated,
  getTrendingMovies,
  getPopularMovies,
  getPersonalizedRecommendations,
} from '../controllers/movieController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// NOTE: these specific routes must be registered before the generic
// '/:id' route below, otherwise Express would match "search" or
// "top-rated" as if they were a movie id.
router.get('/recommendations', optionalAuth, asyncHandler(getPersonalizedRecommendations))
router.get('/search', asyncHandler(searchMovies))
router.get('/trending', asyncHandler(getTrendingMovies))
router.get('/popular', asyncHandler(getPopularMovies))
router.get('/top-rated', asyncHandler(getTopRated))
router.get('/genre/:genre', asyncHandler(getMoviesByGenre))
router.get('/:id', asyncHandler(getMovieById))
router.get('/', asyncHandler(getAllMovies))

export default router
