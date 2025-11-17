import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

router.get('/ready', (_req: Request, res: Response) => {
  // Simulate readiness check
  const isReady = true // In real app: check DB connection, etc.

  if (isReady) {
    res.json({ ready: true })
  } else {
    res.status(503).json({ ready: false })
  }
})

router.get('/live', (_req: Request, res: Response) => {
  // Liveness probe (always returns OK if server is running)
  res.json({ alive: true })
})

export { router as healthRoutes }
