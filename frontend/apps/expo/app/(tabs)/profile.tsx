import { ScrollView } from 'react-native'
import { Button, Paragraph, Text, YStack } from '@my/ui'

import { useAuth } from '../../src/lib/auth'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} background="$background" padding="$5" gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$color12">
          Profile & Growth
        </Text>
        <YStack background="$color1" borderRadius="$8" padding="$5" borderWidth={1} borderColor="$color3" gap="$2">
          <Text fontWeight="700" color="$color12">
            {user?.name || 'Richharbor Member'}
          </Text>
          <Text color="$color10">Role: {user?.role || 'customer'}</Text>
          <Text color="$color10">Email: {user?.email}</Text>
          {user?.phone ? <Text color="$color10">Mobile: {user.phone}</Text> : null}
          {user?.city ? <Text color="$color10">City: {user.city}</Text> : null}
        </YStack>

        <YStack background="$color1" borderRadius="$8" padding="$5" borderWidth={1} borderColor="$color3" gap="$2">
          <Text fontWeight="700" color="$color12">
            Growth actions
          </Text>
          <Paragraph color="$color10">Upgrade to Partner • Invite others • Training & product explainers</Paragraph>
        </YStack>

        <Button onPress={signOut} background="$color2" color="$color12">
          Log out
        </Button>
      </YStack>
    </ScrollView>
  )
}
