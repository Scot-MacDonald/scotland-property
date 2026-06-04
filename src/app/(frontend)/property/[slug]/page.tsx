import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RichText from '@/components/RichText'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const property = result.docs[0]

  if (!property) {
    notFound()
  }

  const image =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage.url
      : null

  return (
    <main className="container py-10">
      <Link href="/properties" className="mb-8 inline-block text-sm underline">
        ← Back to properties
      </Link>

      {image && (
        <img
          src={image}
          alt={property.title}
          className="mb-10 aspect-[16/9] w-full rounded-lg object-cover"
        />
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <article>
          <p className="mb-3 text-2xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

          <h1 className="mb-4 text-4xl font-medium tracking-tight">{property.title}</h1>

          <p className="mb-8 text-muted-foreground">
            {property.bedrooms ? `${property.bedrooms} beds` : null}
            {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
          </p>

          {property.description && <RichText data={property.description} />}
        </article>

        <aside className="h-fit rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-medium">Enquire about this property</h2>

          <p className="mb-6 text-sm text-muted-foreground">
            Contact the agent for more information.
          </p>

          <button className="w-full rounded-md bg-black px-4 py-3 text-white">Contact agent</button>
        </aside>
      </div>
    </main>
  )
}
