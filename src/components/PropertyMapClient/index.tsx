'use client'

import dynamic from 'next/dynamic'

export type MapProperty = {
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

const PropertyMap = dynamic(
  () => import('@/components/PropertyMap').then((mod) => mod.PropertyMap),
  {
    ssr: false,
  },
)

type Props = {
  properties: MapProperty[]
  showListControl?: boolean
}

export function PropertyMapClient({ properties, showListControl = false }: Props) {
  return <PropertyMap properties={properties} showListControl={showListControl} />
}
