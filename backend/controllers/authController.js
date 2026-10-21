import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { inMemoryUsers } from '../models/inMemoryUserStore.js'
import { signToken } from '../middleware/auth.js'
import { connectDatabase } from '../config/database.js'

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
})

export async function register(req, res) {
  const { name, email, password } = req.body || {}
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and a password of at least 8 characters are required',
    })
  }

  const normalizedEmail = email.trim().toLowerCase()
  await connectDatabase()

  if (mongoose.connection.readyState === 1) {
    try {
      if (await User.exists({ email: normalizedEmail })) {
        return res.status(409).json({ success: false, message: 'An account with that email already exists' })
      }
      const passwordHash = await bcrypt.hash(password, 12)
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      })
      return res.status(201).json({ success: true, data: { token: signToken(user), user: publicUser(user) } })
    } catch (err) {
      console.warn('MongoDB register notice:', err.message)
    }
  }

  // In-memory registration fallback if MongoDB is not reachable
  if (inMemoryUsers.has(normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const fallbackId = `user_${Date.now()}`
  const user = {
    _id: fallbackId,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    likedMovies: [],
    watchlist: [],
  }
  inMemoryUsers.set(normalizedEmail, user)
  inMemoryUsers.set(fallbackId, user)

  res.status(201).json({ success: true, data: { token: signToken(user), user: publicUser(user) } })
}

export async function login(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  await connectDatabase()

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
      if (user) {
        const matches = await bcrypt.compare(password, user.passwordHash)
        if (!matches) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' })
        }
        return res.json({ success: true, data: { token: signToken(user), user: publicUser(user) } })
      }
    } catch (err) {
      console.warn('MongoDB login notice:', err.message)
    }
  }

  // Check in-memory store
  const memoryUser = inMemoryUsers.get(normalizedEmail)
  if (memoryUser) {
    const matches = await bcrypt.compare(password, memoryUser.passwordHash)
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    return res.json({ success: true, data: { token: signToken(memoryUser), user: publicUser(memoryUser) } })
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' })
}

export async function getMe(req, res) {
  await connectDatabase()

  if (mongoose.connection.readyState === 1 && !String(req.auth.sub).startsWith('user_')) {
    try {
      const user = await User.findById(req.auth.sub)
      if (user) return res.json({ success: true, data: publicUser(user) })
    } catch (err) {
      console.warn('MongoDB getMe notice:', err.message)
    }
  }

  const memoryUser = inMemoryUsers.get(req.auth.sub) || inMemoryUsers.get(req.auth.email)
  if (memoryUser) return res.json({ success: true, data: publicUser(memoryUser) })

  res.status(401).json({ success: false, message: 'User no longer exists' })
}
