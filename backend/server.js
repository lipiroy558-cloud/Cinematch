import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { env } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { seedMovies } from './services/seedMovies.js'
import movieRoutes from './routes/movieRoutes.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: env.frontendOrigin }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CineMatch backend is running' })
})

app.use('/api/movies', movieRoutes)
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)

// Serve frontend build in production if dist/ exists
const clientDist = path.resolve(__dirname, '../dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Must be registered last: 404 handler, then the centralized error handler.
app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.port, () => {
    console.log(`CineMatch backend listening on http://localhost:${env.port}`)
  })
  connectDatabase()
    .then(seedMovies)
    .catch((error) => {
      console.warn(`Database connection notice: ${error.message}`)
    })
}

export default app
