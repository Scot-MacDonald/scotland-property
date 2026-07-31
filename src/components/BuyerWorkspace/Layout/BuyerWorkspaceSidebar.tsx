'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type BuyerWorkspaceNavigationCounts = {
  savedProperties?: number
  savedSearches?: number
  recentlyViewed?: number
  viewings?: number
  offers?: number
}

type BuyerWorkspaceSidebarProps = {
  counts?: BuyerWorkspaceNavigationCounts
}

const navigationItems = [
  {
    label: 'Overview',
    href: '/account',
  },
  {
    label: 'Saved Properties',
    href: '/account/saved-properties',
    countKey: 'savedProperties',
  },
  {
    label: 'Saved Searches',
    href: '/account/saved-searches',
    countKey: 'savedSearches',
  },
  {
    label: 'Recently Viewed',
    href: '/account/recently-viewed',
    countKey: 'recentlyViewed',
  },
  {
    label: 'Viewings',
    href: '/account/viewings',
    countKey: 'viewings',
  },
  {
    label: 'Offers',
    href: '/account/offers',
    countKey: 'offers',
  },
  {
    label: 'Activity',
    href: '/account/activity',
  },
  {
    label: 'Profile',
    href: '/account/profile',
  },
] as const

export function BuyerWorkspaceSidebar({ counts = {} }: BuyerWorkspaceSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden min-h-screen border-r border-white/10 bg-[#111] text-white lg:block">
      <div className="sticky top-0">
        <div className="p-8">
          <Link href="/account">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Scotland</p>

            <h1 className="mt-2 text-2xl font-medium">Luxury Estates</h1>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/40">
              Buyer Workspace
            </p>
          </Link>
        </div>

        <nav className="px-4 pb-8">
          {navigationItems.map((item) => {
            const isOverview = item.href === '/account'
            const isActive = isOverview
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

            const count = 'countKey' in item && item.countKey ? counts[item.countKey] : undefined

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group flex items-center justify-between gap-4 border-t border-white/10 px-4 py-4 text-sm uppercase tracking-[0.18em] transition',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white hover:text-black',
                ].join(' ')}
              >
                <span>{item.label}</span>

                {typeof count === 'number' && (
                  <span
                    className={[
                      'flex min-w-7 items-center justify-center px-2 py-1 text-xs tracking-normal',
                      isActive
                        ? 'bg-black text-white'
                        : 'border border-white/15 text-white/60 group-hover:border-black/10 group-hover:text-black/60',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
