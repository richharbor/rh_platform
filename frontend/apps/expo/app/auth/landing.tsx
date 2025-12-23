'use client'

import { router } from 'expo-router'
import { Button, Paragraph, Text, YStack } from '@my/ui'

export default function AuthLanding() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" bg="$background" gap="$5" px="$6">
      <YStack gap="$2" alignItems="center">
        <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
          Rich Harbor
        </Text>
        <Text fontSize={26} fontWeight="700" color="$color12" textAlign="center">
          Create your Coinpay account
        </Text>
        <Paragraph color="$color11" textAlign="center">
          Premium tools to send, receive, and track wealth with confidence.
        </Paragraph>
      </YStack>
      <YStack
        gap="$3"
        width="100%"
        bg="$color1"
        borderRadius="$8"
        p="$5"
        borderWidth={1}
        borderColor="$color3"
      >
        <Button bg="$blue10" color="white" borderRadius="$6" onPress={() => router.push('/auth/signup/email')}>
          Sign up
        </Button>
        <Button bg="$color2" color="$color12" borderRadius="$6" onPress={() => router.push('/auth/login')}>
          Log in
        </Button>
        <Paragraph color="$color10" textAlign="center" size="$2">
          By continuing, you agree to our privacy-first approach.
        </Paragraph>
      </YStack>
    </YStack>
  )
}
