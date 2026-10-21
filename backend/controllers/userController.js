import User from '../models/User.js'

async function getUser(req) {
  return User.findById(req.auth.sub)
}

export async function getLibrary(req, res) {
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({ success: true, data: { likedIds: user.likedMovies, watchlistIds: user.watchlist } })
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
  res.json({ success: true, data: user.watchlist })
}

export async function addToWatchlist(req, res) {
  if (!ensureOwnUser(req, res)) return
  const movieId = String(req.body?.movieId || '').trim()
  if (!movieId) return res.status(400).json({ success: false, message: 'movieId is required' })
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.watchlist.includes(movieId)) user.watchlist.push(movieId)
  await user.save()
  res.status(201).json({ success: true, data: user.watchlist })
}

export async function removeFromWatchlist(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.watchlist = user.watchlist.filter((id) => id !== req.params.movieId)
  await user.save()
  res.json({ success: true, data: user.watchlist })
}

export async function likeMovie(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  if (!user.likedMovies.includes(req.params.movieId)) user.likedMovies.push(req.params.movieId)
  await user.save()
  res.status(201).json({ success: true, data: user.likedMovies })
}

export async function unlikeMovie(req, res) {
  if (!ensureOwnUser(req, res)) return
  const user = await getUser(req)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  user.likedMovies = user.likedMovies.filter((id) => id !== req.params.movieId)
  await user.save()
  res.json({ success: true, data: user.likedMovies })
}
