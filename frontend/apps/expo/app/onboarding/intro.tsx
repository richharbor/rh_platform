'use client'

import { useRef, useState } from 'react'
import { Dimensions, ScrollView } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { Button, Text, YStack } from '@my/ui'

const slides = [
  {
    eyebrow: 'Private by design',
    title: 'Grow wealth with clarity and calm. One secure view of every asset.',
    description: 'A premium vault for balances, plans, and insights—all in one place.',
  },
  {
    eyebrow: 'Global access',
    title: 'Spend abroad with confidence and track every transfer.',
    description: 'Real-time exchange rates and instant notifications at every step.',
  },
  {
    eyebrow: 'Smart controls',
    title: 'Receive money anywhere with bank-grade protection.',
    description: 'Built-in verification and fraud protection keep every payment safe.',
  },
]

const { width } = Dimensions.get('window')

export default function OnboardingIntro() {
  const scrollRef = useRef<ScrollView>(null)
  const [index, setIndex] = useState(0)

  const goNext = async () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true })
      setIndex((i) => i + 1)
      return
    }
    await SecureStore.setItemAsync('onboarding_seen', 'true')
    router.replace('/auth/landing')
  }

  const isLastSlide = index === slides.length - 1

  return (
    <YStack flex={1} background="$background" justifyContent="center">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width)
          setIndex(nextIndex)
        }}
      >
        {slides.map((slide) => (
          <YStack key={slide.title} width={width} flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$4">
            <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
              {slide.eyebrow}
            </Text>
            <Text textAlign="center" fontSize={24} fontWeight="700" color="$color12">
              {slide.title}
            </Text>
            <Text textAlign="center" color="$color11" fontSize={15} lineHeight={22} maxWidth={320}>
              {slide.description}
            </Text>
          </YStack>
        ))}
      </ScrollView>

      <YStack gap="$3" padding="$6">
        <YStack flexDirection="row" justifyContent="center" gap="$2">
          {slides.map((_, i) => (
            <YStack
              key={i}
              width={10}
              height={10}
              borderRadius={5}
              background={i === index ? '$blue10' : '$color5'}
              opacity={i === index ? 1 : 0.5}
            />
          ))}
        </YStack>
        <Button background="$blue10" color="white" borderRadius="$6" onPress={goNext}>
          {isLastSlide ? 'Get started' : 'Next'}
        </Button>
      </YStack>
    </YStack>
  )
}
