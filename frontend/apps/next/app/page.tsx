'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('admin_token')
    if (token) {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/auth/login')
    }
  }, [router])

  return null
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
