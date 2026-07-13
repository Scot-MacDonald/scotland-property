'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

type HeaderSearchSuggestion = {
  label: string
  href: string
  type: 'Town' | 'Region' | 'Property Type'
}

interface HeaderClientProps {
  data: Header
  suggestions?: HeaderSearchSuggestion[]
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
    if (headerTheme && headerTheme !== theme) {
      setTheme(headerTheme)
    }
  }, [headerTheme, theme])

  useEffect(() => {
    async function checkBuyer() {
      try {
        const response = await fetch('/api/buyers/me', {
          credentials: 'include',
        })

        const authData = await response.json()

        setIsBuyerLoggedIn(Boolean(authData?.user && authData?.collection === 'buyers'))
      } catch {
        setIsBuyerLoggedIn(false)
      } finally {
        setLoadingAuth(false)
      }
    }

    void checkBuyer()
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
    <header className="relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-6 px-4 py-6 md:px-8">
        <Link href="/" className="shrink-0">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-6">
          <HeaderNav data={data} />

          {!loadingAuth && (
            <div className="flex items-center gap-3 text-sm">
              {isBuyerLoggedIn ? (
                <>
                  <Link href="/account" className="whitespace-nowrap hover:underline">
                    My Account
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="whitespace-nowrap hover:underline"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="whitespace-nowrap hover:underline">
                    Login
                  </Link>

                  <Link href="/register" className="whitespace-nowrap border px-3 py-2">
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
