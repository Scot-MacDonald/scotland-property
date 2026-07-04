import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'

function formatMoney(value?: number | null) {
  if (!value) return '-'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AgencyPropertiesPage() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return (
      <main className="mx-auto max-w-[800px] px-4 py-16">
        <h1 className="text-3xl font-medium">Please log in</h1>

        <Link href="/agency/login" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Agency Login
        </Link>
      </main>
    )
  }
  if (user.collection !== 'users') {
    return (
      <main className="mx-auto max-w-[800px] px-4 py-16">
        <h1 className="text-3xl font-medium">Agency access only</h1>

        <p className="mt-4 text-muted-foreground">Please log in with an agency account.</p>

        <Link href="/agency/login" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Agency Login
        </Link>
      </main>
    )
  }

  const agencyId = typeof user.agency === 'object' && user.agency ? user.agency.id : user.agency

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    sort: '-createdAt',
    limit: 100,
    where:
      user.role === 'super-admin'
        ? {}
        : {
            agency: {
              equals: agencyId,
            },
          },
  })

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Agency Dashboard
          </p>

          <h1 className="mt-2 text-5xl font-medium tracking-tight">My properties</h1>

          <p className="mt-4 text-muted-foreground">
            Manage the properties assigned to your agency.
          </p>
        </div>

        <Link href="/agency/account" className="border px-5 py-3">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-4">
        {properties.docs.map((property) => {
          const image =
            typeof property.featuredImage === 'object' && property.featuredImage?.url
              ? property.featuredImage.url
              : null

          const region = typeof property.region === 'object' ? property.region : null
          const town = typeof property.town === 'object' ? property.town : null

          return (
            <div
              key={property.id}
              className="grid gap-4 border border-neutral-200 bg-white p-4 md:grid-cols-[220px_1fr_auto]"
            >
              {image ? (
                <img
                  src={image}
                  alt={property.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] bg-neutral-100" />
              )}

              <div>
                <p className="text-xl font-medium">{formatMoney(property.price)}</p>

                <h2 className="mt-2 text-2xl font-medium">{property.title}</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {town?.name ? `${town.name}, ` : ''}
                  {region?.name || ''}
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                  {property.bedrooms ? `${property.bedrooms} beds` : ''}
                  {property.bathrooms ? ` · ${property.bathrooms} baths` : ''}
                  {property.status ? ` · ${property.status}` : ''}
                </p>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <Link href={`/property/${property.slug}`} className="border px-4 py-2 text-sm">
                  View
                </Link>

                <Link
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="bg-black px-4 py-2 text-sm text-white"
                >
                  Edit in admin
                </Link>
              </div>
            </div>
          )
        })}

        {properties.docs.length === 0 && (
          <div className="border p-10 text-center text-muted-foreground">No properties found.</div>
        )}
      </div>
    </main>
  )
}
