'use client'

import { useEffect, useRef, useState } from 'react'
import { FilterDrawer } from './FilterDrawer'

type Props = {
  currentRegion?: string
  currentTown?: string
  currentBedrooms?: string
  currentMinPrice?: string
  currentMaxPrice?: string
  currentType?: string
  currentAmenities?: string
  regions?: {
    id: string
    name: string
  }[]
  propertyTypes?: {
    id: string
    name: string
  }[]
  amenities?: {
    id: string
    name: string
  }[]
  towns?: {
    id: string
    name: string
  }[]
}

function updateQuery(key: string, value: string) {
  const params = new URLSearchParams(window.location.search)

  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }

  const queryString = params.toString()
  window.location.href = queryString ? `/properties?${queryString}` : '/properties'
}

function Arrow({ open }: { open: boolean }) {
  return <span className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>⌄</span>
}

export function PropertyFiltersBar({
  currentRegion,
  currentBedrooms,
  currentMinPrice,
  currentMaxPrice,
  currentType,
  currentAmenities,
  regions,
  propertyTypes,
  amenities,
  currentTown,
  towns,
}: Props) {
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenFilter(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const dropdownClass =
    'absolute left-0 top-full z-40 mt-2 w-full origin-top border bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150'

  const triggerClass =
    'flex min-w-[180px] items-center justify-between border px-5 py-3 text-left text-sm'

  const optionClass = 'block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50'

  return (
    <div ref={wrapperRef} className="mb-8 mt-8 flex flex-wrap gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
          className={triggerClass}
        >
          <span>{propertyTypes?.find((type) => type.id === currentType)?.name || 'Type'}</span>
          <Arrow open={openFilter === 'type'} />
        </button>

        {openFilter === 'type' && (
          <div className={dropdownClass}>
            <button
              type="button"
              onClick={() => {
                updateQuery('type', '')
                setOpenFilter(null)
              }}
              className={`${optionClass} ${!currentType ? 'bg-black text-white hover:bg-black' : ''}`}
            >
              Any type
            </button>

            {propertyTypes?.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  updateQuery('type', type.id)
                  setOpenFilter(null)
                }}
                className={`${optionClass} ${
                  currentType === type.id ? 'bg-black text-white hover:bg-black' : ''
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
          className={triggerClass}
        >
          <span>
            {currentMinPrice === '500000' && currentMaxPrice === '1000000'
              ? '£500k – £1m'
              : currentMinPrice === '1000000' && currentMaxPrice === '2500000'
                ? '£1m – £2.5m'
                : currentMinPrice === '2500000' && !currentMaxPrice
                  ? '£2.5m+'
                  : 'Price'}
          </span>
          <Arrow open={openFilter === 'price'} />
        </button>

        {openFilter === 'price' && (
          <div className={dropdownClass}>
            {[
              { label: 'Any price', value: '' },
              { label: '£500k – £1m', value: '500000-1000000' },
              { label: '£1m – £2.5m', value: '1000000-2500000' },
              { label: '£2.5m+', value: '2500000-' },
            ].map((option) => {
              const selected =
                (option.value === '' && !currentMinPrice && !currentMaxPrice) ||
                (option.value === '500000-1000000' &&
                  currentMinPrice === '500000' &&
                  currentMaxPrice === '1000000') ||
                (option.value === '1000000-2500000' &&
                  currentMinPrice === '1000000' &&
                  currentMaxPrice === '2500000') ||
                (option.value === '2500000-' && currentMinPrice === '2500000' && !currentMaxPrice)

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)

                    params.delete('minPrice')
                    params.delete('maxPrice')

                    if (option.value === '500000-1000000') {
                      params.set('minPrice', '500000')
                      params.set('maxPrice', '1000000')
                    }

                    if (option.value === '1000000-2500000') {
                      params.set('minPrice', '1000000')
                      params.set('maxPrice', '2500000')
                    }

                    if (option.value === '2500000-') {
                      params.set('minPrice', '2500000')
                    }

                    const queryString = params.toString()
                    window.location.href = queryString
                      ? `/properties?${queryString}`
                      : '/properties'

                    setOpenFilter(null)
                  }}
                  className={`${optionClass} ${selected ? 'bg-black text-white hover:bg-black' : ''}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'beds' ? null : 'beds')}
          className={triggerClass}
        >
          <span>{currentBedrooms ? `${currentBedrooms}+ Beds` : 'Beds'}</span>
          <Arrow open={openFilter === 'beds'} />
        </button>

        {openFilter === 'beds' && (
          <div className={dropdownClass}>
            {[
              { label: 'Any beds', value: '' },
              { label: '1+ Beds', value: '1' },
              { label: '2+ Beds', value: '2' },
              { label: '3+ Beds', value: '3' },
              { label: '4+ Beds', value: '4' },
              { label: '5+ Beds', value: '5' },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  updateQuery('bedrooms', option.value)
                  setOpenFilter(null)
                }}
                className={`${optionClass} ${
                  currentBedrooms === option.value ? 'bg-black text-white hover:bg-black' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'region' ? null : 'region')}
          className={triggerClass}
        >
          <span>{regions?.find((region) => region.id === currentRegion)?.name || 'Region'}</span>
          <Arrow open={openFilter === 'region'} />
        </button>

        {openFilter === 'region' && (
          <div className={dropdownClass}>
            <button
              type="button"
              onClick={() => {
                updateQuery('region', '')
                setOpenFilter(null)
              }}
              className={`${optionClass} ${
                !currentRegion ? 'bg-black text-white hover:bg-black' : ''
              }`}
            >
              Any region
            </button>

            {regions?.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => {
                  updateQuery('region', region.id)
                  setOpenFilter(null)
                }}
                className={`${optionClass} ${
                  currentRegion === region.id ? 'bg-black text-white hover:bg-black' : ''
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'town' ? null : 'town')}
          className={triggerClass}
        >
          <span>{towns?.find((town) => town.id === currentTown)?.name || 'Town'}</span>
          <Arrow open={openFilter === 'town'} />
        </button>

        {openFilter === 'town' && (
          <div className={dropdownClass}>
            <button
              type="button"
              onClick={() => {
                updateQuery('town', '')
                setOpenFilter(null)
              }}
              className={`${optionClass} ${!currentTown ? 'bg-black text-white hover:bg-black' : ''}`}
            >
              Any town
            </button>

            {towns?.map((town) => (
              <button
                key={town.id}
                type="button"
                onClick={() => {
                  updateQuery('town', town.id)
                  setOpenFilter(null)
                }}
                className={`${optionClass} ${
                  currentTown === town.id ? 'bg-black text-white hover:bg-black' : ''
                }`}
              >
                {town.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === 'amenities' ? null : 'amenities')}
          className={triggerClass}
        >
          <span>
            {amenities?.find((amenity) => amenity.id === currentAmenities)?.name || 'Amenities'}
          </span>
          <Arrow open={openFilter === 'amenities'} />
        </button>

        {openFilter === 'amenities' && (
          <div className={dropdownClass}>
            <button
              type="button"
              onClick={() => {
                updateQuery('amenities', '')
                setOpenFilter(null)
              }}
              className={`${optionClass} ${
                !currentAmenities ? 'bg-black text-white hover:bg-black' : ''
              }`}
            >
              Any amenity
            </button>

            {amenities?.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => {
                  updateQuery('amenities', amenity.id)
                  setOpenFilter(null)
                }}
                className={`${optionClass} ${
                  currentAmenities === amenity.id ? 'bg-black text-white hover:bg-black' : ''
                }`}
              >
                {amenity.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="bg-black px-6 py-3 text-sm text-white"
      >
        All Filters
      </button>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/properties'
        }}
        className="border px-6 py-3 text-sm"
      >
        Clear
      </button>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
    </div>
  )
}
