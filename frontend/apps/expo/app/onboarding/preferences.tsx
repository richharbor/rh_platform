import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { Button, Paragraph, Text, XStack, YStack } from '@my/ui'

import { OnboardingLayout } from '../../src/components/OnboardingLayout'
import { useAuth } from '../../src/lib/auth'

const OPTIONS = [
  'Fast portfolio snapshots',
  'Market insight briefs',
  'Priority support access',
]

export default function OnboardingPreferencesScreen() {
  const { user } = useAuth()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user])

  const toggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    )
  }

  const summary = useMemo(() => selected.join(', ') || 'No preferences selected yet.', [selected])

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Shape your experience"
      subtitle="Pick what you'd like to see first. You can adjust this anytime."
    >
      <YStack gap="$4">
        <YStack gap="$3">
          {OPTIONS.map((option) => {
            const isActive = selected.includes(option)
            return (
              <Button
                key={option}
                onPress={() => toggle(option)}
                bg={isActive ? '$color12' : '$color2'}
                color={isActive ? 'white' : '$color12'}
                borderRadius="$6"
                borderWidth={1}
                borderColor={isActive ? '$color12' : '$color4'}
                pressStyle={{ opacity: 0.85 }}
              >
                {option}
              </Button>
            )
          })}
        </YStack>
        <Paragraph color="$color11" size="$3">
          Current focus: <Text fontWeight="600">{summary}</Text>
        </Paragraph>
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
            onPress={() => router.push('/onboarding/confirm')}
          >
            Continue
          </Button>
        </XStack>
      </YStack>
    </OnboardingLayout>
  )
}
