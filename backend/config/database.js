import mongoose from 'mongoose'
import { env } from './env.js'

let cachedPromise = null

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }
  if (!env.mongoUri) {
    return null
  }
  if (cachedPromise) {
    try {
      await cachedPromise
      if (mongoose.connection.readyState === 1) return mongoose.connection
    } catch {
      cachedPromise = null
    }
  }

  mongoose.set('bufferCommands', false)
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message))

  cachedPromise = mongoose
    .connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      tlsAllowInvalidCertificates: true,
    })
    .then((m) => {
      console.log('CineMatch database connected')
      return m.connection
    })
    .catch((error) => {
      console.warn(`Database connection notice: ${error.message}`)
      cachedPromise = null
      return null
    })

  return cachedPromise
}
