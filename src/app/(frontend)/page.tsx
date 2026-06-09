import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 6,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 1,
    limit: 6,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      featured: {
        equals: true,
      },
    },
  })

  return (
    <main>
      <section className="mx-auto w-full max-w-[1680px] px-4 py-20 md:px-8">
        <p className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Scotland Property
        </p>

        <h1 className="max-w-5xl text-5xl font-medium tracking-tight md:text-7xl">
          Luxury property across Scotland
        </h1>

        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
          Discover estates, castles, country houses and exceptional homes across Scotland.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/properties" className="bg-black px-6 py-3 text-white">
            Browse Properties
          </Link>

          <Link href="/properties/map" className="border px-6 py-3">
            View Map
          </Link>

          <Link href="/scotland" className="border px-6 py-3">
            Explore Scotland
          </Link>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid w-full max-w-[1680px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">Map Search</p>

            <h2 className="text-4xl font-medium tracking-tight">Explore properties by location</h2>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              View available properties across Scotland and browse by region, town or location.
            </p>
          </div>

          <div className="flex items-center lg:justify-end">
            <Link href="/properties/map" className="bg-black px-6 py-3 text-white">
              Open Map Search
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Latest Listings</p>
            <h2 className="text-4xl font-medium tracking-tight">Latest Properties</h2>
          </div>

          <Link href="/properties" className="text-sm underline">
            View all
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.docs.map((property) => {
            const image =
              typeof property.featuredImage === 'object' && property.featuredImage?.url
                ? property.featuredImage.url
                : null

            const region = typeof property.region === 'object' ? property.region : null
            const town = typeof property.town === 'object' ? property.town : null

            return (
              <Link
                key={property.id}
                href={`/property/${property.slug}`}
                className="group block overflow-hidden border bg-card"
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

                  {(region || town) && (
                    <p className="text-sm text-muted-foreground">
                      {town?.name ? `${town.name}, ` : ''}
                      {region?.name || ''}
                    </p>
                  )}

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

      <section className="mx-auto w-full max-w-[1680px] px-4 pb-20 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Agencies</p>
            <h2 className="text-4xl font-medium tracking-tight">Featured Agencies</h2>
          </div>
        </div>

        {agencies.docs.length === 0 ? (
          <p className="text-muted-foreground">
            No featured agencies yet. Mark an agency as featured in the admin.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencies.docs.map((agency) => {
              const logo =
                typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null

              return (
                <Link key={agency.id} href={`/agency/${agency.slug}`} className="border p-6">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center bg-muted">
                    {logo ? (
                      <img
                        src={logo}
                        alt={agency.name}
                        className="max-h-full max-w-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No logo</span>
                    )}
                  </div>

                  <h3 className="text-xl font-medium">{agency.name}</h3>

                  {agency.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {agency.description}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
