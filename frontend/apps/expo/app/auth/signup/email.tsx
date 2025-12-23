'use client'

import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../../../src/lib/api'
import { useAuth } from '../../../src/lib/auth'

const emailRegex = /.+@.+\..+/

export default function SignupEmailScreen() {
  const { requestSignupOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequest = async () => {
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!emailRegex.test(trimmed)) {
      setError('Enter a valid email.')
      return
    }
    setLoading(true)
    try {
      await requestSignupOtp({ email: trimmed })
      router.push({ pathname: '/auth/signup/otp', params: { email: trimmed } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} bg="$background" justifyContent="center" px="$6" gap="$4">
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$color12">
          Confirm your email
        </Text>
        <Paragraph color="$color11">We’ll send a secure 6-digit code to verify your email.</Paragraph>
      </YStack>

      <YStack gap="$2">
        <Text color="$color11">Email</Text>
        <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@coinpay.com" />
      </YStack>

      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

      <Button bg="$blue10" color="white" borderRadius="$6" onPress={handleRequest} disabled={loading}>
        {loading ? 'Sending secure code...' : 'Send secure code'}
      </Button>
    </YStack>
  )
}
