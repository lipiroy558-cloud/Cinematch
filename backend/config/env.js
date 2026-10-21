import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'cinematch-jwt-secret-key-fallback-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbLanguage: process.env.TMDB_LANGUAGE || 'en-US',
}
