import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import { PropertyMapClient } from '@/components/PropertyMapClient'
import { PropertyCard } from '@/components/Property/PropertyCard'
import { SavedHeaderLinks } from '@/components/SavedHeaderLinks'
import { Search, SearchToolbar } from '@/components/Search'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [properties, agencies, regions, towns, propertyTypes, amenities, allPrices] =
    await Promise.all([
      payload.find({
        collection: 'properties',
        depth: 1,
        limit: 7,
        sort: '-createdAt',
        overrideAccess: true,
      }),

      payload.find({
        collection: 'agencies',
        depth: 1,
        limit: 6,
        where: {
          featured: {
            equals: true,
          },
        },
        overrideAccess: true,
      }),

      payload.find({
        collection: 'regions',
        depth: 0,
        limit: 100,
        sort: 'name',
        overrideAccess: true,
      }),

      payload.find({
        collection: 'towns',
        depth: 1,
        limit: 200,
        sort: 'name',
        overrideAccess: true,
      }),

      payload.find({
        collection: 'property-types',
        depth: 0,
        limit: 100,
        sort: 'name',
        overrideAccess: true,
      }),

      payload.find({
        collection: 'amenities',
        depth: 0,
        limit: 200,
        sort: 'name',
        overrideAccess: true,
      }),

      payload.find({
        collection: 'properties',
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        select: {
          price: true,
        },
      }),
    ])

  /*
   * Public search suggestions use readable Region/Town slugs.
   *
   * Examples:
   * /properties?region=highland
   * /properties?region=highland&town=inverness
   */
  const searchSuggestions = [
    ...towns.docs.map((town) => {
      const region = typeof town.region === 'object' && town.region ? town.region : undefined

      return {
        label: town.name,
        href: region
          ? `/properties?region=${encodeURIComponent(region.slug)}&town=${encodeURIComponent(
              town.slug,
            )}`
          : `/properties?town=${encodeURIComponent(town.slug)}`,
        type: 'Town' as const,
      }
    }),

    ...regions.docs.map((region) => ({
      label: region.name,
      href: `/properties?region=${encodeURIComponent(region.slug)}`,
      type: 'Region' as const,
    })),

    ...propertyTypes.docs.map((propertyType) => ({
      label: propertyType.name,
      href: `/properties?type=${encodeURIComponent(propertyType.slug)}`,
      type: 'Property Type' as const,
    })),
  ]

  /*
   * Build the price histogram used by the filter drawer.
   */
  const priceBuckets = Array<number>(12).fill(0)
  const maxHistogramPrice = 10000000

  allPrices.docs.forEach((property) => {
    if (!property.price) return

    const bucketIndex = Math.min(
      11,
      Math.floor((property.price / maxHistogramPrice) * priceBuckets.length),
    )

    priceBuckets[bucketIndex] += 1
  })

  /*
   * Properties with coordinates for the homepage map.
   */
  const mapProperties = properties.docs
    .filter(
      (property) => typeof property.latitude === 'number' && typeof property.longitude === 'number',
    )
    .map((property) => ({
      id: String(property.id),
      title: property.title,
      slug: property.slug,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      latitude: property.latitude as number,
      longitude: property.longitude as number,
      featuredImage: property.featuredImage,
    }))

  return (
    <main>
      {/* Search / filter utility bar */}
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-8">
        <div className="border">
          <div className="flex flex-col lg:h-12 lg:flex-row lg:items-stretch">
            <div className="flex shrink-0 items-stretch">
              <SearchToolbar
                priceHistogram={priceBuckets}
                regions={regions.docs}
                towns={towns.docs}
                propertyTypes={propertyTypes.docs}
                amenities={amenities.docs}
              />
            </div>

            <div className="w-full border-t lg:w-[480px] lg:border-l lg:border-t-0">
              <Search suggestions={searchSuggestions} embedded />
            </div>

            {/* Empty grid area with divider immediately after Search */}
            <div className="hidden lg:block lg:flex-1 lg:border-l" />

            <div className="shrink-0 border-t lg:border-t-0">
              <SavedHeaderLinks />
            </div>
          </div>
        </div>
      </div>

      {/* Homepage content */}
      <section className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
        {/* Intro */}
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Property / Scotland
          </p>

          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Property for sale in Scotland
          </h1>
        </div>

        <div className="mt-7 border-b" />

        {/* Latest properties */}
        <div className="flex items-end justify-between pb-5 pt-7">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Latest
            </p>

            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
              Properties in Scotland
            </h2>
          </div>

          <Link
            href="/properties"
            className="text-[10px] font-medium uppercase tracking-[0.22em] underline-offset-4 hover:underline"
          >
            View all properties
          </Link>
        </div>

        {/* Properties + map */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
          <div className="grid gap-6 md:grid-cols-2">
            {properties.docs.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="min-h-[520px] overflow-hidden border">
            <PropertyMapClient properties={mapProperties} />
          </div>
        </div>

        {/* More properties */}
        {properties.docs.length > 4 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.docs.slice(4).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : null}

        {/* Agencies */}
        {agencies.docs.length > 0 ? (
          <section className="mt-20 border-t pt-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Agencies
                </p>

                <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
                  Featured agencies
                </h2>
              </div>

              <Link
                href="/agencies"
                className="text-[10px] font-medium uppercase tracking-[0.22em] underline-offset-4 hover:underline"
              >
                View all agencies
              </Link>
            </div>

            <div className="grid border-l border-t sm:grid-cols-2 lg:grid-cols-3">
              {agencies.docs.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/agency/${agency.slug}`}
                  className="group min-h-40 border-b border-r p-6 transition hover:bg-black hover:text-white"
                >
                  <div className="flex h-full flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition group-hover:text-white/60">
                      Estate Agency
                    </p>

                    <div>
                      <h3 className="text-xl font-medium tracking-tight">{agency.name}</h3>

                      <p className="mt-2 text-sm text-muted-foreground transition group-hover:text-white/60">
                        View agency
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}
