'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import Link from 'next/link'

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

  if (price >= 1000000) {
    return `£${(price / 1000000).toFixed(price >= 10000000 ? 0 : 1)}m`
  }

  return `£${Math.round(price / 1000)}k`
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

  const points = properties
    .filter((p) => p.latitude && p.longitude)
    .map((p) => [p.latitude!, p.longitude!] as [number, number])

  if (points.length === 1) {
    map.setView(points[0], 12)
    return null
  }

  if (points.length > 1) {
    map.fitBounds(points, {
      padding: [50, 50],
    })
  }

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
          <Popup>
            <div className="w-[220px] space-y-2">
              {property.image && (
                <img
                  src={property.image}
                  alt={property.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}

              <p className="font-medium">{property.title}</p>

              {property.price && <p>£{property.price.toLocaleString('en-GB')}</p>}

              <p className="text-xs text-muted-foreground">
                {property.bedrooms ? `${property.bedrooms} beds` : null}
                {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
              </p>

              <Link href={`/property/${property.slug}`} className="underline">
                View property
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
