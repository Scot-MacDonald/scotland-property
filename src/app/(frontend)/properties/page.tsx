import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{
    region?: string
    town?: string
    type?: string
  }>
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams
  function createFilterHref(newParams: {
    region?: string | null
    town?: string | null
    type?: string | null
  }) {
    const query = new URLSearchParams()

    const region = newParams.region !== undefined ? newParams.region : params.region
    const town = newParams.town !== undefined ? newParams.town : params.town
    const type = newParams.type !== undefined ? newParams.type : params.type

    if (region) query.set('region', region)
    if (town) query.set('town', town)
    if (type) query.set('type', type)

    const queryString = query.toString()

    return queryString ? `/properties?${queryString}` : '/properties'
  }

  const payload = await getPayload({ config: configPromise })

  const regions = await payload.find({
    collection: 'regions',
    limit: 100,
  })

  const towns = await payload.find({
    collection: 'towns',
    limit: 100,
  })

  const propertyTypes = await payload.find({
    collection: 'property-types',
    limit: 100,
  })

  const where: Record<string, unknown> = {}

  if (params.region) {
    where.region = {
      equals: params.region,
    }
  }

  if (params.town) {
    where.town = {
      equals: params.town,
    }
  }

  if (params.type) {
    where.propertyType = {
      equals: params.type,
    }
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 24,
    sort: '-createdAt',
    where,
  })

  return (
    <main className="container py-16">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Real Estate</p>

        <h1 className="text-4xl font-medium tracking-tight">Properties for Sale in Scotland</h1>

        <p className="mt-2 text-muted-foreground">{properties.totalDocs} properties found</p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/properties"
          className={`border px-4 py-2 text-sm ${
            !params.region && !params.town && !params.type ? 'bg-black text-white' : ''
          }`}
        >
          All Properties
        </Link>

        {params.region || params.town || params.type ? (
          <Link href="/properties" className="border px-4 py-2 text-sm">
            Clear Filters
          </Link>
        ) : null}

        {regions.docs.map((region) => (
          <Link
            key={region.id}
            href={createFilterHref({ region: region.id })}
            className={`border px-4 py-2 text-sm ${
              params.region === region.id ? 'bg-black text-white' : ''
            }`}
          >
            {region.name}
          </Link>
        ))}

        {towns.docs.map((town) => (
          <Link
            key={town.id}
            href={createFilterHref({ town: town.id })}
            className={`border px-4 py-2 text-sm ${
              params.town === town.id ? 'bg-black text-white' : ''
            }`}
          >
            {town.name}
          </Link>
        ))}

        {propertyTypes.docs.map((type) => (
          <Link
            key={type.id}
            href={createFilterHref({ type: type.id })}
            className={`border px-4 py-2 text-sm ${
              params.type === type.id ? 'bg-black text-white' : ''
            }`}
          >
            {type.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {properties.docs.map((property) => {
          const image =
            typeof property.featuredImage === 'object' && property.featuredImage?.url
              ? property.featuredImage.url
              : null

          const region = typeof property.region === 'object' ? property.region : null

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

                {region && <p className="text-sm text-muted-foreground">{region.name}</p>}

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
