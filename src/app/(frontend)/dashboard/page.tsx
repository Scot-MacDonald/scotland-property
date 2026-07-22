import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardActivityFeed } from '@/components/DashboardV2/Cards/DashboardActivityFeed'
import { DashboardPriorityPanel } from '@/components/DashboardV2/Cards/DashboardPriorityPanel'
import { DashboardPropertyCard } from '@/components/DashboardV2/Cards/DashboardPropertyCard'
import { DashboardQuickActions } from '@/components/DashboardV2/Cards/DashboardQuickActions'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHero } from '@/components/DashboardV2/Layout/DashboardHero'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'

import { getDashboardActivity } from '@/lib/dashboard/getDashboardActivity'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
import { getDashboardProperties } from '@/lib/dashboard/getDashboardProperties'

function formatPrice(value?: number | null) {
  if (!value) return 'Price on request'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPortfolioValue(value: number) {
  if (value >= 1_000_000_000) {
    return `£${(value / 1_000_000_000).toFixed(1)}B`
  }

  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}M`
  }

  if (value >= 1_000) {
    return `£${(value / 1_000).toFixed(0)}K`
  }

  return formatPrice(value)
}

export default async function DashboardV2Page() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any

  const [dashboard, properties, activities] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardProperties({
      payload,
      user: dashboardUser,
      limit: 5,
    }),

    getDashboardActivity({
      payload,
      user: dashboardUser,
      limit: 6,
    }),
  ])

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHero
        agencyName={agencyName}
        userName={
          typeof dashboardUser.name === 'string' && dashboardUser.name.trim()
            ? dashboardUser.name
            : 'there'
        }
        activeListings={dashboard.stats.activeListings}
        portfolioValue={formatPortfolioValue(dashboard.stats.portfolioValue)}
        newLeads={dashboard.stats.newLeads}
        newEnquiries={dashboard.stats.newEnquiries}
      />

      <DashboardWorkspace>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-10">
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Agency timeline
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    The latest changes and updates across your agency.
                  </p>
                </div>

                <Link
                  href="/dashboard/activity"
                  className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-950"
                >
                  View all →
                </Link>
              </div>

              <DashboardActivityFeed activities={activities} />
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4 border-t border-neutral-200 pt-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Portfolio
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
                    Properties needing attention
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Review and manage the latest properties in your portfolio.
                  </p>
                </div>

                <Link
                  href="/dashboard/properties"
                  className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-neutral-950"
                >
                  View properties →
                </Link>
              </div>

              <DashboardCollection
                empty={properties.docs.length === 0}
                emptyTitle="No properties found"
                emptyDescription="Add your first property to begin building your agency portfolio."
                showPagination={false}
              >
                {properties.docs.map((property) => {
                  const location =
                    [property.town, property.region].filter(Boolean).join(' • ') || 'Scotland'

                  return (
                    <DashboardPropertyCard
                      key={property.id}
                      title={property.title}
                      location={location}
                      price={formatPrice(property.price)}
                      status={property.status?.replaceAll('-', ' ') || 'Draft'}
                      reference={property.reference || property.slug}
                      bedrooms={property.bedrooms || 0}
                      bathrooms={property.bathrooms || 0}
                      image={property.image}
                      featured={property.featured}
                      href={`/dashboard/properties/${property.id}`}
                      viewHref={`/property/${property.slug}`}
                    />
                  )
                })}
              </DashboardCollection>

              {properties.docs.length > 0 ? (
                <div className="mt-5 flex justify-end">
                  <Link
                    href="/dashboard/properties/new"
                    className="inline-flex min-h-11 items-center justify-center border border-neutral-950 bg-neutral-950 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800"
                  >
                    Add property
                  </Link>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-8">
            <DashboardPriorityPanel />

            <DashboardQuickActions />
          </aside>
        </div>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
