'use client'

import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

const countries = ['United States', 'United Kingdom', 'Singapore', 'India', 'Bangladesh']

export default function AccountSetupCountry() {
  const { updateProfile } = useAuth()
  const [country, setCountry] = useState(countries[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await updateProfile({ country })
      router.replace('/account-setup/welcome')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} bg="$background" justifyContent="center" px="$6" gap="$3">
      <YStack gap="$2">
        <Text fontSize={24} fontWeight="700" color="$color12">
          Country of residence
        </Text>
        <Paragraph color="$color11">We’ll tailor compliance and currency details to your location.</Paragraph>
      </YStack>

      <YStack gap="$2">
        {countries.map((c) => (
          <Button
            key={c}
            chromeless
            borderRadius="$6"
            borderWidth={1}
            borderColor={country === c ? '$blue10' : '$color4'}
            color="$color12"
            onPress={() => setCountry(c)}
          >
            {c}
          </Button>
        ))}
      </YStack>

      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}

      <Button bg="$blue10" color="white" borderRadius="$6" onPress={handleSubmit} disabled={loading}>
        {loading ? 'Saving preference...' : 'Continue'}
      </Button>
    </YStack>
  )
}
