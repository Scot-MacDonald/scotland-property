'use client'

import { useEffect, useState } from 'react'
import { PriceSlider } from '@/components/Search/PriceSlider'

type Option = {
  id: string
  name: string
}

type Props = {
  open: boolean
  onClose: () => void
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

type DraftFilters = {
  type?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  region?: string
  town?: string
  amenities?: string
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[120px] border px-5 py-3 text-left text-sm transition ${
        active ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50'
      }`}
    >
      {children}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-8">
      <h3 className="mb-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>

      <div className="flex flex-wrap gap-3">{children}</div>
    </section>
  )
}

export function FilterDrawer({
  open,
  onClose,
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
  const [draft, setDraft] = useState<DraftFilters>({})

  useEffect(() => {
    if (!open) return

    setDraft({
      type: currentType,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      bedrooms: currentBedrooms,
      region: currentRegion,
      town: currentTown,
      amenities: currentAmenities,
    })
  }, [
    open,
    currentType,
    currentMinPrice,
    currentMaxPrice,
    currentBedrooms,
    currentRegion,
    currentTown,
    currentAmenities,
  ])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  function updateDraft(key: keyof DraftFilters, value?: string) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updatePrice(minPrice?: string, maxPrice?: string) {
    setDraft((current) => ({
      ...current,
      minPrice,
      maxPrice,
    }))
  }

  function applyFilters() {
    const params = new URLSearchParams(window.location.search)

    const entries: [keyof DraftFilters, string][] = [
      ['type', 'type'],
      ['minPrice', 'minPrice'],
      ['maxPrice', 'maxPrice'],
      ['bedrooms', 'bedrooms'],
      ['region', 'region'],
      ['town', 'town'],
      ['amenities', 'amenities'],
    ]

    entries.forEach(([draftKey, paramKey]) => {
      const value = draft[draftKey]

      if (value) {
        params.set(paramKey, value)
      } else {
        params.delete(paramKey)
      }
    })

    const queryString = params.toString()
    window.location.href = queryString ? `/properties?${queryString}` : '/properties'
  }

  function clearDraft() {
    setDraft({})
  }

  const activeCount = Object.values(draft).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-[999]">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="absolute bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto border-t bg-[#f7f6f2]">
        <div className="sticky top-0 z-10 border-b bg-[#f7f6f2] px-5 py-4">
          <div className="mx-auto mb-4 h-px w-24 bg-neutral-300" />

          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-[0.25em]">Filters</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {activeCount ? `${activeCount} selected` : 'Refine your property search'}
              </p>
            </div>

            <button type="button" onClick={onClose} className="border px-4 py-2 text-sm">
              Close
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 pb-32">
          <Section title="Property type">
            <Chip active={!draft.type} onClick={() => updateDraft('type', undefined)}>
              Any type
            </Chip>

            {propertyTypes?.map((type) => (
              <Chip
                key={type.id}
                active={draft.type === type.id}
                onClick={() => updateDraft('type', type.id)}
              >
                {type.name}
              </Chip>
            ))}
          </Section>

          <Section title="Price">
            <div className="w-full">
              <PriceSlider
                minPrice={draft.minPrice}
                maxPrice={draft.maxPrice}
                onChange={({ minPrice, maxPrice }) => {
                  updatePrice(minPrice, maxPrice)
                }}
              />
            </div>
          </Section>

          <Section title="Bedrooms">
            {[
              { label: 'Any beds', value: undefined },
              { label: '1+', value: '1' },
              { label: '2+', value: '2' },
              { label: '3+', value: '3' },
              { label: '4+', value: '4' },
              { label: '5+', value: '5' },
            ].map((option) => (
              <Chip
                key={option.label}
                active={draft.bedrooms === option.value}
                onClick={() => updateDraft('bedrooms', option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </Section>

          <Section title="Region">
            <Chip active={!draft.region} onClick={() => updateDraft('region', undefined)}>
              Any region
            </Chip>

            {regions?.map((region) => (
              <Chip
                key={region.id}
                active={draft.region === region.id}
                onClick={() => updateDraft('region', region.id)}
              >
                {region.name}
              </Chip>
            ))}
          </Section>

          <Section title="Town">
            <Chip active={!draft.town} onClick={() => updateDraft('town', undefined)}>
              Any town
            </Chip>

            {towns?.map((town) => (
              <Chip
                key={town.id}
                active={draft.town === town.id}
                onClick={() => updateDraft('town', town.id)}
              >
                {town.name}
              </Chip>
            ))}
          </Section>

          <Section title="Amenities">
            <Chip active={!draft.amenities} onClick={() => updateDraft('amenities', undefined)}>
              Any amenity
            </Chip>

            {amenities?.map((amenity) => (
              <Chip
                key={amenity.id}
                active={draft.amenities === amenity.id}
                onClick={() => updateDraft('amenities', amenity.id)}
              >
                {amenity.name}
              </Chip>
            ))}
          </Section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-white px-5 py-4">
          <div className="mx-auto flex max-w-5xl justify-between gap-3">
            <button type="button" onClick={clearDraft} className="border px-6 py-3 text-sm">
              Clear
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="bg-black px-6 py-3 text-sm text-white"
            >
              Show Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
