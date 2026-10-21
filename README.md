# Cinematch

**Find your next favorite movie.**

Cinematch is a full-stack movie recommendation and discovery web application designed to help users explore films based on their taste, mood, and personal library.

## Features

- **Browse & Discover:** Trending and popular curated carousels, genre explorer, release year, and minimum rating filters.
- **Search:** Instant debounced title search from both the navigation bar and Discover view.
- **Personalized Recommendations:** Rule-based matching engine weighting your liked and watchlisted genres.
- **Taste DNA:** Dynamic genre affinity graph and top genre calibration calculated from your real movie habits.
- **Watchlist & Likes:** Seamlessly save and like films, stored securely in MongoDB Atlas.
- **User Authentication:** JWT-based signup and login system.
- **TMDB Integration:** Live movie metadata and posters fetched dynamically with automatic fallback caching.

## Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3 ("Cinematic Obsidian" theme)
- **Backend:** Node.js (ES Modules), Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **External Data:** TMDB API (The Movie Database v3)

## Project Structure

```
Cinematch/
├── backend/                  # Express.js API server
│   ├── config/              # Database and environment configuration
│   ├── controllers/         # Auth, movie, and user route controllers
│   ├── models/              # Mongoose schemas (Movie, User)
│   ├── routes/              # Express API routes (/api/*)
│   ├── services/            # TMDB integration and movie seeding
│   ├── .env.example         # Backend environment template
│   └── server.js            # Server entry point
├── src/                     # React + Vite frontend
│   ├── components/          # Reusable UI views and cards
│   ├── context/             # LibraryContext (auth, watchlist, likes)
│   ├── services/            # API client service
│   ├── App.jsx              # Main view switcher
│   └── main.jsx             # React DOM entry
├── .env.example             # Frontend environment template
└── package.json             # Root scripts and dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18+) and npm
- MongoDB Atlas connection string (or local MongoDB)
- TMDB API key (optional; defaults to cached catalog if absent)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lipiroy558-cloud/Cinematch.git
   cd Cinematch
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the root directory:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     ```
   - Copy `backend/.env.example` to `backend/.env`:
     ```env
     PORT=5000
     FRONTEND_ORIGIN=http://localhost:5173
     MONGODB_URI=your-mongodb-atlas-uri
     JWT_SECRET=your-jwt-secret
     TMDB_API_KEY=your-tmdb-api-key
     TMDB_LANGUAGE=en-US
     ```

### Running Locally

You can run both the frontend and backend with these commands:

1. **Start the backend server:**
   ```bash
   npm run server
   ```
   *(Listens on http://localhost:5000)*

2. **Start the frontend in another terminal:**
   ```bash
   npm run dev
   ```
   *(Opens on http://localhost:5173)*

### Production Build & Deployment

To build the client for production:
```bash
npm run build
```

When deployed to production (e.g., Render, Railway), the Express server in `backend/server.js` automatically serves the built frontend assets from `dist/` alongside the `/api` endpoints on a single port:
```bash
npm run server:start
```

## Environment Variables Note

Keep your real `.env` files private. Never commit `.env` files containing live credentials to GitHub. Always use `.env.example` to document the required variable names with placeholder values.

## Author

**Lipi Roy**  
GitHub: [@lipiroy558-cloud](https://github.com/lipiroy558-cloud)
