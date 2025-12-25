import { useEffect } from 'react'
import { Tabs, router } from 'expo-router'

import { useAuth } from '../../src/lib/auth'

export default function TabsLayout() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/landing')
    }
  }, [isLoading, user])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 64, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="create-lead" options={{ title: 'Create Lead' }} />
      <Tabs.Screen name="my-leads" options={{ title: 'My Leads' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
