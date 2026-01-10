import { hashPassword, comparePasswords, generateToken, verifyToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'

// JWT_SECRET is set in jest.setup.ts globally
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'mySecretPassword'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toEqual(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })
  })

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'mySecretPassword'
      const hashedPassword = await hashPassword(password)
      const match = await comparePasswords(password, hashedPassword)
      expect(match).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'mySecretPassword'
      const wrongPassword = 'wrongPassword'
      const hashedPassword = await hashPassword(password)
      const match = await comparePasswords(wrongPassword, hashedPassword)
      expect(match).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'testUserId'
      const token = generateToken(userId)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWTs have 3 parts
    })

    it('should contain the correct userId in the token payload', () => {
      const userId = 'testUserId'
      const token = generateToken(userId)
      const decoded = jwt.decode(token) as jwt.JwtPayload
      expect(decoded.userId).toBe(userId)
    })
  })

  describe('verifyToken', () => {
    it('should successfully verify a valid token', () => {
      const userId = 'testUserId'
      const token = generateToken(userId)
      const decoded = verifyToken(token)
      expect(decoded.userId).toBe(userId)
    })

    it('should throw an error for an invalid token', () => {
      const invalidToken = 'invalid.jwt.token'
      expect(() => verifyToken(invalidToken)).toThrow()
    })

    it('should throw an error for an expired token', () => {
      const userId = 'testUserId'

      // Let's generate a token that is truly expired for testing purposes
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const trulyExpiredToken = jwt.sign({ userId, exp: pastTime }, TEST_JWT_SECRET);

      expect(() => verifyToken(trulyExpiredToken)).toThrow(jwt.TokenExpiredError)
    })
  })
})
