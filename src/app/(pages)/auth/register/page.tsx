'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import RegistrationForm from '@/app/(components)/ui/RegistrationForm'
import { useAuth } from '@/lib/auth-context' // Import useAuth

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth() // Even if not used directly for registration, it's good to have the context

  const handleRegister = async (credentials: { username: string; password: string }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      // Automatically log in after successful registration or redirect to login page
      // For now, redirect to login page
      router.push('/auth/login?registered=true')
    } catch (err) {
      setError('Network error or server unavailable')
      console.error('Registration client-side error:', err)
    } finally {
      setLoading(false)
    }
  }

  return <RegistrationForm onSubmit={handleRegister} loading={loading} error={error} />
}
