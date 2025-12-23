'use client'

import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { Button, Input, Paragraph, Text, XStack, YStack } from '@my/ui'

import { getErrorMessage } from '../../../src/lib/api'
import { useAuth } from '../../../src/lib/auth'

export default function SignupOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>()
  const { verifySignupOtp, requestSignupOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setError('')
    if (!email) {
      setError('Missing email. Go back and try again.')
      return
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const signupToken = await verifySignupOtp({ email, otp })
      router.push({ pathname: '/auth/signup/create', params: { email, signupToken } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    try {
      await requestSignupOtp({ email })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background" justifyContent="center" padding="$6" gap="$4">
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$color12">
          Confirm your email
        </Text>
        <Paragraph color="$color11">Enter the 6-digit code we sent to {email || 'your email'}.</Paragraph>
      </YStack>

      <Input
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
        fontSize={22}
        letterSpacing={4}
      />

      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

      <Button backgroundColor="$blue10" color="white" borderRadius="$6" onPress={handleVerify} disabled={loading}>
        {loading ? 'Verifying code...' : 'Verify & continue'}
      </Button>
      <XStack justifyContent="center">
        <Button chromeless onPress={handleResend} color="$blue10">
          Resend code
        </Button>
      </XStack>
    </YStack>
  )
}
