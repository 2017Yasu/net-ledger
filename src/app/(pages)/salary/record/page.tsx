'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import SalaryForm from '@/app/(components)/ui/SalaryForm'
import { useAuth } from '@/lib/auth-context'
import { Alert, Container, Box, Typography } from '@mui/material'

export default function RecordSalaryPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (formData: any) => {
    if (!token) {
      setError('You must be logged in to record salary.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to record salary.')
        return
      }

      setSuccess('Salary record created successfully!')
      // Optionally redirect or clear form
      // router.push('/history')
    } catch (err) {
      setError('Network error or server unavailable.')
      console.error('Record salary client-side error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning">Please log in to record your salary.</Alert>
          <Button onClick={() => router.push('/auth/login')} sx={{ mt: 2 }} variant="contained">
            Go to Login
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <SalaryForm
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  )
}
