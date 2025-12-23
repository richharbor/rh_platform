'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogoutPage() {
  const router = useRouter()
  useEffect(() => {
    clearCookie('admin_token')
    clearCookie('admin_refresh')
    router.replace('/admin/login')
  }, [router])
  return null
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}
