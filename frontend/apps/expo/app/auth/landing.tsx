'use client'

import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack } from '@my/ui'

export default function AuthLanding() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" bg="$background" gap="$4" px="$6">
      <YStack gap="$2" alignItems="center">
        <Text fontSize={24} fontWeight="700" color="$color12">
          Create your Coinpay account
        </Text>
        <Paragraph color="$color11" textAlign="center">
          Coinpay helps you send, receive, and track your transactions securely.
        </Paragraph>
      </YStack>
      <YStack gap="$3" width="100%">
        <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.push('/auth/signup/email')}>
          Sign up
        </Button>
        <Button bg="$color3" color="$color12" borderRadius="$6" onPress={() => router.push('/auth/login')}>
          Log in
        </Button>
      </YStack>
    </YStack>
  )
}

