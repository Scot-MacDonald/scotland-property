import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function AgencyPage({ params }: Props) {
  const { slug } = await params

  const payload = await getPayload({
    config: configPromise,
  })

  const agencyResult = await payload.find({
    collection: 'agencies',
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const agency = agencyResult.docs[0]

  if (!agency) {
    notFound()
  }

  const agents = await payload.find({
    collection: 'agents',
    depth: 2,
    limit: 50,
    where: {
      agency: {
        equals: agency.id,
      },
    },
  })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 50,
    where: {
      agency: {
        equals: agency.id,
      },
    },
  })

  const logo = typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-[1480px] px-4 py-12 md:px-8">
        <Link
          href="/properties"
          className="mb-8 inline-block text-sm text-muted-foreground underline"
        >
          ← Back to properties
        </Link>

        <div className="grid gap-10 border-b pb-12 lg:grid-cols-[220px_1fr_360px]">
          <div className="flex h-40 w-40 items-center justify-center border bg-muted">
            {logo ? (
              <img
                src={logo}
                alt={agency.name}
                className="max-h-full max-w-full object-contain p-4"
              />
            ) : (
              <span className="px-4 text-center text-sm text-muted-foreground">No logo</span>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Agency</p>

            <h1 className="max-w-4xl text-4xl font-medium tracking-tight lg:text-5xl">
              {agency.name}
            </h1>

            {agency.description && (
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {agency.description}
              </p>
            )}
          </div>

          <aside className="h-fit border p-6">
            <h2 className="mb-4 text-lg font-medium">Contact agency</h2>

            <div className="space-y-3 text-sm text-muted-foreground">
              {agency.website && (
                <p>
                  Website:{' '}
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {agency.website}
                  </a>
                </p>
              )}

              {agency.email && <p>Email: {agency.email}</p>}
              {agency.phone && <p>Phone: {agency.phone}</p>}

              {agency.address?.city && <p>City: {agency.address.city}</p>}
              {agency.address?.postcode && <p>Postcode: {agency.address.postcode}</p>}
            </div>

            <button className="mt-6 w-full bg-black px-4 py-3 text-white">Contact Agency</button>
          </aside>
        </div>

        <section className="border-b py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Team</p>
              <h2 className="text-3xl font-medium">Agents</h2>
            </div>

            <p className="text-sm text-muted-foreground">{agents.docs.length} agents</p>
          </div>

          {agents.docs.length === 0 ? (
            <p className="text-muted-foreground">No agents added yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.docs.map((agent) => {
                const photo =
                  typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null

                return (
                  <div key={agent.id} className="border p-5">
                    <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-muted">
                      {photo ? (
                        <img src={photo} alt={agent.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-medium">
                          {agent.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-medium">{agent.name}</h3>

                    {agent.jobTitle && (
                      <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>
                    )}

                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                      {agent.email && <p>{agent.email}</p>}
                      {agent.phone && <p>{agent.phone}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Listings</p>
              <h2 className="text-3xl font-medium">Properties</h2>
            </div>

            <p className="text-sm text-muted-foreground">{properties.docs.length} properties</p>
          </div>

          {properties.docs.length === 0 ? (
            <p className="text-muted-foreground">No properties listed by this agency yet.</p>
          ) : (
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
                      <p className="text-xl font-medium">
                        £{property.price?.toLocaleString('en-GB')}
                      </p>

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
          )}
        </section>
      </section>
    </main>
  )
}
