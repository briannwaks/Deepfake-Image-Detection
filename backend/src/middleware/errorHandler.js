import logger from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path })

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
  })
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
}
