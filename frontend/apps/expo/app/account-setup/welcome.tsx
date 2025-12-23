'use client'

import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack } from '@my/ui'

export default function AccountSetupWelcome() {
  return (
    <YStack flex={1} bg="$background" justifyContent="center" alignItems="center" px="$6" gap="$5">
      <YStack gap="$2" alignItems="center">
        <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
          Welcome
        </Text>
        <Text fontSize={26} fontWeight="700" color="$color12" textAlign="center">
          Congratulations! You’re ready for Coinpay
        </Text>
        <Paragraph color="$color11" textAlign="center">
          Your profile is verified and your vault is ready to use.
        </Paragraph>
      </YStack>
      <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.replace('/home')}>
        Enter dashboard
      </Button>
    </YStack>
  )
}
