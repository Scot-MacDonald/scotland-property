import Link from 'next/link'

const actions = [
  {
    label: 'Browse Properties',
    description: 'Discover luxury homes across Scotland.',
    href: '/properties',
  },
  {
    label: 'Explore the Map',
    description: 'Search listings by location.',
    href: '/properties/map',
  },
  {
    label: 'Browse Agencies',
    description: 'Find specialist Scottish estate agencies.',
    href: '/agencies',
  },
]

export function BuyerQuickActions() {
  return (
    <section>
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-black/40">Discover</p>

        <h2 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">Quick actions</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group border border-black/10 bg-white p-6 transition hover:bg-black hover:text-white"
          >
            <h3 className="text-lg font-medium">{action.label}</h3>

            <p className="mt-2 text-sm text-black/55 transition group-hover:text-white/65">
              {action.description}
            </p>

            <p className="mt-8 text-sm underline underline-offset-4">Explore</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
