import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase() {
  mongoose.set('bufferCommands', false)
  mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message))
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000, tlsAllowInvalidCertificates: true })
  console.log('CineMatch database connected')
}
