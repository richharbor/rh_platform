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
        <Text fontSize={24} fontWeight="700" color="$color12">
          Confirm your email
        </Text>
        <Paragraph color="$color11">We’ll lock this email to your account for secure access.</Paragraph>
      </YStack>
      <YStack gap="$2" bg="$color1" borderRadius="$8" p="$4" borderWidth={1} borderColor="$color3">
        <Text color="$color10" fontSize="$2" textTransform="uppercase" letterSpacing={2}>
          Primary email
        </Text>
        <Text fontSize={18} fontWeight="600" color="$color12">
          {user?.email || '—'}
        </Text>
        <Paragraph color="$color11" size="$2">
          You can update this later in settings after verification.
        </Paragraph>
      </YStack>
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.push('/account-setup/address')}>
        Continue to address
      </Button>
    </YStack>
  )
}
