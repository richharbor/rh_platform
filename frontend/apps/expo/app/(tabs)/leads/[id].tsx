import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Paragraph, Text, YStack } from '@my/ui'

import { apiFetch, getErrorMessage } from '../../../src/lib/api'
import { useAuth } from '../../../src/lib/auth'

type LeadDetail = {
  id: number
  name: string
  product_type: string
  lead_type: string
  status: string
  incentive_type: string
  incentive_status: string
  requirement?: string
  product_details?: Record<string, string>
}

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { accessToken } = useAuth()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken || !id) return
    apiFetch<LeadDetail>(`/v1/leads/${id}`, { token: accessToken })
      .then(setLead)
      .catch((err) => setError(getErrorMessage(err)))
  }, [accessToken, id])

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} background="$background" padding="$5" gap="$4">
        <Text fontSize="$6" fontWeight="700" color="$color12">
          Lead {lead?.id ?? ''}
        </Text>
        {lead ? (
          <YStack gap="$3">
            <Text color="$color11">
              {lead.product_type.replace('_', ' ')} • {lead.lead_type.replace('_', ' ')}
            </Text>
            <Text color="$color10">Status: {lead.status.replace('_', ' ')}</Text>
            <Text color="$color10">
              Incentive: {lead.incentive_type} ({lead.incentive_status})
            </Text>
            <Text color="$color10">Requirement: {lead.requirement || 'Not provided'}</Text>
            <YStack gap="$2" background="$color1" borderRadius="$8" padding="$4" borderWidth={1} borderColor="$color3">
              <Text fontWeight="700" color="$color12">
                Lead timeline
              </Text>
              <Text color="$color10">Submitted → Assigned → Processing → Closed</Text>
              <Text color="$color10">Assigned RM: To be assigned</Text>
            </YStack>
            <YStack gap="$2">
              <Text fontWeight="700" color="$color12">
                Product details
              </Text>
              {lead.product_details && Object.keys(lead.product_details).length ? (
                Object.entries(lead.product_details).map(([key, value]) => (
                  <Text key={key} color="$color10">
                    {key.replace('_', ' ')}: {value}
                  </Text>
                ))
              ) : (
                <Paragraph color="$color10">No product-specific details provided.</Paragraph>
              )}
            </YStack>
          </YStack>
        ) : (
          <Paragraph color="$color10">{error || 'Loading lead details...'}</Paragraph>
        )}
      </YStack>
    </ScrollView>
  )
}
