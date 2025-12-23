import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Button, H2, Paragraph, Text, YStack } from '@my/ui'

import { getErrorMessage } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'

export default function HomeScreen() {
  const { user, signOut, refreshUser, isLoading } = useAuth()
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user])

  useEffect(() => {
    if (!user || hasRefreshed) return
    setHasRefreshed(true)
    setRefreshing(true)
    refreshUser()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setRefreshing(false))
  }, [user, hasRefreshed])

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <YStack flex={1} bg="$background">
      <LinearGradient
        colors={['#F2F5FF', '#FFF1E6', '#F5EDF8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <YStack flex={1} px="$5" py="$6" gap="$5">
          <YStack gap="$2">
            <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
              Home
            </Text>
            <H2 color="$color12">Welcome{user?.name ? `, ${user.name}` : ''}</H2>
            <Paragraph color="$color11">
              {user?.email ? `Signed in as ${user.email}` : 'Fetching your profile...'}
            </Paragraph>
          </YStack>
          <YStack
            bg="$color1"
            borderRadius="$8"
            p="$5"
            gap="$3"
            borderWidth={1}
            borderColor="$color3"
            shadowColor="#000"
            shadowOpacity={0.08}
            shadowRadius={20}
            shadowOffset={{ width: 0, height: 10 }}
          >
            <Paragraph color="$color11">
              This is your launchpad. We will surface balances, watchlists, and alerts here next.
            </Paragraph>
            {error ? (
              <Paragraph color="$red10" size="$3">
                {error}
              </Paragraph>
            ) : null}
            <Button
              onPress={handleLogout}
              bg="$color12"
              color="white"
              borderRadius="$6"
              pressStyle={{ opacity: 0.85 }}
            >
              Log out
            </Button>
          </YStack>
          <Text color="$color10" fontSize="$2">
            {refreshing ? 'Refreshing your profile...' : 'Last synced just now.'}
          </Text>
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
