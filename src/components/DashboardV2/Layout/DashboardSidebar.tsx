import Link from 'next/link'

const navItems = [
  { label: 'Overview', href: '/dashboard-v2' },
  { label: 'Properties', href: '/dashboard-v2/properties' },
  { label: 'Agents', href: '/dashboard-v2/agents' },
  { label: 'Leads', href: '/dashboard-v2/leads' },
  { label: 'Enquiries', href: '/dashboard-v2/enquiries' },
  { label: 'Analytics', href: '/dashboard-v2/analytics' },
  { label: 'Settings', href: '/dashboard-v2/settings' },
]

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r border-black/10 bg-[#111] text-white lg:block">
      <div className="p-8">
        <Link href="/dashboard-v2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Scotland</p>
          <h1 className="mt-2 text-2xl font-medium">Luxury Estates</h1>
        </Link>
      </div>

      <nav className="px-4 pb-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block border-t border-white/10 px-4 py-4 text-sm uppercase tracking-[0.18em] text-white/70 transition hover:bg-white hover:text-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
