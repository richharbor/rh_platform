import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { H2, Paragraph, Text, XStack, YStack } from '@my/ui'

type OnboardingLayoutProps = {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: ReactNode
}

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: OnboardingLayoutProps) {
  return (
    <YStack flex={1} bg="$background">
      <LinearGradient
        colors={['#F1F6FF', '#FFF5E9', '#F7EDF5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <YStack flex={1} px="$5" py="$6" gap="$5">
          <XStack justify="space-between" items="center">
            <Text color="$color11" textTransform="uppercase" letterSpacing={2} fontSize="$2">
              Onboarding
            </Text>
            <Text color="$color10">
              {step}/{totalSteps}
            </Text>
          </XStack>
          <YStack
            bg="$color1"
            borderRadius="$8"
            p="$5"
            gap="$4"
            borderWidth={1}
            borderColor="$color3"
            animation="medium"
            enterStyle={{ opacity: 0, y: 16 }}
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={20}
            shadowOffset={{ width: 0, height: 10 }}
          >
            <YStack gap="$2">
              <H2 color="$color12">{title}</H2>
              {subtitle ? (
                <Paragraph color="$color11" size="$4">
                  {subtitle}
                </Paragraph>
              ) : null}
            </YStack>
            <XStack gap="$2">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const active = index + 1 <= step
                return (
                  <YStack
                    key={`step-${index + 1}`}
                    flex={1}
                    height={6}
                    borderRadius={999}
                    bg={active ? '$color12' : '$color4'}
                    opacity={active ? 1 : 0.4}
                  />
                )
              })}
            </XStack>
            {children}
          </YStack>
        </YStack>
      </SafeAreaView>
    </YStack>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
})
