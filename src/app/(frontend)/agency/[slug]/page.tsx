import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PropertyCard } from '@/components/Property/PropertyCard'

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
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      agency: {
        equals: agency.id,
      },
    },
  })

  const logo = typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null
  const featuredProperty = properties.docs[0]

  const heroImage =
    featuredProperty &&
    typeof featuredProperty.featuredImage === 'object' &&
    featuredProperty.featuredImage?.url
      ? featuredProperty.featuredImage.url
      : null

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-[1680px] px-4 py-8 md:px-8">
        <Link href="/properties" className="mb-6 inline-block text-sm text-muted-foreground">
          ← Back to properties
        </Link>

        <section className="relative min-h-[560px] overflow-hidden border">
          {heroImage ? (
            <img
              src={heroImage}
              alt={agency.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex min-h-[560px] items-center justify-center p-6 text-center md:p-10">
            <div className="max-w-5xl text-white">
              {logo ? (
                <div className="mx-auto mb-8 flex h-32 w-56 items-center justify-center border border-white/70 bg-white/95 p-6">
                  <img
                    src={logo}
                    alt={agency.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}

              <p className="text-sm uppercase tracking-[0.35em] text-white/75">
                Luxury Property Agency
              </p>

              <h1 className="mt-5 text-5xl font-medium tracking-tight md:text-7xl">
                {agency.name}
              </h1>

              {agency.description ? (
                <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/85">
                  {agency.description}
                </p>
              ) : null}

              <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
                <span className="border border-white/80 bg-black/50 px-4 py-2 uppercase tracking-[0.2em] text-white">
                  {properties.docs.length} {properties.docs.length === 1 ? 'Listing' : 'Listings'}
                </span>

                <span className="border border-white/80 bg-black/50 px-4 py-2 uppercase tracking-[0.2em] text-white">
                  {agents.docs.length} {agents.docs.length === 1 ? 'Agent' : 'Agents'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-x border-b p-6 md:p-8 lg:grid-cols-[280px_1fr_360px]">
          <div className="flex h-44 w-44 items-center justify-center border bg-white">
            {logo ? (
              <img
                src={logo}
                alt={agency.name}
                className="max-h-full max-w-full object-contain p-5"
              />
            ) : (
              <span className="px-4 text-center text-sm text-muted-foreground">No logo</span>
            )}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Profile</p>

            <h2 className="mt-3 text-3xl font-medium">About {agency.name}</h2>

            {agency.description ? (
              <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
                {agency.description}
              </p>
            ) : (
              <p className="mt-4 text-muted-foreground">
                This agency has not added a public description yet.
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Exclusive Listings" value={properties.docs.length} />
              <Stat label="Property Experts" value={agents.docs.length} />
              <Stat label="Location" value={agency.address?.city || 'Scotland'} />
            </div>
          </div>

          <aside className="h-fit border p-6">
            <h2 className="text-xl font-medium">Contact agency</h2>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              {agency.website ? (
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
              ) : null}

              {agency.email ? <p>Email: {agency.email}</p> : null}
              {agency.phone ? <p>Phone: {agency.phone}</p> : null}
              {agency.address?.city ? <p>City: {agency.address.city}</p> : null}
              {agency.address?.postcode ? <p>Postcode: {agency.address.postcode}</p> : null}
            </div>

            <a
              href={agency.email ? `mailto:${agency.email}` : '#'}
              className="mt-6 block w-full bg-black px-4 py-3 text-center text-white"
            >
              Contact Agency
            </a>
          </aside>
        </section>

        <section className="border-x border-b p-6 md:p-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Team</p>
              <h2 className="mt-2 text-4xl font-medium">Meet the agents</h2>
            </div>

            <p className="text-sm text-muted-foreground">{agents.docs.length} agents</p>
          </div>

          {agents.docs.length === 0 ? (
            <p className="text-muted-foreground">No agents added yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {agents.docs.map((agent) => {
                const photo =
                  typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null

                return (
                  <Link
                    key={agent.id}
                    href={`/agent/${agent.slug}`}
                    className="group border bg-card p-5 transition hover:bg-gray-50"
                  >
                    <div className="mb-5 aspect-square overflow-hidden bg-muted">
                      {photo ? (
                        <img
                          src={photo}
                          alt={agent.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-medium">
                          {agent.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-medium">{agent.name}</h3>

                    {agent.jobTitle ? (
                      <p className="mt-1 text-sm text-muted-foreground">{agent.jobTitle}</p>
                    ) : null}

                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                      {agent.email ? <p>{agent.email}</p> : null}
                      {agent.phone ? <p>{agent.phone}</p> : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="border-x border-b p-6 md:p-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                Featured Properties
              </p>
              <h2 className="mt-2 text-4xl font-medium">Properties represented by {agency.name}</h2>
            </div>

            <p className="text-sm text-muted-foreground">{properties.docs.length} properties</p>
          </div>

          {properties.docs.length === 0 ? (
            <p className="text-muted-foreground">No properties listed by this agency yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.docs.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-medium">{value}</p>
    </div>
  )
}
