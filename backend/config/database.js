import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI not provided; running in local catalog fallback mode.')
    return
  }
  mongoose.set('bufferCommands', false)
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message))
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000, tlsAllowInvalidCertificates: true })
    console.log('CineMatch database connected')
  } catch (error) {
    console.warn(`Database connection notice: ${error.message}`)
  }
}
