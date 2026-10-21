import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signToken } from '../middleware/auth.js'

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
})

export async function register(req, res) {
  const { name, email, password } = req.body || {}
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Name, email, and a password of at least 8 characters are required' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' })
  }
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) })
  res.status(201).json({ success: true, data: { token: signToken(user), user: publicUser(user) } })
}

export async function login(req, res) {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' })
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }
  res.json({ success: true, data: { token: signToken(user), user: publicUser(user) } })
}

export async function getMe(req, res) {
  const user = await User.findById(req.auth.sub)
  if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' })
  res.json({ success: true, data: publicUser(user) })
}
