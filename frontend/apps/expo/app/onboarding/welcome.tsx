import { useEffect } from 'react'
import { router } from 'expo-router'
import { Button, Paragraph, YStack } from '@my/ui'

import { OnboardingLayout } from '../../src/components/OnboardingLayout'
import { useAuth } from '../../src/lib/auth'

export default function OnboardingWelcomeScreen() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user])

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      title="Welcome to Rich Harbor"
      subtitle="A calm, private place to grow wealth with confidence."
    >
      <YStack gap="$4">
        <Paragraph color="$color11">
          We'll set up your essentials in under a minute. You can fine-tune everything later.
        </Paragraph>
        <Button
          bg="$color12"
          color="white"
          borderRadius="$6"
          pressStyle={{ opacity: 0.85 }}
          onPress={() => router.push('/onboarding/preferences')}
        >
          Start setup
        </Button>
      </YStack>
    </OnboardingLayout>
  )
}
