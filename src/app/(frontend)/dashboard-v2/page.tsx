import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardToolbar } from '@/components/DashboardV2/Collection/DashboardToolbar'
import { DashboardPriorityPanel } from '@/components/DashboardV2/Cards/DashboardPriorityPanel'
import { DashboardPropertyCard } from '@/components/DashboardV2/Cards/DashboardPropertyCard'
import { DashboardQuickActions } from '@/components/DashboardV2/Cards/DashboardQuickActions'
import { DashboardHero } from '@/components/DashboardV2/Layout/DashboardHero'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'

import { getDashboardProperties } from '@/lib/dashboard/getDashboardProperties'
import { getDashboardStats } from '@/lib/dashboard/getDashboardStats'
import { DashboardActivityFeed } from '@/components/DashboardV2/Cards/DashboardActivityFeed'
import { getDashboardActivity } from '@/lib/dashboard/getDashboardActivity'

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

  if (!user) {
    redirect('/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const userAsAny = user as any

  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const [stats, properties, activities, agencyResult] = await Promise.all([
    getDashboardStats({
      payload,
      user: userAsAny,
    }),

    getDashboardProperties({
      payload,
      user: userAsAny,
      limit: 5,
    }),

    getDashboardActivity({
      payload,
      user: userAsAny,
      limit: 6,
    }),

    agencyId
      ? payload.findByID({
          collection: 'agencies',
          id: agencyId,
          depth: 0,
          overrideAccess: true,
        })
      : Promise.resolve(null),
  ])

  const agencyName =
    agencyResult && typeof agencyResult.name === 'string'
      ? agencyResult.name
      : userAsAny.name || 'Your Agency'

  return (
    <DashboardLayout
      agencyName={agencyName}
      navigationCounts={{
        properties: stats.totalProperties,
        agents: stats.totalAgents,
        leads: stats.newLeads,
        enquiries: stats.newEnquiries,
      }}
    >
      <DashboardHero
        agencyName={agencyName}
        activeListings={stats.activeListings}
        portfolioValue={formatPortfolioValue(stats.portfolioValue)}
        newLeads={stats.newLeads}
        newEnquiries={stats.newEnquiries}
      />

      <DashboardWorkspace>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <DashboardToolbar
              searchPlaceholder="Search properties..."
              actionHref="/dashboard/properties/new"
              actionLabel="Add Property"
              view="list"
            />

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
                    href={`/dashboard/properties/${property.id}/edit`}
                    viewHref={`/property/${property.slug}`}
                  />
                )
              })}
            </DashboardCollection>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-8">
            <DashboardPriorityPanel />
            <DashboardQuickActions />
            <DashboardActivityFeed activities={activities} />
          </aside>
        </div>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
