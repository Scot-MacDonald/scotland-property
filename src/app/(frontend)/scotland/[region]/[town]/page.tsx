import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{
    region: string
    town: string
  }>
}

export default async function TownPage({ params }: Props) {
  const { region, town } = await params
  const payload = await getPayload({ config: configPromise })

  const regionResult = await payload.find({
    collection: 'regions',
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

  const townResult = await payload.find({
    collection: 'towns',
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: town,
          },
        },
        {
          region: {
            equals: currentRegion.id,
          },
        },
      ],
    },
  })

  const currentTown = townResult.docs[0]

  if (!currentTown) {
    notFound()
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 24,
    sort: '-createdAt',
    where: {
      town: {
        equals: currentTown.id,
      },
    },
  })

  return (
    <main className="container py-16">
      <Link
        href={`/scotland/${currentRegion.slug}`}
        className="mb-8 inline-block text-sm underline"
      >
        ← Back to {currentRegion.name}
      </Link>

      <div className="mb-12">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {currentRegion.name}
        </p>

        <h1 className="text-4xl font-medium tracking-tight">
          Property for sale in {currentTown.name}
        </h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Browse homes, estates, apartments and countryside properties in {currentTown.name},
          Scotland.
        </p>
      </div>

      <section>
        <h2 className="mb-6 text-2xl font-medium">Latest properties in {currentTown.name}</h2>

        {properties.docs.length === 0 ? (
          <p className="text-muted-foreground">No properties found for this town yet.</p>
        ) : (
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
                    <p className="text-xl font-medium">
                      £{property.price?.toLocaleString('en-GB')}
                    </p>

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
        )}
      </section>
    </main>
  )
}
