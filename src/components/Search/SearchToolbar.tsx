'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { FilterDrawer } from '@/components/PropertyFiltersBar/FilterDrawer'
import { PriceSlider } from '@/components/Search/PriceSlider'

type Option = {
  id: string
  name: string
  slug?: string | null
}

type Props = {
  priceHistogram?: number[]
  currentRegion?: string
  currentTown?: string
  currentBedrooms?: string
  currentMinPrice?: string
  currentMaxPrice?: string
  currentType?: string
  currentAmenities?: string
  regions?: Option[]
  towns?: Option[]
  propertyTypes?: Option[]
  amenities?: Option[]
}

type RegionGroup = {
  label: string
  regions: string[]
}

type PropertyTypeGroup = {
  label: string
  types: string[]
}

const regionColumns: RegionGroup[][] = [
  [
    {
      label: 'Major Cities',
      regions: ['City of Edinburgh', 'Glasgow City', 'Aberdeen City', 'Dundee City'],
    },
    {
      label: 'West & South',
      regions: [
        'Dumfries and Galloway',
        'North Ayrshire',
        'East Ayrshire',
        'South Ayrshire',
        'Inverclyde',
        'Renfrewshire',
        'East Renfrewshire',
      ],
    },
  ],
  [
    {
      label: 'Lothian & Borders',
      regions: ['East Lothian', 'Midlothian', 'West Lothian', 'Scottish Borders'],
    },
    {
      label: 'Central Valley',
      regions: [
        'Stirling',
        'Falkirk',
        'Clackmannanshire',
        'Fife',
        'North Lanarkshire',
        'South Lanarkshire',
      ],
    },
  ],
  [
    {
      label: 'North & Northeast',
      regions: ['Aberdeenshire', 'Moray', 'Angus', 'Perth and Kinross'],
    },
    {
      label: 'East Dunbarton',
      regions: ['East Dunbartonshire', 'West Dunbartonshire', 'Argyll and Bute'],
    },
  ],
  [
    {
      label: 'Highlands & Islands',
      regions: ['Highland', 'Na h-Eileanan Siar', 'Orkney Islands', 'Shetland Islands'],
    },
  ],
]

const propertyTypeColumns: PropertyTypeGroup[][] = [
  [
    {
      label: 'Residential',
      types: ['House', 'Flat / Apartment', 'Cottage', 'Bungalow', 'Townhouse', 'Villa'],
    },
  ],
  [
    {
      label: 'Country & Luxury',
      types: ['Country House', 'Estate', 'Sporting Estate', 'Castle', 'Lodge / Chalet'],
    },
  ],
  [
    {
      label: 'Rural',
      types: ['Farm / Farmhouse', 'Croft', 'Equestrian'],
    },
  ],
  [
    {
      label: 'Land & Forestry',
      types: ['Land', 'Building Plot', 'Woodland / Forestry', 'Development / Investment'],
    },
  ],
  [
    {
      label: 'Commercial',
      types: ['Commercial'],
    },
  ],
]

function activeCount(values: (string | undefined)[]) {
  return values.filter(Boolean).length
}

function formatToolbarPrice(value?: string) {
  if (!value) return undefined

  const price = Number(value)

  if (!Number.isFinite(price)) {
    return undefined
  }

  if (price >= 1_000_000) {
    const millions = price / 1_000_000

    return `£${millions % 1 === 0 ? millions : millions.toFixed(1)}m`
  }

  return `£${Math.round(price / 1000)}k`
}

export function SearchToolbar({
  priceHistogram,
  currentRegion,
  currentTown,
  currentBedrooms,
  currentMinPrice,
  currentMaxPrice,
  currentType,
  currentAmenities,
  regions,
  towns,
  propertyTypes,
  amenities,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const toolbarRef = useRef<HTMLElement>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const [regionOpen, setRegionOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [bedsOpen, setBedsOpen] = useState(false)

  const [draftMinPrice, setDraftMinPrice] = useState<string | undefined>(currentMinPrice)

  const [draftMaxPrice, setDraftMaxPrice] = useState<string | undefined>(currentMaxPrice)

  const count = activeCount([
    currentRegion,
    currentTown,
    currentBedrooms,
    currentMinPrice,
    currentMaxPrice,
    currentType,
    currentAmenities,
  ])

  const currentRegionName = regions?.find((region) => region.slug === currentRegion)?.name

  const currentTypeName = propertyTypes?.find(
    (propertyType) => propertyType.slug === currentType,
  )?.name

  const formattedMinPrice = formatToolbarPrice(currentMinPrice)
  const formattedMaxPrice = formatToolbarPrice(currentMaxPrice)

  const currentPriceLabel =
    formattedMinPrice && formattedMaxPrice
      ? `${formattedMinPrice} – ${formattedMaxPrice}`
      : formattedMinPrice
        ? `${formattedMinPrice}+`
        : formattedMaxPrice
          ? `Up to ${formattedMaxPrice}`
          : 'Any price'

  function getDestinationPath() {
    return pathname === '/' ? '/properties' : pathname
  }

  function closeMenus() {
    setRegionOpen(false)
    setTypeOpen(false)
    setPriceOpen(false)
    setBedsOpen(false)
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (toolbarRef.current?.contains(target)) {
        return
      }

      closeMenus()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function applyRegion(regionSlug?: string) {
    const params = new URLSearchParams(window.location.search)

    if (regionSlug) {
      params.set('region', regionSlug)
    } else {
      params.delete('region')
    }

    params.delete('town')

    const queryString = params.toString()
    const destinationPath = getDestinationPath()

    closeMenus()

    router.push(queryString ? `${destinationPath}?${queryString}` : destinationPath)
  }

  function applyType(typeSlug?: string) {
    const params = new URLSearchParams(window.location.search)

    if (typeSlug) {
      params.set('type', typeSlug)
    } else {
      params.delete('type')
    }

    const queryString = params.toString()
    const destinationPath = getDestinationPath()

    closeMenus()

    router.push(queryString ? `${destinationPath}?${queryString}` : destinationPath)
  }

  function applyPrice() {
    const params = new URLSearchParams(window.location.search)

    if (draftMinPrice) {
      params.set('minPrice', draftMinPrice)
    } else {
      params.delete('minPrice')
    }

    if (draftMaxPrice) {
      params.set('maxPrice', draftMaxPrice)
    } else {
      params.delete('maxPrice')
    }

    const queryString = params.toString()
    const destinationPath = getDestinationPath()

    closeMenus()

    router.push(queryString ? `${destinationPath}?${queryString}` : destinationPath)
  }

  function clearPrice() {
    setDraftMinPrice(undefined)
    setDraftMaxPrice(undefined)

    const params = new URLSearchParams(window.location.search)

    params.delete('minPrice')
    params.delete('maxPrice')

    const queryString = params.toString()
    const destinationPath = getDestinationPath()

    closeMenus()

    router.push(queryString ? `${destinationPath}?${queryString}` : destinationPath)
  }

  function applyBedrooms(bedrooms?: string) {
    const params = new URLSearchParams(window.location.search)

    if (bedrooms) {
      params.set('bedrooms', bedrooms)
    } else {
      params.delete('bedrooms')
    }

    const queryString = params.toString()
    const destinationPath = getDestinationPath()

    closeMenus()

    router.push(queryString ? `${destinationPath}?${queryString}` : destinationPath)
  }

  function getRegionByName(name: string) {
    return regions?.find((region) => region.name === name)
  }

  function getPropertyTypeByName(name: string) {
    return propertyTypes?.find((propertyType) => propertyType.name === name)
  }

  return (
    <>
      <nav
        ref={toolbarRef}
        className="relative flex h-12 items-stretch text-[10px] font-medium uppercase tracking-[0.22em]"
      >
        {/* Region */}
        <button
          type="button"
          aria-expanded={regionOpen}
          aria-haspopup="true"
          onClick={() => {
            const nextOpen = !regionOpen

            closeMenus()

            if (nextOpen) {
              setRegionOpen(true)
            }
          }}
          className={`flex items-center px-5 transition ${
            regionOpen ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          }`}
        >
          Region{currentRegion ? ' •' : ''}
        </button>
        {/* Type */}
        <button
          type="button"
          aria-expanded={typeOpen}
          aria-haspopup="true"
          onClick={() => {
            const nextOpen = !typeOpen

            closeMenus()

            if (nextOpen) {
              setTypeOpen(true)
            }
          }}
          className={`flex items-center border-l px-5 transition ${
            typeOpen ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          }`}
        >
          Type{currentType ? ' •' : ''}
        </button>
        {/* Price */}
        <button
          type="button"
          aria-expanded={priceOpen}
          aria-haspopup="true"
          onClick={() => {
            const nextOpen = !priceOpen

            closeMenus()

            if (nextOpen) {
              setDraftMinPrice(currentMinPrice)
              setDraftMaxPrice(currentMaxPrice)
              setPriceOpen(true)
            }
          }}
          className={`flex items-center border-l px-5 transition ${
            priceOpen ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          }`}
        >
          Price{currentMinPrice || currentMaxPrice ? ' •' : ''}
        </button>
        {/* Beds */}
        <button
          type="button"
          aria-expanded={bedsOpen}
          aria-haspopup="true"
          onClick={() => {
            const nextOpen = !bedsOpen

            closeMenus()

            if (nextOpen) {
              setBedsOpen(true)
            }
          }}
          className={`flex items-center border-l px-5 transition ${
            bedsOpen ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
          }`}
        >
          Beds{currentBedrooms ? ' •' : ''}
        </button>
        {/* More Filters */}
        <button
          type="button"
          onClick={() => {
            closeMenus()
            setDrawerOpen(true)
          }}
          className="flex items-center whitespace-nowrap border-l px-5 transition hover:bg-black hover:text-white"
        >
          More Filters{count ? ` (${count})` : ''}
        </button>
        {/* Region dropdown */}
        {regionOpen ? (
          <div className="absolute left-0 top-full z-[1100] w-[min(92vw,1080px)] border bg-white text-black normal-case tracking-normal shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Search by region
                </p>

                <p className="mt-1 text-sm font-medium">{currentRegionName || 'All of Scotland'}</p>
              </div>

              <button
                type="button"
                onClick={() => applyRegion()}
                className={`border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                  !currentRegion
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                Any Region
              </button>
            </div>

            <div className="grid max-h-[72vh] overflow-y-auto md:grid-cols-2 xl:grid-cols-4">
              {regionColumns.map((column, columnIndex) => (
                <div key={columnIndex} className={columnIndex > 0 ? 'md:border-l' : ''}>
                  {column.map((group, groupIndex) => {
                    const availableRegions = group.regions
                      .map((name) => getRegionByName(name))
                      .filter((region): region is Option => Boolean(region))

                    if (!availableRegions.length) {
                      return null
                    }

                    return (
                      <section
                        key={group.label}
                        className={`p-5 ${groupIndex > 0 ? 'border-t' : ''}`}
                      >
                        <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                          {group.label}
                        </h3>

                        <div>
                          {availableRegions.map((region) => {
                            const active = currentRegion === region.slug
                            const canSelect = Boolean(region.slug)

                            return (
                              <button
                                key={region.id}
                                type="button"
                                disabled={!canSelect}
                                onClick={() => {
                                  if (region.slug) {
                                    applyRegion(region.slug)
                                  }
                                }}
                                className={`flex w-full items-center justify-between border-t py-3 text-left text-sm transition first:border-t-0 ${
                                  active
                                    ? 'font-semibold text-black'
                                    : 'text-neutral-700 hover:text-black'
                                } disabled:cursor-not-allowed disabled:opacity-40`}
                              >
                                <span>{region.name}</span>

                                {active ? (
                                  <span
                                    aria-hidden="true"
                                    className="ml-4 text-[9px] font-medium uppercase tracking-[0.18em]"
                                  >
                                    Selected
                                  </span>
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {/* Type dropdown */}
        {typeOpen ? (
          <div className="absolute left-0 top-full z-[1100] w-[min(92vw,920px)] border bg-white text-black normal-case tracking-normal shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Search by type
                </p>

                <p className="mt-1 text-sm font-medium">
                  {currentTypeName || 'All property types'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => applyType()}
                className={`border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                  !currentType
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                Any Type
              </button>
            </div>

            <div className="grid max-h-[72vh] overflow-y-auto md:grid-cols-2 xl:grid-cols-5">
              {propertyTypeColumns.map((column, columnIndex) => (
                <div key={columnIndex} className={columnIndex > 0 ? 'md:border-l' : ''}>
                  {column.map((group, groupIndex) => {
                    const availableTypes = group.types
                      .map((name) => getPropertyTypeByName(name))
                      .filter((propertyType): propertyType is Option => Boolean(propertyType))

                    if (!availableTypes.length) {
                      return null
                    }

                    return (
                      <section
                        key={group.label}
                        className={`px-4 py-4 ${groupIndex > 0 ? 'border-t' : ''}`}
                      >
                        <h3 className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                          {group.label}
                        </h3>

                        <div>
                          {availableTypes.map((propertyType) => {
                            const active = currentType === propertyType.slug

                            const canSelect = Boolean(propertyType.slug)

                            return (
                              <button
                                key={propertyType.id}
                                type="button"
                                disabled={!canSelect}
                                onClick={() => {
                                  if (propertyType.slug) {
                                    applyType(propertyType.slug)
                                  }
                                }}
                                className={`flex w-full items-center justify-between border-t py-2.5 text-left text-[13px] transition first:border-t-0 ${
                                  active
                                    ? 'font-semibold text-black'
                                    : 'text-neutral-700 hover:text-black'
                                } disabled:cursor-not-allowed disabled:opacity-40`}
                              >
                                <span>{propertyType.name}</span>

                                {active ? (
                                  <span
                                    aria-hidden="true"
                                    className="ml-3 text-[8px] font-medium uppercase tracking-[0.14em]"
                                  >
                                    Selected
                                  </span>
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {/* Price dropdown */}
        {priceOpen ? (
          <div className="absolute left-0 top-full z-[1100] w-[min(92vw,520px)] origin-top border bg-white text-black normal-case tracking-normal shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Search by price
                </p>

                <p className="mt-1 text-sm font-medium">{currentPriceLabel}</p>
              </div>

              <button
                type="button"
                onClick={clearPrice}
                className={`border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                  !currentMinPrice && !currentMaxPrice
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                Any Price
              </button>
            </div>

            <div className="px-5 py-5">
              <PriceSlider
                minPrice={draftMinPrice}
                maxPrice={draftMaxPrice}
                histogram={priceHistogram}
                onChange={({ minPrice, maxPrice }) => {
                  setDraftMinPrice(minPrice)
                  setDraftMaxPrice(maxPrice)
                }}
              />
            </div>

            <div className="flex items-center justify-between border-t px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                £100k increments
              </p>

              <button
                type="button"
                onClick={applyPrice}
                className="h-11 bg-black px-6 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
              >
                Apply Price
              </button>
            </div>
          </div>
        ) : null}
        {/* Beds dropdown */}
        {bedsOpen ? (
          <div className="absolute left-0 top-full z-[1100] w-[min(92vw,520px)] origin-top border bg-white text-black normal-case tracking-normal shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                  Search by bedrooms
                </p>

                <p className="mt-1 text-sm font-medium">
                  {currentBedrooms ? `${currentBedrooms}+ bedrooms` : 'Any number of bedrooms'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => applyBedrooms()}
                className={`border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                  !currentBedrooms
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                Any Beds
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-6 border">
                {[
                  { label: 'Any', value: undefined },
                  { label: '1+', value: '1' },
                  { label: '2+', value: '2' },
                  { label: '3+', value: '3' },
                  { label: '4+', value: '4' },
                  { label: '5+', value: '5' },
                ].map((option, index) => {
                  const active = currentBedrooms === option.value

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => applyBedrooms(option.value)}
                      className={`h-14 text-sm transition ${index > 0 ? 'border-l' : ''} ${
                        active ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        priceHistogram={priceHistogram}
        currentRegion={currentRegion}
        currentTown={currentTown}
        currentBedrooms={currentBedrooms}
        currentMinPrice={currentMinPrice}
        currentMaxPrice={currentMaxPrice}
        currentType={currentType}
        currentAmenities={currentAmenities}
        regions={regions}
        towns={towns}
        propertyTypes={propertyTypes}
        amenities={amenities}
      />
    </>
  )
}
