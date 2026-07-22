import Link from 'next/link'

export type DashboardNavigationCounts = {
  properties?: number
  agents?: number
  leads?: number
  enquiries?: number
  viewings?: number
}

type DashboardSidebarProps = {
  counts?: DashboardNavigationCounts
}

export function DashboardSidebar({ counts = {} }: DashboardSidebarProps) {
  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
    },
    {
      label: 'Activity',
      href: '/dashboard/activity',
    },
    {
      label: 'Properties',
      href: '/dashboard/properties',
      count: counts.properties,
    },
    {
      label: 'Enquiries',
      href: '/dashboard/enquiries',
      count: counts.enquiries,
      attention: Boolean(counts.enquiries),
    },
    {
      label: 'Viewings',
      href: '/dashboard/viewings',
      count: counts.viewings,
    },
    {
      label: 'Leads',
      href: '/dashboard/leads',
      count: counts.leads,
      attention: Boolean(counts.leads),
    },
    {
      label: 'Buyers',
      href: '/dashboard/buyers',
    },
    {
      label: 'Agents',
      href: '/dashboard/agents',
      count: counts.agents,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
    },
    {
      label: 'Billing',
      href: '/dashboard/billing',
    },
    {
      label: 'Team',
      href: '/dashboard/settings/team',
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
    },
  ]

  return (
    <aside className="hidden min-h-screen border-r border-white/10 bg-[#111] text-white lg:block">
      <div className="sticky top-0">
        <div className="p-8">
          <Link href="/dashboard">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Scotland</p>

            <h1 className="mt-2 text-2xl font-medium">Luxury Estates</h1>
          </Link>
        </div>

        <nav className="px-4 pb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-4 border-t border-white/10 px-4 py-4 text-sm uppercase tracking-[0.18em] text-white/70 transition hover:bg-white hover:text-black"
            >
              <span>{item.label}</span>

              {typeof item.count === 'number' && (
                <span
                  className={
                    item.attention
                      ? 'flex min-w-7 items-center justify-center bg-white px-2 py-1 text-xs tracking-normal text-black group-hover:bg-black group-hover:text-white'
                      : 'flex min-w-7 items-center justify-center border border-white/15 px-2 py-1 text-xs tracking-normal text-white/60 group-hover:border-black/10 group-hover:text-black/60'
                  }
                >
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
