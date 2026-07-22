type DashboardHeroProps = {
  agencyName: string
  userName: string
  activeListings: number
  portfolioValue: string
  newLeads: number
  newEnquiries: number
}

export function DashboardHero({
  agencyName,
  userName,
  activeListings,
  portfolioValue,
  newLeads,
  newEnquiries,
}: DashboardHeroProps) {
  const now = new Date()
  const hour = now.getHours()

  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const firstName = userName.trim().split(/\s+/)[0] || 'there'

  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <header className="border-b border-black/10 pb-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-black/45">
            {agencyName}
          </p>

          <h1 className="mt-4 text-4xl font-medium tracking-tight text-black lg:text-5xl">
            {greeting}, {firstName}
          </h1>

          <p className="mt-3 text-base leading-7 text-black/55">Luxury agency workspace</p>
        </div>

        <div className="flex flex-col items-start lg:items-end">
          <p className="text-sm font-medium text-black">{date}</p>

          <p className="mt-1 text-sm text-black/45">{time}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 border-t border-black/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        <HeroMetric value={activeListings} label="Active Listings" />
        <HeroMetric value={portfolioValue} label="Portfolio Value" />
        <HeroMetric value={newLeads} label="New Leads" />
        <HeroMetric value={newEnquiries} label="New Enquiries" />
      </div>
    </header>
  )
}

function HeroMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-4xl font-medium tracking-tight text-black">{value}</p>

      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-black/45">{label}</p>
    </div>
  )
}
