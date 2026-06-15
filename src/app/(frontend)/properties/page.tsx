import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { PropertyFiltersBar } from '@/components/PropertyFiltersBar'
import { PropertyCardSlider } from '@/components/PropertyCardSlider'
import { SavePropertyButton } from '@/components/SavePropertyButton'
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

  function createFilterHref(newParams: {
    q?: string | null
    region?: string | null
    town?: string | null
    type?: string | null
    minPrice?: string | null
    maxPrice?: string | null
    bedrooms?: string | null
    amenities?: string | null
  }) {
    const query = new URLSearchParams()

    const q = newParams.q !== undefined ? newParams.q : params.q
    const region = newParams.region !== undefined ? newParams.region : params.region
    const town = newParams.town !== undefined ? newParams.town : params.town
    const type = newParams.type !== undefined ? newParams.type : params.type
    const minPrice = newParams.minPrice !== undefined ? newParams.minPrice : params.minPrice
    const maxPrice = newParams.maxPrice !== undefined ? newParams.maxPrice : params.maxPrice
    const bedrooms = newParams.bedrooms !== undefined ? newParams.bedrooms : params.bedrooms
    const amenities = newParams.amenities !== undefined ? newParams.amenities : params.amenities
    if (q) query.set('q', q)
    if (region) query.set('region', region)
    if (town) query.set('town', town)
    if (type) query.set('type', type)
    if (minPrice) query.set('minPrice', minPrice)
    if (maxPrice) query.set('maxPrice', maxPrice)
    if (bedrooms) query.set('bedrooms', bedrooms)
    if (amenities) query.set('amenities', amenities)

    const queryString = query.toString()
    return queryString ? `/properties?${queryString}` : '/properties'
  }

  const payload = await getPayload({ config: configPromise })

  const regions = await payload.find({
    collection: 'regions',
    limit: 100,
  })

  const towns = await payload.find({
    collection: 'towns',
    limit: 100,
  })

  const propertyTypes = await payload.find({
    collection: 'property-types',
    limit: 100,
  })
  const amenities = await payload.find({
    collection: 'amenities',
    limit: 100,
  })

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

  const isPrice500To1m = params.minPrice === '500000' && params.maxPrice === '1000000'
  const isPrice1mTo25m = params.minPrice === '1000000' && params.maxPrice === '2500000'
  const isPrice25mPlus = params.minPrice === '2500000' && !params.maxPrice

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Real Estate</p>
        <h1 className="text-4xl font-medium tracking-tight">Properties for Sale in Scotland</h1>
        <PropertyFiltersBar
          currentRegion={params.region}
          currentBedrooms={params.bedrooms}
          currentTown={params.town}
          currentMinPrice={params.minPrice}
          currentMaxPrice={params.maxPrice}
          currentType={params.type}
          currentAmenities={params.amenities}
          regions={regions.docs.map((region) => ({
            id: String(region.id),
            name: region.name,
          }))}
          propertyTypes={propertyTypes.docs.map((type) => ({
            id: String(type.id),
            name: type.name,
          }))}
          amenities={amenities.docs.map((amenity) => ({
            id: String(amenity.id),
            name: amenity.name,
          }))}
          towns={towns.docs.map((town) => ({
            id: String(town.id),
            name: town.name,
          }))}
        />
        {params.q && (
          <p className="mt-2 text-muted-foreground">
            Search results for <span className="font-medium text-foreground">“{params.q}”</span>
          </p>
        )}
        <p className="mt-2 text-muted-foreground">{properties.totalDocs} properties found</p>
      </div>

      <div className="mb-10">
        <Link href="/properties/map" className="border px-4 py-2 text-sm">
          View Map
        </Link>
      </div>
      {false && (
        <div className="mb-12 space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Regions
            </h2>

            <div className="flex flex-wrap gap-3">
              {regions.docs.map((region) => (
                <Link
                  key={region.id}
                  href={createFilterHref({ region: region.id })}
                  className={`border px-4 py-2 text-sm ${
                    params.region === region.id ? 'bg-black text-white' : ''
                  }`}
                >
                  {region.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Towns
            </h2>

            <div className="flex flex-wrap gap-3">
              {towns.docs.map((town) => (
                <Link
                  key={town.id}
                  href={createFilterHref({ town: town.id })}
                  className={`border px-4 py-2 text-sm ${
                    params.town === town.id ? 'bg-black text-white' : ''
                  }`}
                >
                  {town.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Price Range
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                href={createFilterHref({
                  minPrice: '500000',
                  maxPrice: '1000000',
                })}
                className={`border px-4 py-2 text-sm ${isPrice500To1m ? 'bg-black text-white' : ''}`}
              >
                £500k – £1m
              </Link>

              <Link
                href={createFilterHref({
                  minPrice: '1000000',
                  maxPrice: '2500000',
                })}
                className={`border px-4 py-2 text-sm ${isPrice1mTo25m ? 'bg-black text-white' : ''}`}
              >
                £1m – £2.5m
              </Link>

              <Link
                href={createFilterHref({
                  minPrice: '2500000',
                  maxPrice: null,
                })}
                className={`border px-4 py-2 text-sm ${isPrice25mPlus ? 'bg-black text-white' : ''}`}
              >
                £2.5m+
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Property Types
            </h2>

            <div className="flex flex-wrap gap-3">
              {propertyTypes.docs.map((type) => (
                <Link
                  key={type.id}
                  href={createFilterHref({ type: type.id })}
                  className={`border px-4 py-2 text-sm ${
                    params.type === type.id ? 'bg-black text-white' : ''
                  }`}
                >
                  {type.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Bedrooms
            </h2>

            <div className="flex flex-wrap gap-3">
              {['1', '2', '3', '4', '5'].map((bedroom) => (
                <Link
                  key={bedroom}
                  href={createFilterHref({ bedrooms: bedroom })}
                  className={`border px-4 py-2 text-sm ${
                    params.bedrooms === bedroom ? 'bg-black text-white' : ''
                  }`}
                >
                  {bedroom}+
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/properties"
              className={`border px-4 py-2 text-sm ${
                !params.q &&
                !params.region &&
                !params.town &&
                !params.type &&
                !params.minPrice &&
                !params.maxPrice &&
                !params.bedrooms
                  ? 'bg-black text-white'
                  : ''
              }`}
            >
              All Properties
            </Link>

            {(params.q ||
              params.region ||
              params.town ||
              params.type ||
              params.minPrice ||
              params.maxPrice ||
              params.bedrooms) && (
              <Link href="/properties" className="border px-4 py-2 text-sm">
                Clear Filters
              </Link>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.docs.map((property) => {
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
              key={property.id}
              href={`/property/${property.slug}`}
              className="group block relative  overflow-hidden border"
            >
              <SavePropertyButton propertyId={String(property.id)} />
              <PropertyCardSlider images={images} title={property.title} />

              <div className="space-y-2 px-1 pb-2 pt-4">
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
        })}
      </div>
    </main>
  )
}
