'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

type Suggestion = {
  label: string
  href: string
  type: 'Town' | 'Region' | 'Property Type'
}

interface HeaderClientProps {
  data: Header
  suggestions: Suggestion[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, suggestions }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [isBuyerLoggedIn, setIsBuyerLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [searchValue, setSearchValue] = useState('')

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

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = searchValue.trim()

    if (!query) {
      router.push('/properties')
      return
    }

    router.push(`/properties?q=${encodeURIComponent(query)}`)
    setSearchValue('')
  }

  return (
    <header className="relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-6 px-4 py-6 md:px-8">
        <Link href="/" className="shrink-0">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-6">
          <div className="relative hidden w-full max-w-[360px] md:block">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search Scotland properties"
                className="w-full border bg-background px-4 py-2 text-sm outline-none focus:border-black"
              />
            </form>

            {searchValue && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 border bg-white shadow-lg">
                {suggestions
                  .filter((suggestion) =>
                    suggestion.label.toLowerCase().includes(searchValue.toLowerCase()),
                  )
                  .slice(0, 8)
                  .map((suggestion) => (
                    <button
                      key={`${suggestion.type}-${suggestion.label}`}
                      type="button"
                      onClick={() => {
                        router.push(suggestion.href)
                        setSearchValue('')
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50"
                    >
                      <span>{suggestion.label}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

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
