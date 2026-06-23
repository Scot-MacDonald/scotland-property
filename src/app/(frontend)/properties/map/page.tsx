import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { PropertyMapClient } from '@/components/PropertyMapClient'

export default async function PropertiesMapPage() {
  const payload = await getPayload({ config: configPromise })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const mapProperties = properties.docs.map((property) => ({
    id: property.id,
    title: property.title,
    slug: property.slug,
    price: property.price,
    latitude: property.latitude,
    longitude: property.longitude,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    image:
      typeof property.featuredImage === 'object' && property.featuredImage?.url
        ? property.featuredImage.url
        : null,
  }))

  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[420px_1fr]">
        <aside className="border-r p-6">
          <Link href="/properties" className="mb-6 inline-block text-sm underline">
            ← Back to listings
          </Link>

          <h1 className="mb-2 text-3xl font-medium">Map Search</h1>

          <p className="mb-8 text-muted-foreground">
            Browse properties across Scotland by location.
          </p>

          <div className="space-y-4">
            {properties.docs.map((property) => {
              const image =
                typeof property.featuredImage === 'object' && property.featuredImage?.url
                  ? property.featuredImage.url
                  : null

              return (
                <Link
                  key={property.id}
                  href={`/property/${property.slug}`}
                  className="grid grid-cols-[120px_1fr] gap-4 border p-3"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={property.title}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] bg-muted" />
                  )}

                  <div>
                    <p className="font-medium">£{property.price?.toLocaleString('en-GB')}</p>

                    <h2 className="text-sm">{property.title}</h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {property.bedrooms ? `${property.bedrooms} beds` : null}
                      {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </aside>

        <section className="h-screen">
          <PropertyMapClient properties={mapProperties} />
        </section>
      </div>
    </main>
  )
}
