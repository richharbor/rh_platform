import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Button, H1, Paragraph, Text, XStack, YStack } from 'tamagui'

const trustItems = ['Regulated partners', 'Secure data', 'Fast payouts', '10K+ leads']

export default function LandingScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
      <YStack flex={1} background="$background" padding="$5" gap="$6">
        <XStack justifyContent="space-between" alignItems="center">
          <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
            Richharbor
          </Text>
          <XStack gap="$2">
            <Button size="$3" onPress={() => router.push('/login')} background="$color12" color="white">
              Login
            </Button>
            <Button size="$3" onPress={() => router.push('/signup')} background="$color2" color="$color12">
              Register
            </Button>
          </XStack>
        </XStack>

        <YStack gap="$3">
          <H1 color="$color12">Your gateway to financial opportunities.</H1>
          <Paragraph color="$color11" size="$5">
            One app to raise, refer, track, and monetize financial leads across all Richharbor products.
          </Paragraph>
          <XStack gap="$3" flexWrap="wrap">
            <Button onPress={() => router.push('/signup?role=customer')} background="$blue10" color="white">
              Register as Customer
            </Button>
            <Button onPress={() => router.push('/signup?role=partner')} background="$color2" color="$color12">
              Become a Partner
            </Button>
            <Button onPress={() => router.push('/signup?role=referral_partner')} background="$color2" color="$color12">
              Refer Leads
            </Button>
          </XStack>
        </YStack>

        <YStack gap="$4" background="$color1" borderRadius="$8" padding="$5" borderWidth={1} borderColor="$color3">
          <Text fontWeight="700" color="$color12">
            Supported products
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {[
              'Unlisted Shares',
              'Loans',
              'Insurance',
              'Private Markets',
              'Corporate Finance',
            ].map((item) => (
              <YStack
                key={item}
                background="$background"
                borderRadius="$6"
                padding="$3"
                borderWidth={1}
                borderColor="$color4"
              >
                <Text color="$color11">{item}</Text>
              </YStack>
            ))}
          </XStack>
        </YStack>

        <XStack gap="$2" flexWrap="wrap">
          {trustItems.map((item) => (
            <YStack key={item} background="$color2" borderRadius="$6" padding="$3">
              <Text color="$color11" fontSize="$2">
                {item}
              </Text>
            </YStack>
          ))}
        </XStack>

        <YStack gap="$2">
          <Text fontWeight="700" color="$color12">
            Compliance
          </Text>
          <Paragraph color="$color10" size="$2">
            Richharbor is a technology platform connecting financial product partners. All transactions
            are subject to regulatory approvals and product terms.
          </Paragraph>
          <Paragraph color="$color10" size="$2">
            Investments in unlisted shares and pre-IPO offerings carry risks. Past performance does
            not guarantee future returns.
          </Paragraph>
          <Paragraph color="$color10" size="$2">
            Loans and insurance products are offered in partnership with regulated banks and insurers.
            Please read the full terms before proceeding.
          </Paragraph>
          <Paragraph color="$color10" size="$2">
            All user data is handled securely and in compliance with applicable privacy regulations.
          </Paragraph>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
