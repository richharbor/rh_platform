'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Paragraph, Text, YStack } from '@my/ui'

const emailRegex = /.+@.+\..+/

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = getCookie('admin_token')
    if (token) {
      router.replace('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async () => {
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(trimmedEmail)) {
      setError('Enter a valid email.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error((data && data.detail) || 'Login failed')
      }
      const data = await res.json()
      setCookie('admin_token', data.access_token)
      setCookie('admin_refresh', data.refresh_token || '')
      router.replace('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack minHeight="100vh" alignItems="center" justifyContent="center" bg="$background">
      <YStack width={360} bg="$color1" p="$5" borderRadius="$7" borderWidth={1} borderColor="$color3" gap="$3">
        <Text fontSize={22} fontWeight="700" color="$color12">
          Admin Login
        </Text>
        <YStack gap="$2">
          <Text color="$color11">Email</Text>
          <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Password</Text>
          <Input value={password} onChangeText={setPassword} secureTextEntry />
        </YStack>
        {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
        <Button bg="$color12" color="white" onPress={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </YStack>
    </YStack>
  )
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
