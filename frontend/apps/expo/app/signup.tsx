import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, XStack, YStack } from '@my/ui'

import { AuthLayout } from '../src/components/AuthLayout'
import { getErrorMessage } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'

const emailRegex = /.+@.+\..+/

export default function SignupScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isDisabled = loading || !email || !password || !confirmPassword

  const handleSubmit = async () => {
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp({
        email: trimmedEmail,
        password,
        name: name.trim() ? name.trim() : undefined,
      })
      router.replace('/onboarding/welcome')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your vault"
      subtitle="Join Rich Harbor in minutes. We'll keep it crisp and secure."
      footer={
        <XStack justify="center" gap="$2" items="center">
          <Text color="$color11">Already have an account?</Text>
          <Button
            chromeless
            onPress={() => router.replace('/login')}
            color="$color12"
            fontWeight="700"
          >
            Sign in
          </Button>
        </XStack>
      }
    >
      <YStack gap="$3">
        <YStack gap="$2">
          <Text color="$color11">Full name</Text>
          <Input
            value={name}
            onChangeText={(value) => {
              setName(value)
              if (error) setError('')
            }}
            placeholder="Prabhat Mehta"
            autoCapitalize="words"
            textContentType="name"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Email</Text>
          <Input
            value={email}
            onChangeText={(value) => {
              setEmail(value)
              if (error) setError('')
            }}
            placeholder="you@richharbor.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCorrect={false}
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Password</Text>
          <Input
            value={password}
            onChangeText={(value) => {
              setPassword(value)
              if (error) setError('')
            }}
            placeholder="Minimum 8 characters"
            secureTextEntry
            textContentType="newPassword"
          />
        </YStack>
        <YStack gap="$2">
          <Text color="$color11">Confirm password</Text>
          <Input
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value)
              if (error) setError('')
            }}
            placeholder="Re-enter your password"
            secureTextEntry
            textContentType="password"
          />
        </YStack>
        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}
        <Button
          onPress={handleSubmit}
          disabled={isDisabled}
          bg="$color12"
          color="white"
          borderRadius="$6"
          pressStyle={{ opacity: 0.85 }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </YStack>
    </AuthLayout>
  )
}
