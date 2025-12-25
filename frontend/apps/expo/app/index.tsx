import { useEffect, useState } from 'react'
import { router } from 'expo-router'

import { LoaderScreen } from '../src/components/LoaderScreen'
import { useAuth } from '../src/lib/auth'

const MIN_LOADER_MS = 1200

export default function Screen() {
  const { isLoading, user } = useAuth()
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [hasRouted, setHasRouted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADER_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading || !minDelayDone || hasRouted) return

    if (!user) {
      setHasRouted(true)
      router.replace('/landing')
      return
    }

    setHasRouted(true)
    router.replace('/home')
  }, [isLoading, minDelayDone, user, hasRouted])

  return <LoaderScreen />
}
