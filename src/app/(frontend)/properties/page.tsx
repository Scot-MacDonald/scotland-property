import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { PageHeading } from '@/components/design'
import { PropertyCard } from '@/components/Property/PropertyCard'
import { SaveSearchButton } from '@/components/SaveSearchButton'
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

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [regions, towns, propertyTypes, amenities] = await Promise.all([
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
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    }),
  ])

  /*
   * Public Region/Town/Property Type filters use readable slugs.
   *
   * Examples:
   * /properties?region=highland&town=inverness
   * /properties?type=house
   * /properties?region=highland&type=country-house
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

  const selectedAmenity = amenities.docs.find((amenity) => String(amenity.id) === params.amenities)

  /*
   * Search suggestions.
   *
   * Town suggestions include their parent Region where available,
   * giving us canonical URLs such as:
   *
   * /properties?region=highland&town=inverness
   *
   * Property Type suggestions use their public slug:
   *
   * /properties?type=house
   */
  const searchSuggestions = [
    ...towns.docs.map((town) => {
      const region = typeof town.region === 'object' && town.region ? town.region : undefined

      return {
        label: town.name,
        href: region
          ? `/properties?region=${encodeURIComponent(
              region.slug,
            )}&town=${encodeURIComponent(town.slug)}`
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

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 24,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  const allPrices = await payload.find({
    collection: 'properties',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    select: {
      price: true,
    },
  })

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

  const savedSearchLabelParts = [
    selectedTown?.name,
    selectedRegion?.name,
    selectedType?.name,
    selectedAmenity?.name,
    params.minPrice === '500000' && params.maxPrice === '1000000'
      ? '£500k – £1m'
      : params.minPrice === '1000000' && params.maxPrice === '2500000'
        ? '£1m – £2.5m'
        : params.minPrice === '2500000'
          ? '£2.5m+'
          : null,
    params.bedrooms ? `${params.bedrooms}+ Beds` : null,
    params.q ? `Search: ${params.q}` : null,
  ].filter(Boolean)

  const savedSearchLabel =
    savedSearchLabelParts.length > 0 ? savedSearchLabelParts.join(' · ') : 'All properties'

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
              <Search currentQuery={params.q} suggestions={searchSuggestions} embedded />
            </div>

            {/* Vertical divider immediately after Search */}
            <div className="hidden lg:block lg:flex-1 lg:border-l" />

            <div className="shrink-0 border-t lg:border-t-0">
              <SavedHeaderLinks />
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <section className="mx-auto w-full max-w-[1680px] px-4 py-10 md:px-8 md:py-12">
        <div className="mb-8">
          <PageHeading
            eyebrow="Property / Scotland"
            title="Properties for Sale in Scotland"
            description="Discover castles, country estates, waterfront homes, lodges and exceptional residences across Scotland."
          />

          {params.q ? (
            <p className="mt-6 text-muted-foreground">
              Search results for <span className="font-medium text-foreground">“{params.q}”</span>
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-medium">{properties.totalDocs}</span>{' '}
              <span className="text-muted-foreground">
                {properties.totalDocs === 1 ? 'property found' : 'properties found'}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <SaveSearchButton
                searchLabel={savedSearchLabel}
                searchParams={{
                  region: params.region,
                  town: params.town,
                  type: params.type,
                  minPrice: params.minPrice,
                  maxPrice: params.maxPrice,
                  bedrooms: params.bedrooms,
                  amenities: params.amenities,
                  q: params.q,
                }}
              />

              <span className="text-sm text-muted-foreground">
                Save this search and return to it later.
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.docs.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  )
}
