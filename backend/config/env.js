import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://lipiroyyy68_db_user:YYmpsgJbY5iy8Sgn@cinematch.24uezo4.mongodb.net/?appName=Cinematch',
  jwtSecret: process.env.JWT_SECRET || 'cinematch-jwt-secret-key-fallback-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  tmdbApiKey: process.env.TMDB_API_KEY || 'bc0ad1b6c5aa93f7633b2744aaf69dd6',
  tmdbLanguage: process.env.TMDB_LANGUAGE || 'en-US',
}
