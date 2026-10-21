import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' })

  try {
    req.auth = jwt.verify(token, env.jwtSecret)
    return next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}
