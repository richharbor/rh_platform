import { useEffect, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Button, H2, Paragraph, Text, XStack, YStack } from '@my/ui'

import { apiFetch, getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

type Lead = {
  id: number
  status: string
  incentive_type: string
  incentive_status: string
  product_type: string
  lead_type: string
  created_at?: string
}

const STATUS_LABELS = ['new', 'in_progress', 'converted', 'closed'] as const

const roleLabels: Record<string, string> = {
  customer: 'Customer',
  partner: 'Partner',
  referral_partner: 'Referral Partner',
  admin: 'Admin',
}

export default function HomeScreen() {
  const { user, accessToken, signOut } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return
    apiFetch<Lead[]>('/v1/leads', { token: accessToken })
      .then(setLeads)
      .catch((err) => setError(getErrorMessage(err)))
  }, [accessToken])

  const metrics = useMemo(() => {
    const total = leads.length
    const converted = leads.filter((lead) => lead.status === 'converted').length
    const pending = leads.filter((lead) => lead.status === 'new' || lead.status === 'in_progress').length
    return {
      total,
      converted,
      earnings: leads.filter((lead) => lead.incentive_status === 'paid').length,
      pending,
    }
  }, [leads])

  const statusCounts = useMemo(() => {
    return STATUS_LABELS.reduce((acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status).length
      return acc
    }, {} as Record<(typeof STATUS_LABELS)[number], number>)
  }, [leads])

  const roleLabel = user?.role ? roleLabels[user.role] || 'Customer' : 'Customer'

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} bg="$background" px="$5" py="$6" gap="$5">
        <YStack
          bg="$color1"
          borderRadius="$10"
          p="$5"
          gap="$3"
          borderWidth={1}
          borderColor="$color3"
        >
          <Text textTransform="uppercase" letterSpacing={3} fontSize="$2" color="$color10">
            Welcome
          </Text>
          <H2 color="$color12">{user?.name ? `Welcome, ${user.name}` : 'Welcome back'}</H2>
          <XStack gap="$2" alignItems="center" flexWrap="wrap">
            <Text fontSize="$2" color="$color11">
              Role
            </Text>
            <YStack bg="$blue4" px="$3" py="$1" borderRadius="$4">
              <Text color="$blue11" fontSize="$2">
                {roleLabel}
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <XStack gap="$3" flexWrap="wrap">
          {[
            { label: 'Total Leads Submitted', value: metrics.total },
            { label: 'Leads Converted', value: metrics.converted },
            { label: 'Earnings / Rewards', value: metrics.earnings },
            { label: 'Pending Actions', value: metrics.pending },
          ].map((item) => (
            <YStack
              key={item.label}
              bg="$color1"
              borderRadius="$8"
              p="$4"
              minWidth={150}
              flexGrow={1}
              borderWidth={1}
              borderColor="$color3"
            >
              <Text fontSize="$5" fontWeight="700" color="$color12">
                {item.value}
              </Text>
              <Text color="$color10" fontSize="$2">
                {item.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        <YStack
          bg="$color12"
          borderRadius="$10"
          p="$5"
          gap="$3"
          shadowColor="#000"
          shadowOpacity={0.18}
          shadowRadius={18}
          shadowOffset={{ width: 0, height: 10 }}
        >
          <Text color="white" fontSize="$2" textTransform="uppercase" letterSpacing={2}>
            Create a Lead
          </Text>
          <Text color="white" fontSize="$6" fontWeight="700">
            ➕ Create New Lead
          </Text>
          <Paragraph color="white" opacity={0.85}>
            Unlisted Shares | Loans | Insurance | Private Markets | Corporate Finance
          </Paragraph>
          <Button onPress={() => router.push('/create-lead')} bg="white" color="$color12">
            Start lead
          </Button>
        </YStack>

        <YStack gap="$3">
          <Text fontWeight="700" color="$color12">
            Lead status snapshot
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {[
              { key: 'new', label: 'New Leads' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'converted', label: 'Converted' },
              { key: 'closed', label: 'Closed / Rejected' },
            ].map((item) => (
              <Button
                key={item.key}
                onPress={() => router.push('/my-leads')}
                bg="$color1"
                color="$color12"
                borderRadius="$8"
                borderWidth={1}
                borderColor="$color3"
              >
                <YStack>
                  <Text fontSize="$5" fontWeight="700" color="$color12">
                    {statusCounts[item.key as keyof typeof statusCounts]}
                  </Text>
                  <Text color="$color10" fontSize="$2">
                    {item.label}
                  </Text>
                </YStack>
              </Button>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$3" bg="$color1" borderRadius="$8" p="$5" borderWidth={1} borderColor="$color3">
          <Text fontWeight="700" color="$color12">
            Rewards & engagement
          </Text>
          <Paragraph color="$color11">
            {user?.role === 'partner'
              ? 'Track partner earnings, contests, and wallet payouts here.'
              : user?.role === 'referral_partner'
                ? 'View gift rewards, vouchers, and referral milestones.'
                : 'Unlock free add-ons, faster callbacks, and product walkthroughs.'}
          </Paragraph>
          <Button onPress={() => router.push('/rewards')} bg="$color12" color="white">
            View rewards
          </Button>
        </YStack>

        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}

        <Button onPress={signOut} bg="$color2" color="$color12">
          Log out
        </Button>
      </YStack>
    </ScrollView>
  )
}
