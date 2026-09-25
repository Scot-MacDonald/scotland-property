'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { PriceSlider } from '@/components/Search/PriceSlider'

type RegionOption = {
  id: string
  name: string
  slug?: string | null
}

type TownOption = {
  id: string
  name: string
  slug?: string | null
  region?:
    | string
    | {
        id: string
        slug?: string | null
        name?: string | null
      }
    | null
}

type Option = {
  id: string
  name: string
  slug?: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  priceHistogram?: number[]
  currentRegion?: string
  currentTown?: string
  currentBedrooms?: string
  currentMinPrice?: string
  currentMaxPrice?: string
  currentType?: string
  currentAmenities?: string
  regions?: RegionOption[]
  towns?: TownOption[]
  propertyTypes?: Option[]
  amenities?: Option[]
}

type DrawerContentProps = Props

type DraftFilters = {
  type?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  region?: string
  town?: string
  amenities?: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b py-7 last:border-b-0">
      <h3 className="mb-4 text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
        {title}
      </h3>

      {children}
    </section>
  )
}

function SelectField({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none border bg-white px-4 pr-10 text-sm outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
      >
        {children}
      </select>

      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        fill="none"
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2"
      >
        <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </div>
  )
}

function FilterDrawerContent({
  open,
  onClose,
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
}: DrawerContentProps) {
  const pathname = usePathname()

  const [draft, setDraft] = useState<DraftFilters>(() => ({
    type: currentType,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    bedrooms: currentBedrooms,
    region: currentRegion,
    town: currentTown,
    amenities: currentAmenities,
  }))

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      return
    }

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

  const selectedRegion = regions?.find((region) => region.slug === draft.region)

  const filteredTowns = selectedRegion
    ? (towns ?? []).filter((town) => {
        if (typeof town.region === 'string') {
          return town.region === selectedRegion.id
        }

        if (typeof town.region === 'object' && town.region) {
          return String(town.region.id) === String(selectedRegion.id)
        }

        return false
      })
    : []

  function updateDraft(key: keyof DraftFilters, value?: string) {
    setDraft((current) => ({
      ...current,
      [key]: value || undefined,
    }))
  }

  function updateRegion(value?: string) {
    setDraft((current) => ({
      ...current,
      region: value || undefined,
      town: undefined,
    }))
  }

  function updatePrice(minPrice?: string, maxPrice?: string) {
    setDraft((current) => ({
      ...current,
      minPrice,
      maxPrice,
    }))
  }

  function clearDraft() {
    setDraft({})
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
    const destinationPath = pathname === '/' ? '/properties' : pathname

    window.location.href = queryString ? `${destinationPath}?${queryString}` : destinationPath
  }

  const activeCount = Object.values(draft).filter(Boolean).length

  return (
    <div
      className={`fixed inset-0 z-[1200] transition-[visibility] duration-300 ${
        open ? 'visible' : 'invisible'
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Property filters"
        className={`absolute inset-y-0 left-0 flex w-full max-w-[430px] flex-col border-r bg-white shadow-xl transition-transform duration-300 ease-out will-change-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b px-6 py-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-500">
              Property search
            </p>

            <h2 className="mt-2 text-xl font-medium">Filters</h2>

            <p className="mt-1 text-sm text-neutral-500">
              {activeCount
                ? `${activeCount} ${activeCount === 1 ? 'filter' : 'filters'} selected`
                : 'Refine your property search'}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center border transition hover:bg-black hover:text-white"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
        </div>

        {/* Scrollable filters */}
        <div className="flex-1 overflow-y-auto px-6">
          <Section title="Location">
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-neutral-600">Region</label>

                <SelectField value={draft.region ?? ''} onChange={(value) => updateRegion(value)}>
                  <option value="">Any region</option>

                  {regions?.map((region) => (
                    <option key={region.id} value={region.slug ?? ''} disabled={!region.slug}>
                      {region.name}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div>
                <label className="mb-2 block text-xs text-neutral-600">Town</label>

                <SelectField
                  value={draft.town ?? ''}
                  disabled={!draft.region}
                  onChange={(value) => updateDraft('town', value)}
                >
                  {!draft.region ? (
                    <option value="">Choose a region first</option>
                  ) : (
                    <>
                      <option value="">Any town</option>

                      {filteredTowns.map((town) => (
                        <option key={town.id} value={town.slug ?? ''} disabled={!town.slug}>
                          {town.name}
                        </option>
                      ))}

                      {filteredTowns.length === 0 ? (
                        <option value="" disabled>
                          No towns available
                        </option>
                      ) : null}
                    </>
                  )}
                </SelectField>
              </div>
            </div>
          </Section>

          <Section title="Price">
            <PriceSlider
              minPrice={draft.minPrice}
              maxPrice={draft.maxPrice}
              histogram={priceHistogram}
              onChange={({ minPrice, maxPrice }) => {
                updatePrice(minPrice, maxPrice)
              }}
            />
          </Section>

          <Section title="Bedrooms">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Any', value: undefined },
                { label: '1+', value: '1' },
                { label: '2+', value: '2' },
                { label: '3+', value: '3' },
                { label: '4+', value: '4' },
                { label: '5+', value: '5' },
              ].map((option) => {
                const active = draft.bedrooms === option.value

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => updateDraft('bedrooms', option.value)}
                    className={`h-11 border text-sm transition ${
                      active ? 'bg-black text-white' : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="Property type">
            <SelectField value={draft.type ?? ''} onChange={(value) => updateDraft('type', value)}>
              <option value="">Any property type</option>

              {propertyTypes?.map((type) => (
                <option key={type.id} value={type.slug ?? ''} disabled={!type.slug}>
                  {type.name}
                </option>
              ))}
            </SelectField>
          </Section>

          <Section title="Amenities">
            <SelectField
              value={draft.amenities ?? ''}
              onChange={(value) => updateDraft('amenities', value)}
            >
              <option value="">Any amenity</option>

              {amenities?.map((amenity) => (
                <option key={amenity.id} value={amenity.id}>
                  {amenity.name}
                </option>
              ))}
            </SelectField>
          </Section>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 border-t bg-white p-5">
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <button
              type="button"
              onClick={clearDraft}
              className="h-12 border px-5 text-xs font-medium uppercase tracking-[0.18em] transition hover:bg-neutral-50"
            >
              Clear all
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="h-12 bg-black px-6 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
            >
              Show properties
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export function FilterDrawer(props: Props) {
  return <FilterDrawerContent {...props} />
}
