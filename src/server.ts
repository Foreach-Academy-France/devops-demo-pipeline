import express from 'express'
import type { Request, Response } from 'express'
import { healthRoutes } from './routes/health'
import { apiRoutes } from './routes/api'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Routes
app.use('/health', healthRoutes)
app.use('/api', apiRoutes)

// Root
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Demo CI/CD Pipeline API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  })
})

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' })
})

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
  })
}

export { app }
