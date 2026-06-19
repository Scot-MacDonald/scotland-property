import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()
  const payload = await getPayload({ config: configPromise })

  const [towns, regions, propertyTypes] = await Promise.all([
    payload.find({ collection: 'towns', limit: 100 }),
    payload.find({ collection: 'regions', limit: 100 }),
    payload.find({ collection: 'property-types', limit: 100 }),
  ])

  const suggestions = [
    ...towns.docs.map((town) => ({
      label: town.name,
      href: `/properties?town=${town.id}`,
      type: 'Town' as const,
    })),
    ...regions.docs.map((region) => ({
      label: region.name,
      href: `/properties?region=${region.id}`,
      type: 'Region' as const,
    })),
    ...propertyTypes.docs.map((type) => ({
      label: type.name,
      href: `/properties?type=${type.id}`,
      type: 'Property Type' as const,
    })),
  ]

  return <HeaderClient data={headerData} suggestions={suggestions} />
}
