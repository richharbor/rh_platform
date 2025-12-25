import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, XStack, YStack } from '@my/ui'

import { AuthLayout } from '../src/components/AuthLayout'
import { getErrorMessage } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'

const emailRegex = /.+@.+\..+/

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isDisabled = loading || !email || !password

  const handleSubmit = async () => {
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await signIn({ email: trimmedEmail, password })
      router.replace('/home')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to raise, refer, and track Richharbor leads."
      footer={
        <XStack justify="center" gap="$2" items="center">
          <Text color="$color11">New here?</Text>
          <Button
            chromeless
            onPress={() => router.replace('/signup')}
            color="$color12"
            fontWeight="700"
          >
            Create an account
          </Button>
        </XStack>
      }
    >
      <YStack gap="$3">
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
            placeholder="••••••••"
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
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </YStack>
    </AuthLayout>
  )
}
