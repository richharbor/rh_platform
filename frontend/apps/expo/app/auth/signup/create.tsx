'use client'

import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { Button, Input, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../../../src/lib/api'
import { useAuth } from '../../../src/lib/auth'

export default function SignupCreateAccount() {
  const { signupToken, email } = useLocalSearchParams<{ signupToken?: string; email?: string }>()
  const { completeSignup } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!signupToken) {
      setError('Missing signup token. Restart signup.')
      return
    }
    if (!phone) {
      setError('Enter your phone.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await completeSignup({ signup_token: signupToken, phone, password })
      router.replace('/account-setup/email')
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
          Create account
        </Text>
        <Paragraph color="$color11">Phone required to secure your account.</Paragraph>
        {email ? <Paragraph color="$color10">Email: {email}</Paragraph> : null}
      </YStack>

      <YStack gap="$2">
        <Text color="$color11">Phone</Text>
        <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+880..." />
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Password</Text>
        <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="********" />
      </YStack>

      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

      <Button bg="$blue10" color="white" borderRadius="$6" onPress={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create account'}
      </Button>
    </YStack>
  )
}

