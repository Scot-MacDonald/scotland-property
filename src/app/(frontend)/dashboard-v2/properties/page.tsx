import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardPropertyCard } from '@/components/DashboardV2/Cards/DashboardPropertyCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardProperties, getDashboardStats } from '@/lib/dashboard'

function formatPrice(value?: number | null) {
  if (!value) return 'Price on request'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function createPageHref({ query, status, page }: { query: string; status: string; page: number }) {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (status) params.set('status', status)
  if (page > 1) params.set('page', String(page))

  const search = params.toString()

  return search ? `/dashboard-v2/properties?${search}` : '/dashboard-v2/properties'
}

export default async function DashboardV2PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
  }>
}) {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()
  const { q = '', status = '', page: pageValue = '1' } = await searchParams

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const parsedPage = Number.parseInt(pageValue, 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const [properties, stats] = await Promise.all([
    getDashboardProperties({
      payload,
      user: user as any,
      limit: 12,
      page,
      query: q.trim(),
      status,
    }),

    getDashboardStats({
      payload,
      user: user as any,
    }),
  ])

  return (
    <DashboardLayout
      navigationCounts={{
        properties: stats.totalProperties,
        agents: stats.totalAgents,
        leads: stats.newLeads,
        enquiries: stats.newEnquiries,
      }}
    >
      <DashboardHeader
        eyebrow="Agency Listings"
        title="Properties"
        description={`${properties.totalDocs} ${
          properties.totalDocs === 1 ? 'property' : 'properties'
        } found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard-v2',
            variant: 'secondary',
          },
          {
            label: 'Add Property',
            href: '/dashboard/properties/new',
            variant: 'primary',
          },
        ]}
      />

      <DashboardWorkspace>
        <form
          method="GET"
          className="mb-8 flex flex-col gap-3 border border-black/10 bg-white p-4 lg:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by title, reference or slug..."
            className="min-h-11 flex-1 border border-black/10 px-4 text-sm outline-none focus:border-black"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All statuses</option>
            <option value="for-sale">For Sale</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>

          <button
            type="submit"
            className="min-h-11 bg-black px-6 text-sm uppercase tracking-[0.16em] text-white"
          >
            Search
          </button>

          {(q || status) && (
            <a
              href="/dashboard-v2/properties"
              className="inline-flex min-h-11 items-center justify-center border border-black/10 px-5 text-sm uppercase tracking-[0.16em]"
            >
              Clear
            </a>
          )}
        </form>

        <DashboardCollection
          empty={properties.docs.length === 0}
          emptyTitle="No properties found"
          emptyDescription={
            q || status
              ? 'Try changing your search terms or status filter.'
              : 'Add your first property to begin building your agency portfolio.'
          }
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

        {properties.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <p className="text-sm text-black/50">
              Page {properties.page} of {properties.totalPages}
            </p>

            <div className="flex gap-2">
              {properties.hasPrevPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: properties.page - 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Previous
                </a>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">
                  Previous
                </span>
              )}

              {properties.hasNextPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: properties.page + 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Next
                </a>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">Next</span>
              )}
            </div>
          </nav>
        )}
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
