'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [isBuyerLoggedIn, setIsBuyerLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  useEffect(() => {
    async function checkBuyer() {
      try {
        const res = await fetch('/api/buyers/me', {
          credentials: 'include',
        })

        const data = await res.json()

        setIsBuyerLoggedIn(Boolean(data?.user && data?.collection === 'buyers'))
      } catch {
        setIsBuyerLoggedIn(false)
      } finally {
        setLoadingAuth(false)
      }
    }

    checkBuyer()
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/buyers/logout', {
      method: 'POST',
      credentials: 'include',
    })

    setIsBuyerLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="flex items-center justify-between py-8">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>

        <div className="flex items-center gap-6">
          <HeaderNav data={data} />

          {!loadingAuth && (
            <div className="flex items-center gap-3 text-sm">
              {isBuyerLoggedIn ? (
                <>
                  <Link href="/account" className="hover:underline">
                    My Account
                  </Link>

                  <button type="button" onClick={handleLogout} className="hover:underline">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>

                  <Link href="/register" className="border px-3 py-2">
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
