import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../src/server'

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'healthy')
      expect(response.body).toHaveProperty('version')
      expect(response.body).toHaveProperty('timestamp')
    })
  })

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('users')
      expect(Array.isArray(response.body.users)).toBe(true)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app).get('/api/users/1')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('id', 1)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const newUser = {
        name: 'Charlie',
        email: 'charlie@example.com'
      }

      const response = await request(app)
        .post('/api/users')
        .send(newUser)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.name).toBe(newUser.name)
    })

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test' })  // Missing email

      expect(response.status).toBe(400)
    })
  })
})
