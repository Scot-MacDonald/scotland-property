'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BuyerWorkspaceLogoutButton } from './BuyerWorkspaceLogoutButton'

type BuyerWorkspaceTopbarProps = {
  buyerName?: string | null
  buyerEmail?: string | null
}

const mobileNavigationItems = [
  {
    label: 'Overview',
    href: '/account',
  },
  {
    label: 'Saved',
    href: '/account/saved-properties',
  },
  {
    label: 'Searches',
    href: '/account/saved-searches',
  },
  {
    label: 'Viewed',
    href: '/account/recently-viewed',
  },
  {
    label: 'Viewings',
    href: '/account/viewings',
  },
  {
    label: 'Offers',
    href: '/account/offers',
  },
  {
    label: 'Activity',
    href: '/account/activity',
  },
  {
    label: 'Profile',
    href: '/account/profile',
  },
]

export function BuyerWorkspaceTopbar({ buyerName, buyerEmail }: BuyerWorkspaceTopbarProps) {
  const pathname = usePathname()
  const displayName = buyerName?.trim() || buyerEmail?.trim() || 'Buyer'
  const initial = displayName.charAt(0).toUpperCase() || 'B'

  return (
    <>
      <header className="border-b border-black/10 bg-[#f7f4ef]">
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-black/40">Buyer Workspace</p>

            <p className="mt-1 truncate text-sm font-medium">{displayName}</p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/properties"
              className="hidden text-sm underline underline-offset-4 sm:inline"
            >
              Browse Properties
            </Link>

            <BuyerWorkspaceLogoutButton />

            <div
              className="flex h-9 w-9 items-center justify-center bg-black text-sm font-medium text-white"
              aria-label={displayName}
            >
              {initial}
            </div>
          </div>
        </div>

        <nav className="flex gap-px overflow-x-auto border-t border-black/10 bg-black lg:hidden">
          {mobileNavigationItems.map((item) => {
            const isOverview = item.href === '/account'
            const isActive = isOverview
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'shrink-0 px-4 py-3 text-xs uppercase tracking-[0.16em] transition',
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-black text-white/70 hover:bg-white hover:text-black',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
    </>
  )
}
