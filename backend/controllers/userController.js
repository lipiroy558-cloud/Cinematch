import mongoose from 'mongoose'
import User from '../models/User.js'
import { inMemoryUsers } from '../models/inMemoryUserStore.js'
import { connectDatabase } from '../config/database.js'

async function getUser(req) {
  await connectDatabase()
  const userId = req.auth.sub

  if (mongoose.connection.readyState === 1 && !String(userId).startsWith('user_')) {
    try {
      const user = await User.findById(userId)
      if (user) return user
    } catch (err) {
      console.warn('MongoDB getUser notice:', err.message)
    }
  }

  const memoryUser = inMemoryUsers.get(userId) || inMemoryUsers.get(req.auth.email)
  if (memoryUser) {
    if (!memoryUser.likedMovies) memoryUser.likedMovies = []
    if (!memoryUser.watchlist) memoryUser.watchlist = []
    return {
      ...memoryUser,
      save: async function () {
        inMemoryUsers.set(memoryUser._id, memoryUser)
        inMemoryUsers.set(memoryUser.email, memoryUser)
      },
    }
  }

  return null
}

export async function getLibrary(req, res) {
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({
    success: true,
    data: { likedIds: user.likedMovies || [], watchlistIds: user.watchlist || [] },
  })
}

function ensureOwnUser(req, res) {
  if (req.params.userId && req.params.userId !== req.auth.sub) {
    res.status(403).json({ success: false, message: 'You may only modify your own library' })
    return false
  }
  return true
}

export async function getWatchlist(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({ success: true, data: user.watchlist || [] })
}

export async function addToWatchlist(req, res) {
  if (!ensureOwnUser(req, res)) return
  const movieId = String(req.body?.movieId || '').trim()
  if (!movieId) return res.status(400).json({ success: false, message: 'movieId is required' })
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.watchlist) user.watchlist = []
  if (!user.watchlist.includes(movieId)) user.watchlist.push(movieId)
  await user.save()
  res.status(201).json({ success: true, data: user.watchlist })
}

export async function removeFromWatchlist(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.watchlist) user.watchlist = []
  user.watchlist = user.watchlist.filter((id) => id !== req.params.movieId)
  await user.save()
  res.json({ success: true, data: user.watchlist })
}

export async function likeMovie(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.likedMovies) user.likedMovies = []
  if (!user.likedMovies.includes(req.params.movieId)) user.likedMovies.push(req.params.movieId)
  await user.save()
  res.status(201).json({ success: true, data: user.likedMovies })
}

export async function unlikeMovie(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.likedMovies) user.likedMovies = []
  user.likedMovies = user.likedMovies.filter((id) => id !== req.params.movieId)
  await user.save()
  res.json({ success: true, data: user.likedMovies })
}
