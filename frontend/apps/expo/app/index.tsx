import { useEffect, useState } from 'react'
import { router } from 'expo-router'

import { LoaderScreen } from '../src/components/LoaderScreen'
import { useAuth } from '../src/lib/auth'

const MIN_LOADER_MS = 1200

export default function Screen() {
  const { isLoading, user } = useAuth()
  const [minDelayDone, setMinDelayDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADER_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading || !minDelayDone) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (!user.onboarding_completed) {
      router.replace('/onboarding/welcome')
      return
    }

    router.replace('/home')
  }, [isLoading, minDelayDone, user])

  return <LoaderScreen />
}
