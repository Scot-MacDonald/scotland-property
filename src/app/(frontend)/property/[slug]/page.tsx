import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PropertyGallery } from '@/components/PropertyGallery'
import { TrackRecentlyViewed } from '@/components/TrackRecentlyViewed'
import { PropertyDetails } from '@/components/Property/PropertyDetails'
import { PropertySidebar } from '@/components/Property/PropertySidebar'
import { PropertyFeatures } from '@/components/Property/PropertyFeatures'
import { PropertyAmenities } from '@/components/Property/PropertyAmenities'
import { PropertyDescription } from '@/components/Property/PropertyDescription'
import { SimilarProperties } from '@/components/Property/SimilarProperties'

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
  const propertyType = typeof property.propertyType === 'object' ? property.propertyType : null

  const similarProperties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 2,
    overrideAccess: true,
    where: {
      and: [
        {
          id: {
            not_equals: property.id,
          },
        },

        ...(region
          ? [
              {
                region: {
                  equals: region.id,
                },
              },
            ]
          : []),

        ...(propertyType
          ? [
              {
                propertyType: {
                  equals: propertyType.id,
                },
              },
            ]
          : []),
      ],
    },
  })
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
      <TrackRecentlyViewed propertyId={String(property.id)} />
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

            <PropertyDetails property={property} />

            {property.excerpt && (
              <p className="mb-10 max-w-3xl text-xl leading-relaxed text-muted-foreground">
                {property.excerpt}
              </p>
            )}

            <section className="mb-12">
              <h2 className="mb-5 text-2xl font-medium">About the Property</h2>
              <PropertyDescription property={property} />
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

            <PropertyFeatures property={property} />

            <PropertyAmenities property={property} />
            <SimilarProperties properties={similarProperties.docs} regionName={region?.name} />
          </article>

          <PropertySidebar property={property} />
        </div>
      </section>
    </main>
  )
}
