'use client'

import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

export default function AccountSetupAddress() {
  const { updateProfile } = useAuth()
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!addressLine || !city || !postcode) {
      setError('Please fill all fields.')
      return
    }
    setLoading(true)
    try {
      await updateProfile({ address_line: addressLine, city, postcode })
      router.push('/account-setup/personal')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack flex={1} bg="$background" justifyContent="center" px="$6" gap="$3">
      <YStack gap="$2">
        <Text fontSize={22} fontWeight="700" color="$color12">
          Home address
        </Text>
        <Paragraph color="$color11">This info needs to be accurate with your ID document.</Paragraph>
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Address Line</Text>
        <Input value={addressLine} onChangeText={setAddressLine} placeholder="123 Main St" />
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">City</Text>
        <Input value={city} onChangeText={setCity} placeholder="City, State" />
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Postcode</Text>
        <Input value={postcode} onChangeText={setPostcode} placeholder="Ex: 00000" keyboardType="number-pad" />
      </YStack>
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Continue'}
      </Button>
    </YStack>
  )
}

