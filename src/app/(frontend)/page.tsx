import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Search } from '@/components/Search'
import { PropertyCardSlider } from '@/components/PropertyCardSlider'
import { SavePropertyButton } from '@/components/SavePropertyButton'
import { SavedHeaderLinks } from '@/components/SavedHeaderLinks'

import { PropertyMapClient } from '@/components/PropertyMapClient'
export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 7,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 1,
    limit: 6,
    where: {
      featured: {
        equals: true,
      },
    },
    overrideAccess: true,
  })

  const regions = await payload.find({
    collection: 'regions',
    limit: 100,
    sort: 'name',
    overrideAccess: true,
  })

  const towns = await payload.find({
    collection: 'towns',
    limit: 100,
    sort: 'name',
    overrideAccess: true,
  })

  const propertyTypes = await payload.find({
    collection: 'property-types',
    limit: 100,
    sort: 'name',
    overrideAccess: true,
  })

  const searchSuggestions = [
    ...towns.docs.map((town) => ({
      label: town.name,
      href: `/properties?q=${encodeURIComponent(town.name)}`,
      type: 'Town' as const,
    })),

    ...regions.docs.map((region) => ({
      label: region.name,
      href: `/properties?q=${encodeURIComponent(region.name)}`,
      type: 'Region' as const,
    })),

    ...propertyTypes.docs.map((propertyType) => ({
      label: propertyType.name,
      href: `/properties?q=${encodeURIComponent(propertyType.name)}`,
      type: 'Property Type' as const,
    })),
  ]

  const totalProperties = await payload.count({
    collection: 'properties',
    overrideAccess: true,
  })

  const totalAgencies = await payload.count({
    collection: 'agencies',
    overrideAccess: true,
  })

  const totalRegions = await payload.count({
    collection: 'regions',
    overrideAccess: true,
  })

  const agencyPropertyCounts = await Promise.all(
    agencies.docs.map(async (agency) => {
      const result = await payload.count({
        collection: 'properties',
        where: {
          agency: {
            equals: agency.id,
          },
        },
        overrideAccess: true,
      })

      return {
        agencyId: agency.id,
        count: result.totalDocs,
      }
    }),
  )

  const propertyCountByAgency = Object.fromEntries(
    agencyPropertyCounts.map(({ agencyId, count }) => [agencyId, count]),
  )

  const mapProperties = properties.docs.map((property) => ({
    id: property.id,
    title: property.title,
    slug: property.slug,
    price: property.price,
    latitude: property.latitude,
    longitude: property.longitude,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    image:
      typeof property.featuredImage === 'object' && property.featuredImage?.url
        ? property.featuredImage.url
        : null,
  }))

  return (
    <main>
      <section className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <p className="mb-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Scotland Property
        </p>

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-5xl text-5xl font-medium tracking-tight md:text-7xl">
              Luxury homes for sale in Scotland
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Discover estates, castles, country houses and exceptional homes across Scotland.
            </p>

            <Search suggestions={searchSuggestions} placeholder="⌕ Search Scotland..." />

            <div className="mt-10 grid max-w-3xl grid-cols-3 border-t border-b py-6">
              <div>
                <p className="text-3xl font-medium">{totalProperties.totalDocs}+</p>
                <p className="text-sm text-muted-foreground">Properties</p>
              </div>

              <div>
                <p className="text-3xl font-medium">{totalAgencies.totalDocs}+</p>
                <p className="text-sm text-muted-foreground">Agencies</p>
              </div>

              <div>
                <p className="text-3xl font-medium">{totalRegions.totalDocs}</p>
                <p className="text-sm text-muted-foreground">Regions</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="bg-black px-6 py-3 text-white">
              Browse Properties
            </Link>

            <Link href="/properties/map" className="border px-6 py-3">
              Map Search
            </Link>
          </div>
        </div>
        <div className="my-10">
          <SavedHeaderLinks />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {properties.docs.slice(0, 2).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
          <div className="min-h-[520px] overflow-hidden border lg:row-span-2">
            <PropertyMapClient properties={mapProperties} />
          </div>
          {properties.docs.slice(2, 4).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {properties.docs.slice(4, 7).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10">
          <Link href="/properties" className="inline-block border px-6 py-3">
            View all properties
          </Link>
        </div>

        <section className="mt-24 border-t pt-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                Our Partners
              </p>

              <h2 className="text-3xl font-semibold">Featured Agencies</h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.docs.map((agency) => {
              const logo =
                typeof agency.logo === 'object' && agency.logo?.url ? agency.logo.url : null

              const propertyCount = propertyCountByAgency[agency.id] ?? 0

              return (
                <Link
                  key={agency.id}
                  href={`/agency/${agency.slug}`}
                  className="group border border-gray-200 p-6 transition hover:border-black"
                >
                  <div className="mb-6 flex h-24 items-center justify-center">
                    {logo ? (
                      <img
                        src={logo}
                        alt={agency.name}
                        className="max-h-16 max-w-[180px] object-contain"
                      />
                    ) : (
                      <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
                        {agency.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{agency.name}</h3>

                    <p className="text-sm text-muted-foreground">
                      {propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}
                    </p>
                  </div>

                  {agency.address?.city && (
                    <p className="mt-1 text-sm text-muted-foreground">{agency.address.city}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      </section>
    </main>
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
      className="group relative  block border overflow-hidden"
    >
      <SavePropertyButton propertyId={String(property.id)} />
      <PropertyCardSlider images={images} title={property.title} />

      <div className="space-y-2  p-6">
        <p className="text-xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

        {(region || town) && (
          <p className="text-sm text-muted-foreground">
            {town?.name ? `${town.name}, ` : ''}
            {region?.name || ''}
          </p>
        )}

        <h2 className="text-lg font-medium">{property.title}</h2>

        <p className="text-sm text-muted-foreground">
          {property.bedrooms ? `${property.bedrooms} beds` : null}
          {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
        </p>
      </div>
    </Link>
  )
}
