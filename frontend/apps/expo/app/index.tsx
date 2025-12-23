import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

import { LoaderScreen } from '../src/components/LoaderScreen'
import { useAuth } from '../src/lib/auth'

const MIN_LOADER_MS = 1200

export default function Screen() {
  const { isLoading, user } = useAuth()
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADER_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    SecureStore.getItemAsync('onboarding_seen').then((value) => {
      setOnboardingSeen(value === 'true')
    })
  }, [])
  useEffect(() => {
    if (isLoading || !minDelayDone) return

    if (!user) {
      if (onboardingSeen === false || onboardingSeen === null) {
        router.replace('/onboarding/intro')
      } else {
        router.replace('/auth/landing')
      }
      return
    }

    if (!user.is_profile_complete) {
      router.replace('/account-setup/email')
      return
    }

    router.replace('/home')
  }, [isLoading, minDelayDone, user, onboardingSeen])

  return <LoaderScreen />
}
