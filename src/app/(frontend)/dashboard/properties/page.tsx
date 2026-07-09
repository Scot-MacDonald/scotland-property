import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardStatCard } from '@/components/Dashboard/DashboardStatCard'
import { DashboardTable, DashboardTableBody } from '@/components/Dashboard/DashboardTable'
import { DashboardEmptyState } from '@/components/Dashboard/DashboardEmptyState'
import { DashboardPageHeader } from '@/components/Dashboard/DashboardPageHeader'
import { DashboardToolbar } from '@/components/Dashboard/DashboardToolbar'
import { PropertyRow } from '@/components/Dashboard/PropertyRow'

export default async function DashboardPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { q = '', status = '' } = await searchParams

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const propertyFilter: any = {
    and: [
      !isSuperAdmin && agencyId
        ? {
            agency: {
              equals: agencyId,
            },
          }
        : {},
      status
        ? {
            status: {
              equals: status,
            },
          }
        : {},
      q
        ? {
            or: [
              {
                title: {
                  like: q,
                },
              },
              {
                reference: {
                  like: q,
                },
              },
              {
                slug: {
                  like: q,
                },
              },
            ],
          }
        : {},
    ],
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 100,
    sort: '-updatedAt',
    where: propertyFilter,
    overrideAccess: true,
  })

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <DashboardPageHeader
          eyebrow="Agency Listings"
          title="Properties"
          description="Manage your live, reserved and sold listings from your agency dashboard."
          actions={[
            {
              label: 'Back',
              href: '/dashboard',
              variant: 'secondary',
            },
            {
              label: 'Add Property',
              href: '/dashboard/properties/new',
              variant: 'primary',
            },
          ]}
        />

        <section className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard title="Total Properties" value={properties.totalDocs} />

          <DashboardStatCard
            title="For Sale"
            value={properties.docs.filter((property: any) => property.status === 'for-sale').length}
          />

          <DashboardStatCard
            title="Sold"
            value={properties.docs.filter((property: any) => property.status === 'sold').length}
          />
        </section>
        <div className="mt-8">
          <DashboardToolbar
            searchPlaceholder="Search properties..."
            searchValue={q}
            filters={[
              {
                label: 'Status',
                name: 'status',
                value: status,
                options: [
                  { label: 'For Sale', value: 'for-sale' },
                  { label: 'Reserved', value: 'reserved' },
                  { label: 'Sold', value: 'sold' },
                ],
              },
            ]}
            action={{
              label: 'Add Property',
              href: '/dashboard/properties/new',
            }}
          />
        </div>
        <section>
          <DashboardTable>
            <DashboardTableBody>
              {properties.docs.map((property: any) => (
                <PropertyRow key={property.id} property={property} />
              ))}

              {properties.docs.length === 0 && (
                <DashboardEmptyState
                  title="No properties found"
                  description={
                    q || status
                      ? 'Try changing your search or filters.'
                      : 'Add your first listing to start building your agency portfolio on Scotland Luxury Estates.'
                  }
                  href={!q && !status ? '/dashboard/properties/new' : undefined}
                  actionLabel={!q && !status ? 'Add Property' : undefined}
                />
              )}
            </DashboardTableBody>
          </DashboardTable>
        </section>
      </div>
    </main>
  )
}
