import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

export default async function PropertiesPage() {
  const payload = await getPayload({ config: configPromise })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 12,
    sort: '-createdAt',
  })

  return (
    <main className="container py-16">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Real estate</p>
        <h1 className="text-4xl font-medium tracking-tight">Properties for sale in Scotland</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {properties.docs.map((property) => {
          const image =
            typeof property.featuredImage === 'object' && property.featuredImage?.url
              ? property.featuredImage.url
              : null

          return (
            <Link
              key={property.id}
              href={`/property/${property.slug}`}
              className="group block overflow-hidden rounded-lg border bg-card"
            >
              {image ? (
                <img
                  src={image}
                  alt={property.title}
                  className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
                  No image
                </div>
              )}

              <div className="space-y-2 p-5">
                <p className="text-xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

                <h2 className="text-lg font-medium">{property.title}</h2>

                <p className="text-sm text-muted-foreground">
                  {property.bedrooms ? `${property.bedrooms} beds` : null}
                  {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
