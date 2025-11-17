import { Router } from 'express'
import type { Request, Response } from 'express'

const router = Router()

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
]

router.get('/users', (_req: Request, res: Response) => {
  res.json({ users })
})

router.get('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const user = users.find(u => u.id === id)

  if (user) {
    res.json({ user })
  } else {
    res.status(404).json({ error: 'User not found' })
  }
})

router.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body

  if (!name || !email) {
    res.status(400).json({ error: 'Missing name or email' })
    return
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email
  }

  users.push(newUser)
  res.status(201).json({ user: newUser })
})

export { router as apiRoutes }
