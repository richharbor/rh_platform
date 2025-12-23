'use client'

import { useEffect } from 'react'
import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack, Input } from '@my/ui'

import { useAuth } from '../../src/lib/auth'

export default function AccountSetupEmail() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login')
    }
  }, [user])

  return (
    <YStack flex={1} bg="$background" justifyContent="center" px="$6" gap="$4">
      <YStack gap="$2">
        <Text fontSize={22} fontWeight="700" color="$color12">
          Add your email
        </Text>
        <Paragraph color="$color11">This info needs to be accurate with your ID document.</Paragraph>
      </YStack>
      <YStack gap="$2">
        <Text color="$color11">Email</Text>
        <Input value={user?.email || ''} editable={false} />
      </YStack>
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.push('/account-setup/address')}>
        Continue
      </Button>
    </YStack>
  )
}

