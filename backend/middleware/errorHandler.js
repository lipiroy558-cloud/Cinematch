// 404 handler — runs when no route above matched the request.
export function notFound(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

// Centralized error handler. Any controller that calls `next(err)`, or an
// error thrown inside an Express route handler, ends up here. Keeping this
// last in the middleware chain in server.js is what makes it work.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || (err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500)
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message || 'Request failed',
  })
}
