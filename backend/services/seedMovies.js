import Movie from '../models/Movie.js'
import movies from '../data/movies.js'

export async function seedMovies() {
  if (await Movie.countDocuments()) return
  await Movie.insertMany(movies.map((movie) => ({ movieId: movie.id, title: movie.title, year: movie.year, genres: movie.genres, rating: movie.rating, poster: movie.poster, alt: movie.alt, description: movie.description })))
  console.log(`Seeded ${movies.length} movies into MongoDB`)
}
