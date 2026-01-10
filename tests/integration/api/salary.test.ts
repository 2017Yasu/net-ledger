import { POST as createSalaryPOST, GET as listSalaryGET } from '@/app/api/salary/route'
import {
  GET as getSalaryGET,
  PUT as updateSalaryPUT,
  DELETE as deleteSalaryDELETE,
} from '@/app/api/salary/[recordId]/route'
import prisma from '@/lib/prisma' // This will now correctly resolve to the mocked default export
import { Decimal } from '@/lib/prisma' // This will now correctly resolve to the mocked named export Decimal
import { hashPassword, generateToken } from '@/lib/auth'
import { NextRequest } from 'next/server' // Import NextRequest
import jwt from 'jsonwebtoken'
import { Decimal as MockDecimalClass } from '__mocks__/@prisma/client' // Import our mock Decimal class directly


// Define mockPrismaClient and MockDecimalClass at the top-level
// so they are hoisted and available when jest.mock is evaluated.
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  salaryRecord: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  Decimal: MockDecimalClass, // Expose MockDecimalClass here as well
};

// Mock the entire @/lib/prisma module to control both default and named exports
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrismaClient, // Default export is the mocked PrismaClient instance
  Decimal: MockDecimalClass, // Named export for Decimal, using our custom mock Decimal
}));

// Mock JWT_SECRET for testing
process.env.JWT_SECRET = 'test_secret_for_salary_integration'

const mockUserId = 'user-test-id'
const mockToken = generateToken(mockUserId)
const mockUser = {
  id: mockUserId,
  username: 'testuser',
  passwordHash: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Helper to create a mock NextRequest
const createMockRequest = (
  method: string,
  body?: any,
  token?: string,
  params?: { [key: string]: string },
): NextRequest => {
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (body) {
    headers.set('Content-Type', 'application/json')
  }

  // NextRequest doesn't directly take a `json` method, it expects `request.json()`
  // For mocking, we can simulate it with a body property and a json method on it
  return {
    method: method,
    headers: headers,
    json: async () => body,
    cookies: {
        get: (name: string) => {
            if (name === 'token' && token) {
                return { value: token, name: 'token' }
            }
            return undefined
        }
    },
    url: params ? `http://localhost/api/salary/${params.recordId}` : 'http://localhost/api/salary'
  } as unknown as NextRequest // Cast to unknown then NextRequest to satisfy TS
}

describe('SalaryRecord API Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks on prisma client methods
    jest.clearAllMocks()
    ;(mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser) // Mock user always exists
    // Set up mock implementations for prisma methods
    ;(mockPrismaClient.salaryRecord.create as jest.Mock).mockImplementation((data) => ({
      id: 'mock-record-id',
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data.data,
      baseSalary: new Decimal(data.data.baseSalary),
      grossEarnings: new Decimal(data.data.grossEarnings),
      netPay: new Decimal(data.data.netPay),
    }))
    ;(mockPrismaClient.salaryRecord.findFirst as jest.Mock).mockResolvedValue(null)
    ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(null)
    ;(mockPrismaClient.salaryRecord.update as jest.Mock).mockImplementation((args) => ({
      id: args.where.id,
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure that Decimal fields in the returned object are instances of Decimal
      baseSalary: args.data.baseSalary !== undefined ? new Decimal(args.data.baseSalary) : new Decimal(0),
      grossEarnings: args.data.grossEarnings !== undefined ? new Decimal(args.data.grossEarnings) : new Decimal(0),
      netPay: args.data.netPay !== undefined ? new Decimal(args.data.netPay) : new Decimal(0),
      ...args.data,
    }))
    ;(mockPrismaClient.salaryRecord.delete as jest.Mock).mockResolvedValue({})
    ;(mockPrismaClient.salaryRecord.findMany as jest.Mock).mockResolvedValue([])
  })

  // Mock getUserIdFromRequest since it's used in all salary routes
  jest.mock('@/lib/server-auth', () => ({
    getUserIdFromRequest: jest.fn((req: NextRequest) => {
        const authHeader = req.headers.get('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
                return decoded.userId
            } catch (error) {
                return null
            }
        }
        return null
    }),
  }))


  describe('POST /api/salary', () => {
    const validSalaryData = {
      month: 1,
      year: 2023,
      baseSalary: 1000,
      grossEarnings: 1200,
      netPay: 800,
    }

    it('should create a salary record successfully', async () => {
      // prisma.salaryRecord.create mock is already set in beforeEach
      const request = createMockRequest('POST', validSalaryData, mockToken)
      const response = await createSalaryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.userId).toBe(mockUserId)
      expect(mockPrismaClient.salaryRecord.create).toHaveBeenCalledTimes(1)
    })

    it('should return 401 if unauthorized', async () => {
      const request = createMockRequest('POST', validSalaryData) // No token
      const response = await createSalaryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 409 if record for month/year already exists', async () => {
      ;(mockPrismaClient.salaryRecord.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-record' })

      const request = createMockRequest('POST', validSalaryData, mockToken)
      const response = await createSalaryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.message).toContain('already exists')
    })

    it('should return 400 for invalid input (e.g., negative baseSalary)', async () => {
      const invalidData = { ...validSalaryData, baseSalary: -100 }
      const request = createMockRequest('POST', invalidData, mockToken)
      const response = await createSalaryPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('baseSalary cannot be negative.')
    })
  })

  describe('PUT /api/salary/{recordId}', () => {
    const recordId = 'record-to-update'
    const existingRecord = {
      id: recordId,
      userId: mockUserId,
      month: 1,
      year: 2023,
      baseSalary: new Decimal(1000), // Use imported Decimal
      grossEarnings: new Decimal(1200), // Use imported Decimal
      netPay: new Decimal(800), // Use imported Decimal
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updateData = {
        month: 1, // Add required fields for validation
        year: 2023, // Add required fields for validation
        baseSalary: 1100,
        grossEarnings: 1300,
        netPay: 900,
    }

    it('should update a salary record successfully', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(existingRecord)
      // prisma.salaryRecord.update mock is set in beforeEach
      const request = createMockRequest('PUT', updateData, mockToken, { recordId })
      const response = await updateSalaryPUT(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(recordId)
      expect(data.baseSalary.toNumber()).toBe(updateData.baseSalary)
      expect(mockPrismaClient.salaryRecord.update).toHaveBeenCalledTimes(1)
    })

    it('should return 401 if unauthorized', async () => {
      const request = createMockRequest('PUT', updateData, undefined, { recordId }) // No token
      const response = await updateSalaryPUT(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 404 if record not found', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(null)

      const request = createMockRequest('PUT', updateData, mockToken, { recordId })
      const response = await updateSalaryPUT(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('Salary record not found')
    })

    it('should return 403 if user does not own the record', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue({
        ...existingRecord,
        userId: 'other-user-id',
      })

      const request = createMockRequest('PUT', updateData, mockToken, { recordId })
      const response = await updateSalaryPUT(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Forbidden')
    })

    it('should return 400 for invalid input (e.g., negative baseSalary in update)', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(existingRecord)
      const invalidUpdate = { month:1, year:2023, grossEarnings:100, netPay:100, baseSalary: -50 } // Ensure all required fields for validation
      const request = createMockRequest('PUT', invalidUpdate, mockToken, { recordId })
      const response = await updateSalaryPUT(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('baseSalary cannot be negative.')
    })
  })

  describe('GET /api/salary/{recordId}', () => {
    const recordId = 'record-to-get'
    const existingRecord = {
      id: recordId,
      userId: mockUserId,
      month: 2,
      year: 2023,
      baseSalary: new Decimal(1500), // Use imported Decimal
      grossEarnings: new Decimal(1800), // Use imported Decimal
      netPay: new Decimal(1200), // Use imported Decimal
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should get a salary record successfully', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(existingRecord)

      const request = createMockRequest('GET', undefined, mockToken, { recordId })
      const response = await getSalaryGET(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(recordId)
      expect(data.baseSalary.toNumber()).toBe(existingRecord.baseSalary.toNumber())
    })

    it('should return 401 if unauthorized', async () => {
      const request = createMockRequest('GET', undefined, undefined, { recordId }) // No token
      const response = await getSalaryGET(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 404 if record not found', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(null)

      const request = createMockRequest('GET', undefined, mockToken, { recordId })
      const response = await getSalaryGET(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('Salary record not found')
    })

    it('should return 403 if user does not own the record', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue({
        ...existingRecord,
        userId: 'other-user-id',
      })

      const request = createMockRequest('GET', undefined, mockToken, { recordId })
      const response = await getSalaryGET(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Forbidden')
    })
  })

  describe('DELETE /api/salary/{recordId}', () => {
    const recordId = 'record-to-delete'
    const existingRecord = {
      id: recordId,
      userId: mockUserId,
      month: 3,
      year: 2023,
      baseSalary: new Decimal(2000), // Use imported Decimal
      grossEarnings: new Decimal(2500), // Use imported Decimal
      netPay: new Decimal(1800), // Use imported Decimal
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should delete a salary record successfully', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(existingRecord)
      ;(mockPrismaClient.salaryRecord.delete as jest.Mock).mockResolvedValue(existingRecord)

      const request = createMockRequest('DELETE', undefined, mockToken, { recordId })
      const response = await deleteSalaryDELETE(request, { params: { recordId } })

      expect(response.status).toBe(204)
      expect(mockPrismaClient.salaryRecord.delete).toHaveBeenCalledWith({ where: { id: recordId } })
    })

    it('should return 401 if unauthorized', async () => {
      const request = createMockRequest('DELETE', undefined, undefined, { recordId }) // No token
      const response = await deleteSalaryDELETE(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 404 if record not found', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue(null)

      const request = createMockRequest('DELETE', undefined, mockToken, { recordId })
      const response = await deleteSalaryDELETE(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.message).toBe('Salary record not found')
    })

    it('should return 403 if user does not own the record', async () => {
      ;(mockPrismaClient.salaryRecord.findUnique as jest.Mock).mockResolvedValue({
        ...existingRecord,
        userId: 'other-user-id',
      })

      const request = createMockRequest('DELETE', undefined, mockToken, { recordId })
      const response = await deleteSalaryDELETE(request, { params: { recordId } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Forbidden')
    })
  })
})