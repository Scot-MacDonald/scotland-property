export function DashboardHero({ agencyName = 'Rettie & Co.' }: { agencyName?: string }) {
  return (
    <header className="border-b border-black/10 pb-10">
      <p className="text-sm uppercase tracking-[0.35em] text-black/50">Scotland Luxury Estates</p>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <h1 className="text-5xl font-medium tracking-tight lg:text-7xl">
            Good afternoon, {agencyName}
          </h1>

          <p className="mt-5 max-w-2xl text-black/60">
            Your agency operating system for luxury listings, seller leads, buyer enquiries and
            daily priorities.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <HeroMetric value="34" label="Active Listings" />
          <HeroMetric value="£28.4M" label="Portfolio Value" />
          <HeroMetric value="12" label="New Leads" />
          <HeroMetric value="98%" label="CRM Health" />
        </div>
      </div>
    </header>
  )
}

function HeroMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-black/10 pt-4">
      <p className="text-3xl font-medium">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-black/45">{label}</p>
    </div>
  )
}
