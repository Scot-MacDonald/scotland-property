'use client'

import 'leaflet/dist/leaflet.css'
import Image from 'next/image'

import L from 'leaflet'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

type MapProperty = {
  id: string
  title: string
  slug: string
  price?: number | null
  latitude?: number | null
  longitude?: number | null
  image?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
}

type Props = {
  properties: MapProperty[]
  showListControl?: boolean
}

function formatPrice(price?: number | null) {
  if (!price) return 'POA'

  return `£${price.toLocaleString('en-GB')}`
}

const dotIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      background: black;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function FitBounds({
  properties,
}: {
  properties: {
    latitude?: number | null
    longitude?: number | null
  }[]
}) {
  const map = useMap()

  useEffect(() => {
    const points = properties
      .filter(
        (property) =>
          typeof property.latitude === 'number' && typeof property.longitude === 'number',
      )
      .map((property) => [property.latitude!, property.longitude!] as [number, number])

    if (points.length === 1) {
      map.setView(points[0], 12)
    }

    if (points.length > 1) {
      map.fitBounds(points, {
        padding: [70, 70],
      })
    }
  }, [map, properties])

  return null
}

function PropertyList({ properties, onClose }: { properties: MapProperty[]; onClose: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 top-4 z-[1000] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col border bg-white shadow-xl">
      {/* List header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Map results
          </p>

          <p className="mt-0.5 text-sm">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close property list"
          className="flex h-8 w-8 items-center justify-center border text-lg transition hover:bg-black hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Results */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.slug}`}
            className="group grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b p-4 transition hover:bg-neutral-50"
          >
            {property.image ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-neutral-100" />
            )}

            <div className="min-w-0">
              <p className="text-sm font-medium">{formatPrice(property.price)}</p>

              <h2 className="mt-1 line-clamp-2 text-sm leading-snug">{property.title}</h2>

              <p className="mt-2 text-xs text-muted-foreground">
                {property.bedrooms
                  ? `${property.bedrooms} ${property.bedrooms === 1 ? 'bed' : 'beds'}`
                  : null}

                {property.bedrooms && property.bathrooms ? ' · ' : null}

                {property.bathrooms
                  ? `${property.bathrooms} ${property.bathrooms === 1 ? 'bath' : 'baths'}`
                  : null}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PropertyMap({ properties, showListControl = false }: Props) {
  const [listOpen, setListOpen] = useState(false)

  const propertiesWithCoords = properties.filter(
    (property) => typeof property.latitude === 'number' && typeof property.longitude === 'number',
  )

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer center={[56.4907, -4.2026]} zoom={6} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds properties={propertiesWithCoords} />

        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={dotIcon}
          >
            <Popup closeButton={false} minWidth={260} maxWidth={260}>
              <div className="w-[260px] overflow-hidden bg-white">
                {property.image ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-4">
                  <p className="text-base font-medium leading-snug">{property.title}</p>

                  <p className="mt-2 text-sm font-medium">{formatPrice(property.price)}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {property.bedrooms
                      ? `${property.bedrooms} ${property.bedrooms === 1 ? 'bed' : 'beds'}`
                      : null}

                    {property.bedrooms && property.bathrooms ? ' · ' : null}

                    {property.bathrooms
                      ? `${property.bathrooms} ${property.bathrooms === 1 ? 'bath' : 'baths'}`
                      : null}
                  </p>

                  <Link
                    href={`/property/${property.slug}`}
                    className="mt-4 inline-flex h-9 items-center border px-4 text-[10px] font-medium uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
                  >
                    View property
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Property count */}
      <div className="pointer-events-none absolute right-4 top-4 z-[900] border bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Scotland
        </p>

        <p className="mt-1 text-sm">
          {propertiesWithCoords.length}{' '}
          {propertiesWithCoords.length === 1 ? 'property' : 'properties'}
        </p>
      </div>

      {/* Show list */}
      {showListControl && !listOpen ? (
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="absolute bottom-6 left-1/2 z-[1000] flex h-11 -translate-x-1/2 items-center gap-3 border border-black bg-black px-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-white hover:text-black"
        >
          <span className="text-sm leading-none">☰</span>

          <span>Show list · {propertiesWithCoords.length}</span>
        </button>
      ) : null}

      {showListControl && listOpen ? (
        <PropertyList properties={propertiesWithCoords} onClose={() => setListOpen(false)} />
      ) : null}
    </div>
  )
}
