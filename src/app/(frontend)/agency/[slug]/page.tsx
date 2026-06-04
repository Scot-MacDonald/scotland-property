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

  return (
    <main className="container py-16">
      <Link href="/scotland" className="mb-8 inline-block text-sm underline">
        ← Back to Scotland
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-medium tracking-tight">{agency.name}</h1>

        {agency.description && (
          <p className="mt-4 max-w-3xl text-muted-foreground">{agency.description}</p>
        )}

        <div className="mt-6 space-y-2 text-sm">
          {agency.website && <p>Website: {agency.website}</p>}

          {agency.email && <p>Email: {agency.email}</p>}

          {agency.phone && <p>Phone: {agency.phone}</p>}
        </div>
      </div>

      <section>
        <h2 className="mb-6 text-2xl font-medium">Properties ({properties.docs.length})</h2>

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
                className="group block overflow-hidden rounded-lg border"
              >
                {image ? (
                  <img
                    src={image}
                    alt={property.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-muted" />
                )}

                <div className="p-5">
                  <p className="text-xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

                  <h3 className="mt-2 text-lg">{property.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
