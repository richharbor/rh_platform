'use client'

import { useRef, useState } from 'react'
import { Dimensions, ScrollView } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { Button, Text, YStack } from '@my/ui'

const slides = [
  {
    title: 'Trusted by millions of people, part of one part.',
  },
  {
    title: 'Spend money abroad, and track your expense.',
  },
  {
    title: 'Receive money from anywhere in the world.',
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

  return (
    <YStack flex={1} bg="$background" justifyContent="center">
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
          <YStack key={slide.title} width={width} flex={1} alignItems="center" justifyContent="center" px="$6" gap="$4">
            <Text textAlign="center" fontSize={22} fontWeight="700" color="$color12">
              {slide.title}
            </Text>
          </YStack>
        ))}
      </ScrollView>

      <YStack gap="$3" p="$6">
        <YStack flexDirection="row" justifyContent="center" gap="$2">
          {slides.map((_, i) => (
            <YStack
              key={i}
              width={10}
              height={10}
              borderRadius={5}
              bg={i === index ? '$blue10' : '$color5'}
              opacity={i === index ? 1 : 0.5}
            />
          ))}
        </YStack>
        <Button bg="$blue10" color="white" borderRadius="$6" onPress={goNext}>
          Next
        </Button>
      </YStack>
    </YStack>
  )
}

