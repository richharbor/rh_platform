import { useEffect, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Button, Paragraph, Text, XStack, YStack } from '@my/ui'

import { apiFetch, getErrorMessage } from '../../src/lib/api'
import { useAuth } from '../../src/lib/auth'

type Lead = {
  id: number
  name: string
  product_type: string
  status: string
  incentive_type: string
  incentive_status: string
  created_at?: string
}

const statusFilters = ['all', 'new', 'in_progress', 'converted', 'closed']

export default function MyLeadsScreen() {
  const { accessToken } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return
    apiFetch<Lead[]>('/v1/leads', { token: accessToken })
      .then(setLeads)
      .catch((err) => setError(getErrorMessage(err)))
  }, [accessToken])

  const filtered = useMemo(() => {
    if (filter === 'all') return leads
    return leads.filter((lead) => lead.status === filter)
  }, [leads, filter])

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} bg="$background" px="$5" py="$6" gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$color12">
          My Leads
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {statusFilters.map((status) => (
            <Button
              key={status}
              size="$2"
              bg={filter === status ? '$blue10' : '$color2'}
              color={filter === status ? 'white' : '$color12'}
              onPress={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </Button>
          ))}
        </XStack>

        <YStack gap="$3">
          {filtered.map((lead) => (
            <Button
              key={lead.id}
              onPress={() => router.push(`/leads/${lead.id}`)}
              bg="$color1"
              borderRadius="$8"
              borderWidth={1}
              borderColor="$color3"
            >
              <YStack gap="$1">
                <Text fontWeight="700" color="$color12">
                  {lead.name}
                </Text>
                <Text color="$color10" fontSize="$2">
                  {lead.product_type.replace('_', ' ')} • {lead.status.replace('_', ' ')}
                </Text>
                <Text color="$color10" fontSize="$2">
                  Incentive: {lead.incentive_type} ({lead.incentive_status})
                </Text>
              </YStack>
            </Button>
          ))}
          {!filtered.length ? (
            <Paragraph color="$color10">No leads found for this filter.</Paragraph>
          ) : null}
        </YStack>

        {error ? (
          <Paragraph color="$red10" size="$3">
            {error}
          </Paragraph>
        ) : null}
      </YStack>
    </ScrollView>
  )
}
