'use client'

import { useEffect, useState } from 'react'
import { Card, H2, Paragraph, Text, XStack, YStack } from '@my/ui'

type Lead = {
  id: number
  email: string
  name?: string | null
  created_at?: string | null
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeads = async () => {
      setError('')
      try {
        const token = getCookie('admin_token')
        if (!token) {
          setError('No admin token found. Please log in again.')
          return
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/v1/admin/leads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch leads')
        }
        const data = (await res.json()) as Lead[]
        setLeads(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leads')
      }
    }
    fetchLeads()
  }, [])

  return (
    <YStack gap="$3">
      <H2 color="$color12">Leads</H2>
      {error ? (
        <Paragraph color="$red10">{error}</Paragraph>
      ) : (
        <YStack gap="$3">
          {leads.map((lead) => (
            <Card key={lead.id} bordered padding="$4">
              <XStack justify="space-between" alignItems="center">
                <YStack gap="$1">
                  <Text fontWeight="700" color="$color12">
                    {lead.name || 'Unnamed'}
                  </Text>
                  <Text color="$color11">{lead.email}</Text>
                </YStack>
                <Text color="$color10">{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</Text>
              </XStack>
            </Card>
          ))}
          {!leads.length && <Paragraph color="$color10">No leads yet.</Paragraph>}
        </YStack>
      )}
    </YStack>
  )
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
