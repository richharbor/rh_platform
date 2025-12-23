'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Separator, XStack, YStack, Text } from '@my/ui'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <YStack flex={1} minHeight="100vh" bg="$background">
      <XStack bg="$color1" borderBottomWidth={1} borderColor="$color3" p="$4" justify="space-between">
        <Text fontWeight="700" fontSize={20} color="$color12">
          Rich Harbor Admin
        </Text>
          <Link href="/admin/logout" prefetch={false}>
          <Button size="$3" borderRadius="$5" bg="$color12" color="white">
            Logout
          </Button>
        </Link>
      </XStack>

      <XStack flex={1}>
        <YStack width={220} borderRightWidth={1} borderColor="$color3" bg="$color1" p="$3" gap="$2">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} prefetch={false}>
                <Button
                  chromeless
                  justifyContent="flex-start"
                  borderRadius="$5"
                  bg={active ? '$color3' : 'transparent'}
                  color={active ? '$color12' : '$color11'}
                >
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </YStack>

        <YStack flex={1} p="$5" gap="$4">
          {children}
        </YStack>
      </XStack>
    </YStack>
  )
}
