import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SaveSearchButton } from '@/components/SaveSearchButton'
import { SavedHeaderLinks } from '@/components/SavedHeaderLinks'
import { PageHeading } from '@/components/design'
import { Search, SearchToolbar } from '@/components/Search'
import { PropertyCard } from '@/components/Property/PropertyCard'

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
      limit: 100,
    }),

    payload.find({
      collection: 'towns',
      limit: 100,
    }),

    payload.find({
      collection: 'property-types',
      limit: 100,
    }),

    payload.find({
      collection: 'amenities',
      limit: 100,
    }),
  ])

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

  const andFilters: any[] = []

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

  if (params.region) {
    andFilters.push({
      region: {
        equals: params.region,
      },
    })
  }

  if (params.town) {
    andFilters.push({
      town: {
        equals: params.town,
      },
    })
  }

  if (params.type) {
    andFilters.push({
      propertyType: {
        equals: params.type,
      },
    })
  }

  if (params.minPrice || params.maxPrice) {
    const priceFilter: any = {}

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

  const where = andFilters.length > 0 ? { and: andFilters } : {}

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
    where: {},
    select: {
      price: true,
    },
  })

  const priceBuckets = Array(12).fill(0)
  const maxHistogramPrice = 10000000

  allPrices.docs.forEach((property: any) => {
    if (!property.price) return

    const bucketIndex = Math.min(
      11,
      Math.floor((property.price / maxHistogramPrice) * priceBuckets.length),
    )

    priceBuckets[bucketIndex] += 1
  })

  const selectedRegion = regions.docs.find((region) => String(region.id) === params.region)
  const selectedTown = towns.docs.find((town) => String(town.id) === params.town)
  const selectedType = propertyTypes.docs.find((type) => String(type.id) === params.type)
  const selectedAmenity = amenities.docs.find((amenity) => String(amenity.id) === params.amenities)

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
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <PageHeading
          eyebrow="Scotland Luxury Estates"
          title="Properties for Sale in Scotland"
          description="Discover castles, country estates, waterfront homes, lodges and exceptional residences across Scotland."
        />

        <Search currentQuery={params.q} suggestions={searchSuggestions} />

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

        {params.q ? (
          <p className="mt-6 text-muted-foreground">
            Search results for <span className="font-medium text-foreground">“{params.q}”</span>
          </p>
        ) : null}

        <p className="mt-2 text-muted-foreground">{properties.totalDocs} properties found</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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

        <p className="text-sm text-muted-foreground">Save this search and return to it later.</p>
      </div>

      <div className="my-10">
        <SavedHeaderLinks />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.docs.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </main>
  )
}
