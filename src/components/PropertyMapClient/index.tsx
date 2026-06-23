'use client'

import dynamic from 'next/dynamic'

const PropertyMap = dynamic(
  () => import('@/components/PropertyMap').then((mod) => mod.PropertyMap),
  {
    ssr: false,
  },
)

export function PropertyMapClient({ properties }: { properties: any[] }) {
  return <PropertyMap properties={properties} />
}
