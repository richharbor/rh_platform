'use client'

import { H2, Paragraph, YStack } from '@my/ui'

export default function AdminDashboardPage() {
  return (
    <YStack gap="$3">
      <H2 color="$color12">Dashboard</H2>
      <Paragraph color="$color11">Welcome to the admin console.</Paragraph>
    </YStack>
  )
}

