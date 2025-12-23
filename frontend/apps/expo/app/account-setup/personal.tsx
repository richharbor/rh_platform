'use client'

import { useState } from 'react'
import { router } from 'expo-router'
import { Button, Input, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

export default function AccountSetupPersonal() {
  const { updateProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!fullName || !username || !dob) {
      setError('Please fill all fields.')
      return
    }
    setLoading(true)
    try {
      await updateProfile({ full_name: fullName, username, dob })
      router.push('/account-setup/country')
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
          Add your personal info
        </Text>
        <Paragraph color="$color11">This info needs to be accurate with your ID document.</Paragraph>
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Full Name</Text>
        <Input value={fullName} onChangeText={setFullName} placeholder="Mr. John Doe" />
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Username</Text>
        <Input value={username} onChangeText={setUsername} placeholder="@username" autoCapitalize="none" />
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Date of Birth</Text>
        <Input value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />
      </YStack>
      {error ? <Paragraph color="$red10">{error}</Paragraph> : null}
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Continue'}
      </Button>
    </YStack>
  )
}

