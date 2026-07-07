'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FilterDrawer } from '@/components/PropertyFiltersBar/FilterDrawer'

type Option = {
  id: string
  name: string
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

function activeCount(values: (string | undefined)[]) {
  return values.filter(Boolean).length
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const count = activeCount([
    currentRegion,
    currentTown,
    currentBedrooms,
    currentMinPrice,
    currentMaxPrice,
    currentType,
    currentAmenities,
  ])

  return (
    <>
      <nav className="flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-t py-5 text-sm uppercase tracking-[0.25em]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="hover:text-neutral-500"
        >
          Type{currentType ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="hover:text-neutral-500"
        >
          Price{currentMinPrice || currentMaxPrice ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="hover:text-neutral-500"
        >
          Beds{currentBedrooms ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="hover:text-neutral-500"
        >
          Filters{count ? ` (${count})` : ''}
        </button>

        <Link href="/properties/map" className="hover:text-neutral-500">
          Map
        </Link>
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
