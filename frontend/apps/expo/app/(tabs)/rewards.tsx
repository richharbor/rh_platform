import { ScrollView } from 'react-native'
import { Paragraph, Text, XStack, YStack } from '@my/ui'

import { useAuth } from '../../src/lib/auth'

export default function RewardsScreen() {
  const { user } = useAuth()

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} bg="$background" px="$5" py="$6" gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$color12">
          Rewards & Wallet
        </Text>
        <YStack bg="$color1" borderRadius="$8" p="$5" borderWidth={1} borderColor="$color3" gap="$2">
          <Text fontWeight="700" color="$color12">
            Wallet balance
          </Text>
          <Text fontSize="$6" fontWeight="700" color="$color12">
            ₹0.00
          </Text>
          <Paragraph color="$color10">Expected payout vs received will appear here.</Paragraph>
        </YStack>

        <XStack gap="$3" flexWrap="wrap">
          <YStack bg="$color1" borderRadius="$8" p="$4" borderWidth={1} borderColor="$color3" flexGrow={1}>
            <Text fontWeight="700" color="$color12">
              Active contests
            </Text>
            <Paragraph color="$color10">Leaderboard coming soon.</Paragraph>
          </YStack>
          <YStack bg="$color1" borderRadius="$8" p="$4" borderWidth={1} borderColor="$color3" flexGrow={1}>
            <Text fontWeight="700" color="$color12">
              Reward status
            </Text>
            <Paragraph color="$color10">
              {user?.role === 'partner'
                ? 'Cash payouts will be shown once approved.'
                : 'Gifts and vouchers will be tracked here.'}
            </Paragraph>
          </YStack>
        </XStack>

        <YStack bg="$color1" borderRadius="$8" p="$5" borderWidth={1} borderColor="$color3" gap="$3">
          <Text fontWeight="700" color="$color12">
            Incentive mapping
          </Text>
          {[
            { type: 'Self', benefit: 'Free add-ons, priority handling' },
            { type: 'Partner', benefit: 'Cash payout + contests' },
            { type: 'Referral Partner', benefit: 'Gifts / vouchers' },
            { type: 'Cold Reference', benefit: '25% payout on conversion' },
          ].map((row) => (
            <YStack key={row.type} gap="$1">
              <Text color="$color12">{row.type}</Text>
              <Text color="$color10" fontSize="$2">
                {row.benefit}
              </Text>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
