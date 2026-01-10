import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // In a real application, server-side logout might involve:
  // 1. Invalidating the JWT on the server (e.g., adding to a blacklist)
  // 2. Clearing server-side session data if applicable
  // For now, we assume client-side token removal is sufficient for logout.

  // Simulate a successful logout
  return new NextResponse(null, { status: 204 })
}
