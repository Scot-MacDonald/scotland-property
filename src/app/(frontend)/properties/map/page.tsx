import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { PropertyMapClient } from '@/components/PropertyMapClient'
import { SavedHeaderLinks } from '@/components/SavedHeaderLinks'
import { Search, SearchToolbar } from '@/components/Search'

type Props = {
  searchParams: Promise<{
    q?: string
    region?: string
    town?: string
    type?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    amenities?: string
  }>
}

export default async function PropertiesMapPage({ searchParams }: Props) {
  const params = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [regions, towns, propertyTypes, amenities, allPrices] = await Promise.all([
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
   * Public Region/Town/Property Type filters use readable slugs.
   *
   * Examples:
   * /properties/map?region=highland&town=inverness
   * /properties/map?type=house
   * /properties/map?region=highland&type=country-house
   *
   * Payload still receives the underlying relationship IDs below.
   */
  const selectedRegion = params.region
    ? regions.docs.find((region) => region.slug === params.region)
    : undefined

  const selectedTown = params.town
    ? towns.docs.find((town) => town.slug === params.town)
    : undefined

  const selectedType = params.type
    ? propertyTypes.docs.find((propertyType) => propertyType.slug === params.type)
    : undefined

  /*
   * Build the same Payload filters as /properties.
   */
  const andFilters: Where[] = []

  if (params.q) {
    andFilters.push({
      or: [
        {
          title: {
            contains: params.q,
          },
        },
        {
          excerpt: {
            contains: params.q,
          },
        },
        {
          'town.name': {
            contains: params.q,
          },
        },
        {
          'region.name': {
            contains: params.q,
          },
        },
      ],
    })
  }

  /*
   * Resolve public slugs back to Payload relationship IDs.
   */
  if (selectedRegion) {
    andFilters.push({
      region: {
        equals: selectedRegion.id,
      },
    })
  }

  if (selectedTown) {
    andFilters.push({
      town: {
        equals: selectedTown.id,
      },
    })
  }

  if (selectedType) {
    andFilters.push({
      propertyType: {
        equals: selectedType.id,
      },
    })
  }

  if (params.minPrice || params.maxPrice) {
    const priceFilter: {
      greater_than_equal?: number
      less_than_equal?: number
    } = {}

    if (params.minPrice) {
      priceFilter.greater_than_equal = Number(params.minPrice)
    }

    if (params.maxPrice) {
      priceFilter.less_than_equal = Number(params.maxPrice)
    }

    andFilters.push({
      price: priceFilter,
    })
  }

  if (params.bedrooms) {
    andFilters.push({
      bedrooms: {
        greater_than_equal: Number(params.bedrooms),
      },
    })
  }

  if (params.amenities) {
    andFilters.push({
      amenities: {
        contains: params.amenities,
      },
    })
  }

  const where: Where | undefined =
    andFilters.length > 0
      ? {
          and: andFilters,
        }
      : undefined

  /*
   * Only properties matching the active filters are loaded onto the map.
   */
  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  /*
   * Map search suggestions stay on /properties/map and use
   * the same canonical Region/Town/Property Type slug structure.
   */
  const searchSuggestions = [
    ...towns.docs.map((town) => {
      const region = typeof town.region === 'object' && town.region ? town.region : undefined

      return {
        label: town.name,
        href: region
          ? `/properties/map?region=${encodeURIComponent(
              region.slug,
            )}&town=${encodeURIComponent(town.slug)}`
          : `/properties/map?town=${encodeURIComponent(town.slug)}`,
        type: 'Town' as const,
      }
    }),

    ...regions.docs.map((region) => ({
      label: region.name,
      href: `/properties/map?region=${encodeURIComponent(region.slug)}`,
      type: 'Region' as const,
    })),

    ...propertyTypes.docs.map((propertyType) => ({
      label: propertyType.name,
      href: `/properties/map?type=${encodeURIComponent(propertyType.slug)}`,
      type: 'Property Type' as const,
    })),
  ]

  /*
   * Price histogram.
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

  const mapProperties = properties.docs.map((property) => ({
    id: String(property.id),
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
      {/* Search / filter utility bar */}
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-8">
        <div className="border">
          <div className="flex flex-col lg:h-12 lg:flex-row lg:items-stretch">
            <div className="flex shrink-0 items-stretch">
              <SearchToolbar
                priceHistogram={priceBuckets}
                currentRegion={params.region}
                currentTown={params.town}
                currentBedrooms={params.bedrooms}
                currentMinPrice={params.minPrice}
                currentMaxPrice={params.maxPrice}
                currentType={params.type}
                currentAmenities={params.amenities}
                regions={regions.docs}
                towns={towns.docs}
                propertyTypes={propertyTypes.docs}
                amenities={amenities.docs}
              />
            </div>

            <div className="w-full border-t lg:w-[480px] lg:border-l lg:border-t-0">
              <Search
                currentQuery={params.q}
                suggestions={searchSuggestions}
                searchPath="/properties/map"
                embedded
              />
            </div>

            <div className="hidden lg:block lg:flex-1 lg:border-l" />

            <div className="shrink-0 border-t lg:border-t-0">
              <SavedHeaderLinks />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mx-auto w-full max-w-[1680px] px-4 md:px-8">
        <section className="relative h-[calc(100vh-145px)] min-h-[620px] overflow-hidden border-x border-b">
          <PropertyMapClient properties={mapProperties} showListControl />
        </section>
      </div>
    </main>
  )
}
