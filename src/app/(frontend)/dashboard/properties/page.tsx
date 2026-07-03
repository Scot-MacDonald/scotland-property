import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DeletePropertyButton from '@/components/DeletePropertyButton'

function formatPrice(value?: number | null) {
  if (!value) return 'Price on request'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPropertiesPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const propertyFilter =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

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
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Agency Listings
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Properties</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage your live, reserved and sold listings from your agency dashboard.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border px-4 py-2 text-sm">
              Back
            </Link>

            <Link
              href="/dashboard/properties/new"
              className="bg-black px-4 py-2 text-sm text-white"
            >
              Add Property
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Properties" value={properties.totalDocs} />

          <StatCard
            title="For Sale"
            value={properties.docs.filter((property: any) => property.status === 'for-sale').length}
          />

          <StatCard
            title="Sold"
            value={properties.docs.filter((property: any) => property.status === 'sold').length}
          />
        </section>

        <section className="mt-12 overflow-hidden border bg-white">
          <div className="grid gap-4 border-b bg-neutral-50 p-5 text-sm uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <p>Property</p>
            <p>Price</p>
            <p>Status</p>
            <p>Reference</p>
            <p className="text-right">Actions</p>
          </div>

          <div className="divide-y">
            {properties.docs.map((property: any) => {
              const image =
                typeof property.featuredImage === 'object' && property.featuredImage?.url
                  ? property.featuredImage.url
                  : null

              return (
                <div
                  key={property.id}
                  className="grid gap-4 p-5 hover:bg-neutral-50 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-28 overflow-hidden  bg-neutral-100">
                      {image ? (
                        <img
                          src={image}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div>
                      <p className="font-medium">{property.title}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {property.town && typeof property.town === 'object'
                          ? property.town.name
                          : 'No town'}
                      </p>
                    </div>
                  </div>

                  <p className="font-medium">{formatPrice(property.price)}</p>

                  <p className="capitalize">{property.status?.replaceAll('-', ' ')}</p>

                  <p className="text-sm text-muted-foreground">
                    {property.reference || property.slug}
                  </p>

                  <div className="flex justify-end gap-2">
                    <Link href={`/property/${property.slug}`} className="border px-3 py-2 text-sm">
                      View
                    </Link>

                    <Link
                      href={`/dashboard/properties/${property.id}/edit`}
                      className="border px-3 py-2 text-sm"
                    >
                      Edit
                    </Link>

                    <DeletePropertyButton propertyId={property.id} />
                  </div>
                </div>
              )
            })}

            {properties.docs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No properties yet.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-4 text-5xl font-medium">{value}</p>
    </div>
  )
}
