import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="grid gap-3 lg:grid-cols-3">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          {photo ? (
            <img src={photo} alt={agent.name} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-medium">
              {agent.name?.charAt(0)}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <h1 className="text-3xl font-medium">{agent.name}</h1>

            {agent.jobTitle && <p className="text-muted-foreground">{agent.jobTitle}</p>}

            {agency && (
              <Link href={`/agency/${agency.slug}`} className="inline-block underline">
                {agency.name}
              </Link>
            )}

            <div className="space-y-2 pt-4 text-sm">
              {agent.email && (
                <p>
                  <a href={`mailto:${agent.email}`} className="underline">
                    {agent.email}
                  </a>
                </p>
              )}

              {agent.phone && (
                <p>
                  <a href={`tel:${agent.phone}`} className="underline">
                    {agent.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Agent Listings
            </p>

            <h2 className="mt-2 max-w-5xl text-4xl font-medium tracking-tight">
              Properties represented by {agent.name}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {properties.totalDocs} {properties.totalDocs === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {properties.docs.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function PropertyCard({ property }: { property: any }) {
  const image =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  const region = typeof property.region === 'object' ? property.region : null
  const town = typeof property.town === 'object' ? property.town : null

  return (
    <Link href={`/property/${property.slug}`} className="block overflow-hidden border">
      {image ? (
        <img src={image} alt={property.title} className="h-[320px] w-full object-cover" />
      ) : (
        <div className="flex h-[320px] items-center justify-center bg-muted text-muted-foreground">
          No image
        </div>
      )}

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
