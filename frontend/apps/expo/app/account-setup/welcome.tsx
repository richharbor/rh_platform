'use client'

import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack } from '@my/ui'

export default function AccountSetupWelcome() {
  return (
    <YStack flex={1} bg="$background" justifyContent="center" alignItems="center" px="$6" gap="$4">
      <Text fontSize={26} fontWeight="700" color="$color12" textAlign="center">
        Congratulations! Welcome to Coinpay
      </Text>
      <Paragraph color="$color11" textAlign="center">
        You’re all set to send, receive, and track your expenses.
      </Paragraph>
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.replace('/home')}>
        Continue
      </Button>
    </YStack>
  )
}

