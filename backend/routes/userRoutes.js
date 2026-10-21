import { Router } from 'express'
import {
  getLibrary,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  likeMovie,
  unlikeMovie,
} from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()
router.use(requireAuth)
router.get('/me/library', asyncHandler(getLibrary))
router.get('/me/watchlist', asyncHandler(getWatchlist))
router.post('/me/watchlist', asyncHandler(addToWatchlist))
router.delete('/me/watchlist/:movieId', asyncHandler(removeFromWatchlist))
router.post('/me/like/:movieId', asyncHandler(likeMovie))
router.delete('/me/like/:movieId', asyncHandler(unlikeMovie))

router.get('/:userId/watchlist', asyncHandler(getWatchlist))
router.post('/:userId/watchlist', asyncHandler(addToWatchlist))
router.delete('/:userId/watchlist/:movieId', asyncHandler(removeFromWatchlist))
router.post('/:userId/like/:movieId', asyncHandler(likeMovie))
router.delete('/:userId/like/:movieId', asyncHandler(unlikeMovie))

export default router
