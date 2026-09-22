'use client'

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
      <nav className="flex h-12 items-stretch text-[10px] font-medium uppercase tracking-[0.22em]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center px-5 transition hover:bg-black hover:text-white"
        >
          Region{currentRegion ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center border-l px-5 transition hover:bg-black hover:text-white"
        >
          Price{currentMinPrice || currentMaxPrice ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center border-l px-5 transition hover:bg-black hover:text-white"
        >
          Beds{currentBedrooms ? ' •' : ''}
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center whitespace-nowrap border-l px-5 transition hover:bg-black hover:text-white"
        >
          More Filters{count ? ` (${count})` : ''}
        </button>
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
