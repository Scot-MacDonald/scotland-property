'use client'

import { useMemo, useState } from 'react'

import { SavedPropertyCard } from './SavedPropertyCard'
import type { SavedProperty } from './types'

type SavedPropertiesGridProps = {
  properties: SavedProperty[]
}

type SortOption = 'recently-saved' | 'price-high' | 'price-low' | 'title'

export function SavedPropertiesGrid({ properties }: SavedPropertiesGridProps) {
  const [sort, setSort] = useState<SortOption>('recently-saved')

  const sortedProperties = useMemo(() => {
    const nextProperties = [...properties]

    switch (sort) {
      case 'price-high':
        return nextProperties.sort(
          (first, second) =>
            (second.price ?? Number.NEGATIVE_INFINITY) - (first.price ?? Number.NEGATIVE_INFINITY),
        )

      case 'price-low':
        return nextProperties.sort(
          (first, second) =>
            (first.price ?? Number.POSITIVE_INFINITY) - (second.price ?? Number.POSITIVE_INFINITY),
        )

      case 'title':
        return nextProperties.sort((first, second) =>
          (first.title || first.reference || '').localeCompare(
            second.title || second.reference || '',
          ),
        )

      default:
        return nextProperties
    }
  }, [properties, sort])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="text-sm text-black/55">
          {properties.length} {properties.length === 1 ? 'saved property' : 'saved properties'}
        </p>

        <label className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-black/40">Sort</span>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="min-w-48 border border-black bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="recently-saved">Recently saved</option>
            <option value="price-high">Price: high to low</option>
            <option value="price-low">Price: low to high</option>
            <option value="title">Property name</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedProperties.map((property) => (
          <SavedPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
