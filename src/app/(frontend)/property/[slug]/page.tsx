import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { PropertyAmenities } from '@/components/Property/PropertyAmenities'
import { PropertyDescription } from '@/components/Property/PropertyDescription'
import { PropertyDetails } from '@/components/Property/PropertyDetails'
import { PropertyFeatures } from '@/components/Property/PropertyFeatures'
import { PropertySidebar } from '@/components/Property/PropertySidebar'
import { PropertyGallery } from '@/components/PropertyGallery'
import { SimilarProperties } from '@/components/Property/SimilarProperties'
import { TrackRecentlyViewed } from '@/components/TrackRecentlyViewed'
import type { Media, Property } from '@/payload-types'

type Props = {
  params: Promise<{
    slug: string
  }>
}

function isMediaWithUrl(
  media: string | Media | null | undefined,
): media is Media & { url: string } {
  return (
    typeof media === 'object' &&
    media !== null &&
    typeof media.url === 'string' &&
    media.url.length > 0
  )
}

async function getPublicProperty(slug: string): Promise<Property | null> {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          publishOnWebsite: {
            not_equals: false,
          },
        },
      ],
    },
  })

  return result.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const property = await getPublicProperty(slug)

  if (!property) {
    return {
      title: 'Property not found',
    }
  }

  const title = property.seoTitle?.trim() || property.title
  const description =
    property.seoDescription?.trim() ||
    property.excerpt?.trim() ||
    `View ${property.title} on Scotland Luxury Estates.`

  const socialImage = isMediaWithUrl(property.socialImage)
    ? property.socialImage
    : isMediaWithUrl(property.featuredImage)
      ? property.featuredImage
      : null

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      images: socialImage
        ? [
            {
              url: socialImage.url,
              alt: socialImage.alt || property.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: socialImage ? [socialImage.url] : undefined,
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const property = await getPublicProperty(slug)

  if (!property) {
    notFound()
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const region =
    typeof property.region === 'object' && property.region !== null ? property.region : null

  const town = typeof property.town === 'object' && property.town !== null ? property.town : null

  const propertyType =
    typeof property.propertyType === 'object' && property.propertyType !== null
      ? property.propertyType
      : null

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
        {
          publishOnWebsite: {
            not_equals: false,
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

  const imageCandidates: Array<string | Media | null | undefined> = [
    property.featuredImage,
    ...(property.gallery ?? []),
  ]

  const images = imageCandidates.filter(isMediaWithUrl).map((image) => ({
    url: image.url,
    alt: image.alt || property.title,
  }))

  const brochure = isMediaWithUrl(property.brochure) ? property.brochure : null

  return (
    <main className="bg-background">
      <TrackRecentlyViewed propertyId={String(property.id)} />

      <section className="mx-auto w-full max-w-[1680px] px-4 pt-6 md:px-8">
        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href="/properties" className="text-muted-foreground hover:underline">
            ← Back to search
          </Link>

          <div className="flex items-center gap-4">
            {brochure ? (
              <a
                href={brochure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Download brochure
              </a>
            ) : null}

            <button type="button" className="text-muted-foreground hover:text-foreground">
              Save
            </button>

            <button type="button" className="text-muted-foreground hover:text-foreground">
              Share
            </button>
          </div>
        </div>

        <PropertyGallery images={images} title={property.title} />
      </section>

      <section className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8">
        <div className="grid gap-20 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article>
            <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {region?.slug ? (
                <Link href={`/scotland/${region.slug}`} className="underline">
                  {region.name}
                </Link>
              ) : null}

              {region?.slug && town?.slug ? <span>→</span> : null}

              {region?.slug && town?.slug ? (
                <Link href={`/scotland/${region.slug}/${town.slug}`} className="underline">
                  {town.name}
                </Link>
              ) : null}
            </div>

            <p className="mb-3 text-3xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

            <h1 className="mb-5 max-w-4xl text-3xl font-medium tracking-tight lg:text-[52px]">
              {property.title}
            </h1>

            {property.marketingHeadline ? (
              <p className="mb-6 max-w-3xl text-xl leading-relaxed text-neutral-700">
                {property.marketingHeadline}
              </p>
            ) : null}

            <PropertyDetails property={property} />

            {property.excerpt ? (
              <p className="mb-10 max-w-3xl text-xl leading-relaxed text-muted-foreground">
                {property.excerpt}
              </p>
            ) : null}

            {brochure ? (
              <section className="mb-12 border-y border-neutral-200 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-medium">Property brochure</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Download the full property particulars.
                    </p>
                  </div>

                  <a
                    href={brochure.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center border border-neutral-950 bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Download brochure
                  </a>
                </div>
              </section>
            ) : null}

            <section className="mb-12">
              <h2 className="mb-5 text-2xl font-medium">About the Property</h2>

              <PropertyDescription property={property} />
            </section>

            {property.virtualTour ? (
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
            ) : null}

            {property.youtubeVideo ? (
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
            ) : null}

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
