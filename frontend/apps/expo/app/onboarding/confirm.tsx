import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { Button, Paragraph, Text, XStack, YStack } from '@my/ui'

import { OnboardingLayout } from '../../src/components/OnboardingLayout'
import { getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

export default function OnboardingConfirmScreen() {
  const { user, completeOnboarding } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user])

  const handleFinish = async () => {
    setError('')
    setLoading(true)
    try {
      await completeOnboarding()
      router.replace('/home')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="You're all set"
      subtitle="We'll personalize your home view and keep things focused."
    >
      <YStack gap="$4">
        <Paragraph color="$color11">
          You're ready to explore. We'll start with a clean dashboard and a quick snapshot of your
          portfolio.
        </Paragraph>
        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}
        <XStack gap="$3">
          <Button chromeless onPress={() => router.back()} color="$color11">
            Back
          </Button>
          <Button
            flex={1}
            bg="$color12"
            color="white"
            borderRadius="$6"
            pressStyle={{ opacity: 0.85 }}
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? 'Finishing...' : 'Finish & enter home'}
          </Button>
        </XStack>
        <Text color="$color10" size="$2">
          You can revisit onboarding from settings anytime.
        </Text>
      </YStack>
    </OnboardingLayout>
  )
}
