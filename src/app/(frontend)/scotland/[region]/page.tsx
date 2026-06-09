import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{
    region: string
  }>
}

export default async function RegionPage({ params }: Props) {
  const { region } = await params
  const payload = await getPayload({ config: configPromise })

  const regionResult = await payload.find({
    collection: 'regions',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: region,
      },
    },
  })

  const currentRegion = regionResult.docs[0]

  if (!currentRegion) {
    notFound()
  }

  const locations = await payload.find({
    collection: 'towns',
    depth: 1,
    limit: 50,
    sort: 'name',
    where: {
      region: {
        equals: currentRegion.id,
      },
    },
  })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 12,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      region: {
        equals: currentRegion.id,
      },
    },
  })

  return (
    <main className="container py-16">
      <Link href="/scotland" className="mb-8 inline-block text-sm underline">
        ← Back to Scotland
      </Link>

      <div className="mb-12">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Scotland region</p>
        <h1 className="text-4xl font-medium tracking-tight">
          Property for sale in {currentRegion.name}
        </h1>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-medium">Explore towns and cities</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.docs.map((location) => (
            <Link
              key={location.id}
              href={`/scotland/${currentRegion.slug}/${location.slug}`}
              className="rounded-lg border p-6 hover:bg-muted"
            >
              <h3 className="text-lg font-medium">{location.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-medium">Latest properties in {currentRegion.name}</h2>

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
