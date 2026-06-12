'use client'

type Props = {
  currentRegion?: string
  currentBedrooms?: string
  currentMinPrice?: string
  currentMaxPrice?: string
  currentType?: string
  regions?: {
    id: string
    name: string
  }[]
  propertyTypes?: {
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

export function PropertyFiltersBar({
  currentRegion,
  currentBedrooms,
  currentMinPrice,
  currentMaxPrice,
  currentType,
  regions,
  propertyTypes,
}: Props) {
  return (
    <div className="mb-8 mt-8 flex flex-wrap gap-3">
      <select
        className="min-w-[180px] border px-6 py-3 text-sm"
        value={currentType || ''}
        onChange={(e) => updateQuery('type', e.target.value)}
      >
        <option value="">Type</option>

        {propertyTypes?.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      <select
        className="min-w-[180px] border px-6 py-3 text-sm"
        value={
          currentMinPrice === '500000' && currentMaxPrice === '1000000'
            ? '500000-1000000'
            : currentMinPrice === '1000000' && currentMaxPrice === '2500000'
              ? '1000000-2500000'
              : currentMinPrice === '2500000' && !currentMaxPrice
                ? '2500000-'
                : ''
        }
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search)
          const value = e.target.value

          params.delete('minPrice')
          params.delete('maxPrice')

          if (value === '500000-1000000') {
            params.set('minPrice', '500000')
            params.set('maxPrice', '1000000')
          }

          if (value === '1000000-2500000') {
            params.set('minPrice', '1000000')
            params.set('maxPrice', '2500000')
          }

          if (value === '2500000-') {
            params.set('minPrice', '2500000')
          }

          const queryString = params.toString()
          window.location.href = queryString ? `/properties?${queryString}` : '/properties'
        }}
      >
        <option value="">Price</option>
        <option value="500000-1000000">£500k – £1m</option>
        <option value="1000000-2500000">£1m – £2.5m</option>
        <option value="2500000-">£2.5m+</option>
      </select>

      <select
        className="min-w-[180px] border px-6 py-3 text-sm"
        value={currentBedrooms || ''}
        onChange={(e) => updateQuery('bedrooms', e.target.value)}
      >
        <option value="">Beds</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="5">5+</option>
      </select>

      <select
        className="min-w-[180px] border px-6 py-3 text-sm"
        value={currentRegion || ''}
        onChange={(e) => updateQuery('region', e.target.value)}
      >
        <option value="">Region</option>

        {regions?.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name}
          </option>
        ))}
      </select>

      <button type="button" className="border px-6 py-3 text-sm">
        Amenities
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
    </div>
  )
}
