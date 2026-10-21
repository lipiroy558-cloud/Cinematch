import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    genres: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    poster: { type: String, default: '' },
    backdrop: { type: String, default: '' },
    alt: { type: String, default: '' },
    year: { type: Number },
    releaseDate: { type: String },
    tmdbId: { type: Number },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Movie', movieSchema)
