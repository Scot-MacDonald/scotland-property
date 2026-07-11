'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { logoutAction } from '@/app/(frontend)/(auth)/logout/actions'

export function DashboardLogoutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await logoutAction()

      if (!result.success) {
        setIsSubmitting(false)
        return
      }

      router.replace('/login')
      router.refresh()
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="text-sm underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
