import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RichText from '@/components/RichText'
import { PropertyGallery } from '@/components/PropertyGallery'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })

  const property = result.docs[0]
  if (!property) notFound()

  const region = typeof property.region === 'object' ? property.region : null
  const town = typeof property.town === 'object' ? property.town : null
  const agency = typeof property.agency === 'object' ? property.agency : null
  const agent = typeof property.agent === 'object' ? property.agent : null

  const featuredImage =
    typeof property.featuredImage === 'object' && property.featuredImage?.url
      ? property.featuredImage
      : null

  const gallery = property.gallery || []

  const images = [featuredImage, ...gallery]
    .filter((image) => typeof image === 'object' && image !== null && 'url' in image && image.url)
    .map((image) => ({
      url: image.url as string,
      alt: 'alt' in image && image.alt ? image.alt : property.title,
    }))

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-[1680px] px-4 pt-6 md:px-8">
        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href="/properties" className="text-muted-foreground hover:underline">
            ← Back to search
          </Link>

          <div className="flex gap-4">
            <button className="text-muted-foreground hover:text-foreground">Save</button>
            <button className="text-muted-foreground hover:text-foreground">Share</button>
          </div>
        </div>

        <PropertyGallery images={images} title={property.title} />
      </section>

      <section className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8">
        <div className="grid gap-20 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article>
            <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {region?.slug && (
                <Link href={`/scotland/${region.slug}`} className="underline">
                  {region.name}
                </Link>
              )}

              {region?.slug && town?.slug && <span>→</span>}

              {region?.slug && town?.slug && (
                <Link href={`/scotland/${region.slug}/${town.slug}`} className="underline">
                  {town.name}
                </Link>
              )}
            </div>

            <p className="mb-3 text-3xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

            <h1 className="mb-5 max-w-4xl text-3xl font-medium tracking-tight lg:text-[52px]">
              {property.title}
            </h1>

            <div className="mb-10 border-y py-6">
              <h2 className="mb-5 text-xl font-medium">Property Details</h2>

              <dl className="grid gap-x-10 gap-y-4 text-sm md:grid-cols-2 lg:max-w-3xl">
                {property.bedrooms && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Bedrooms</dt>
                    <dd>{property.bedrooms}</dd>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Bathrooms</dt>
                    <dd>{property.bathrooms}</dd>
                  </div>
                )}

                {property.internalArea && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Internal Area</dt>
                    <dd>{property.internalArea} m²</dd>
                  </div>
                )}

                {property.landArea && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Land Area</dt>
                    <dd>{property.landArea} m²</dd>
                  </div>
                )}

                {property.yearBuilt && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Year Built</dt>
                    <dd>{property.yearBuilt}</dd>
                  </div>
                )}

                {property.reference && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Reference</dt>
                    <dd>{property.reference}</dd>
                  </div>
                )}
                {property.propertyType && typeof property.propertyType === 'object' && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Property Type</dt>
                    <dd>{property.propertyType.name}</dd>
                  </div>
                )}

                {property.status && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>{property.status}</dd>
                  </div>
                )}

                {region && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Region</dt>
                    <dd>
                      <Link href={`/scotland/${region.slug}`} className="underline">
                        {region.name}
                      </Link>
                    </dd>
                  </div>
                )}

                {town && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Town</dt>
                    <dd>
                      <Link href={`/scotland/${region?.slug}/${town.slug}`} className="underline">
                        {town.name}
                      </Link>
                    </dd>
                  </div>
                )}

                {property.energyRating && (
                  <div className="flex justify-between border-b pb-3">
                    <dt className="text-muted-foreground">Energy Rating</dt>
                    <dd>{property.energyRating}</dd>
                  </div>
                )}
              </dl>
            </div>

            {property.excerpt && (
              <p className="mb-10 max-w-3xl text-xl leading-relaxed text-muted-foreground">
                {property.excerpt}
              </p>
            )}

            <section className="mb-12">
              <h2 className="mb-5 text-2xl font-medium">About the Property</h2>
              {property.description ? (
                <RichText data={property.description} />
              ) : (
                <p className="text-muted-foreground">No description added yet.</p>
              )}
            </section>
            {property.virtualTour && (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-medium">Virtual Tour</h2>

                <a
                  href={property.virtualTour}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Open Virtual Tour
                </a>
              </section>
            )}
            {property.youtubeVideo && (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-medium">Property Video</h2>

                <a
                  href={property.youtubeVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Watch Video
                </a>
              </section>
            )}

            {property.propertyFeatures?.length ? (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-medium">Property Features</h2>

                <ul className="grid gap-3 md:grid-cols-2">
                  {property.propertyFeatures.map((item, index) => (
                    <li key={index} className="border p-4">
                      {item.feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {property.amenities?.length ? (
              <section className="mb-12">
                <h2 className="mb-5 text-2xl font-medium">Amenities</h2>

                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) =>
                    typeof amenity === 'object' ? (
                      <span key={amenity.id} className="rounded-full border px-4 py-2 text-sm">
                        {amenity.name}
                      </span>
                    ) : null,
                  )}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="mt-[120px] h-fit border p-6 lg:sticky lg:top-8">
            {agency?.name && (
              <Link href={`/agency/${agency.slug}`} className="mb-6 block">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {agency.name}
                </p>
              </Link>
            )}

            {agent?.name && (
              <div className="mb-6 border-t pt-6">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Contact agent
                </p>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                    {typeof agent.photo === 'object' && agent.photo?.url ? (
                      <img
                        src={agent.photo.url}
                        alt={agent.name}
                        className="h-full w-full object-cover"
                      />
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

                  <div>
                    <p className="text-lg font-medium">{agent.name}</p>
                    {agent.jobTitle && (
                      <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {agent.email && <p>{agent.email}</p>}
                  {agent.phone && <p>{agent.phone}</p>}
                </div>
              </div>
            )}

            <div className="space-y-3 border-t pt-6">
              <button className="w-full bg-black px-4 py-3 text-white">Contact Agent</button>
              <button className="w-full border px-4 py-3">Request Details</button>
              <button className="w-full border px-4 py-3">Schedule Viewing</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
