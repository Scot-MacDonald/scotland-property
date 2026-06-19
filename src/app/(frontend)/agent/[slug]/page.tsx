import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PropertyCardSlider } from '@/components/PropertyCardSlider'
import { SavePropertyButton } from '@/components/SavePropertyButton'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const agents = await payload.find({
    collection: 'agents',
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
    overrideAccess: true,
  })

  const agent = agents.docs[0]

  if (!agent) {
    notFound()
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 24,
    sort: '-createdAt',
    where: {
      agent: {
        equals: agent.id,
      },
    },
    overrideAccess: true,
  })

  const photo = typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null
  const agency = typeof agent.agency === 'object' ? agent.agency : null

  const heroProperty = properties.docs[0]
  const heroImage =
    heroProperty &&
    typeof heroProperty.featuredImage === 'object' &&
    heroProperty.featuredImage?.url
      ? heroProperty.featuredImage.url
      : null

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-[1680px] px-4 py-8 md:px-8">
        <Link
          href={agency ? `/agency/${agency.slug}` : '/properties'}
          className="mb-6 inline-block text-sm text-muted-foreground"
        >
          ← {agency ? `Back to ${agency.name}` : 'Back to properties'}
        </Link>

        <section className="relative overflow-hidden border">
          {heroImage ? (
            <img
              src={heroImage}
              alt={agent.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 grid min-h-[520px] gap-8 p-6 md:p-10 lg:grid-cols-[360px_1fr] lg:items-end">
            <div className="self-end">
              <div className="aspect-square overflow-hidden border border-white/25 bg-white/10">
                {photo ? (
                  <img src={photo} alt={agent.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl font-medium text-white">
                    {agent.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
              </div>
            </div>

            <div className="self-end text-white">
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Property Agent</p>

              <h1 className="mt-4 max-w-5xl text-5xl font-medium tracking-tight md:text-7xl">
                {agent.name}
              </h1>

              {agent.jobTitle ? (
                <p className="mt-5 text-xl text-white/85">{agent.jobTitle}</p>
              ) : null}

              {agency ? (
                <Link
                  href={`/agency/${agency.slug}`}
                  className="mt-4 inline-block text-white/85 underline"
                >
                  {agency.name}
                </Link>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="bg-white px-4 py-2 text-black">
                  {properties.totalDocs} {properties.totalDocs === 1 ? 'property' : 'properties'}
                </span>

                {agent.email ? (
                  <a href={`mailto:${agent.email}`} className="bg-white px-4 py-2 text-black">
                    Email agent
                  </a>
                ) : null}

                {agent.phone ? (
                  <a href={`tel:${agent.phone}`} className="bg-white px-4 py-2 text-black">
                    Call agent
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-x border-b p-6 md:p-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Profile</p>

            <h2 className="mt-2 text-4xl font-medium">About {agent.name}</h2>

            <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
              {agent.name} represents selected properties across Scotland
              {agency ? ` with ${agency.name}` : ''}. Contact directly for viewings, enquiries and
              further information about current listings.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Listings" value={properties.totalDocs} />
              <Stat label="Agency" value={agency?.name || 'Independent'} />
              <Stat label="Role" value={agent.jobTitle || 'Agent'} />
            </div>
          </div>

          <aside className="h-fit border p-6">
            <h2 className="text-xl font-medium">Contact {agent.name}</h2>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              {agent.email ? (
                <p>
                  Email:{' '}
                  <a href={`mailto:${agent.email}`} className="underline">
                    {agent.email}
                  </a>
                </p>
              ) : null}

              {agent.phone ? (
                <p>
                  Phone:{' '}
                  <a href={`tel:${agent.phone}`} className="underline">
                    {agent.phone}
                  </a>
                </p>
              ) : null}

              {agency ? (
                <p>
                  Agency:{' '}
                  <Link href={`/agency/${agency.slug}`} className="underline">
                    {agency.name}
                  </Link>
                </p>
              ) : null}
            </div>

            {agent.email ? (
              <a
                href={`mailto:${agent.email}`}
                className="mt-6 block w-full bg-black px-4 py-3 text-center text-white"
              >
                Contact Agent
              </a>
            ) : null}
          </aside>
        </section>

        <section className="border-x border-b p-6 md:p-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                Agent Listings
              </p>

              <h2 className="mt-2 max-w-5xl text-4xl font-medium tracking-tight">
                Properties represented by {agent.name}
              </h2>
            </div>

            <p className="text-sm text-muted-foreground">
              {properties.totalDocs} {properties.totalDocs === 1 ? 'property' : 'properties'}
            </p>
          </div>

          {properties.docs.length === 0 ? (
            <div className="border p-8 text-muted-foreground">
              No properties are currently assigned to this agent.
            </div>
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  )
}

function PropertyCard({ property }: { property: any }) {
  const image =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  const images = [
    ...(image
      ? [
          {
            url: image,
            alt: property.title,
          },
        ]
      : []),

    ...(property.gallery || [])
      .filter((item: any) => typeof item === 'object' && item?.url && item.url !== image)
      .map((item: any) => ({
        url: item.url,
        alt: property.title,
      })),
  ]

  const region = typeof property.region === 'object' ? property.region : null
  const town = typeof property.town === 'object' ? property.town : null

  return (
    <Link
      href={`/property/${property.slug}`}
      className="group block relative overflow-hidden border"
    >
      <SavePropertyButton propertyId={String(property.id)} />

      <PropertyCardSlider images={images} title={property.title} />

      <div className="space-y-2 px-1 pb-2 pt-4">
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
}
