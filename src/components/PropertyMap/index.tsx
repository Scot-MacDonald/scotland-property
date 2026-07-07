'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import Link from 'next/link'
import { useEffect } from 'react'

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
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude!, p.longitude!] as [number, number])

    if (points.length === 1) {
      map.setView(points[0], 12)
    }

    if (points.length > 1) {
      map.fitBounds(points, {
        padding: [50, 50],
      })
    }
  }, [map, properties])

  return null
}

export function PropertyMap({ properties }: Props) {
  const propertiesWithCoords = properties.filter(
    (property) => property.latitude && property.longitude,
  )

  return (
    <MapContainer
      center={[56.4907, -4.2026]}
      zoom={6}
      scrollWheelZoom={false}
      className="h-full min-h-[600px] w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <FitBounds properties={propertiesWithCoords} />

      {propertiesWithCoords.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
          icon={dotIcon}
          eventHandlers={{
            mouseover: (event) => {
              event.target.openPopup()
            },
          }}
        >
          <Popup closeButton={false}>
            <div className="w-[260px] overflow-hidden bg-white">
              {property.image && (
                <img
                  src={property.image}
                  alt={property.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}

              <div className="space-y-2 p-3">
                <p className="text-base font-medium leading-snug">{property.title}</p>

                <p className="text-sm font-medium">{formatPrice(property.price)}</p>

                <p className="text-xs text-muted-foreground">
                  {property.bedrooms ? `${property.bedrooms} beds` : null}
                  {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
                </p>

                <Link
                  href={`/property/${property.slug}`}
                  className="inline-block border px-3 py-2 text-xs uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  View property
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
