import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

export default async function ScotlandPage() {
  const payload = await getPayload({ config: configPromise })

  const regions = await payload.find({
    collection: 'regions',
    depth: 1,
    limit: 50,
    sort: 'name',
  })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 12,
    sort: '-createdAt',
  })

  return (
    <main className="container py-16">
      <div className="mb-12">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Scotland real estate
        </p>
        <h1 className="text-4xl font-medium tracking-tight">Property for sale in Scotland</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Browse luxury homes, estates, apartments and countryside properties across Scotland.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-medium">Explore by region</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.docs.map((region) => (
            <Link
              key={region.id}
              href={`/scotland/${region.slug}`}
              className="rounded-lg border p-6 hover:bg-muted"
            >
              <h3 className="text-lg font-medium">{region.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-medium">Latest properties</h2>

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
                  <h3 className="text-lg font-medium">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.bedrooms ? `${property.bedrooms} beds` : null}
                    {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
