import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  SavedPropertiesEmptyState,
  SavedPropertiesGrid,
  type SavedProperty,
} from '@/components/BuyerWorkspace/SavedProperties'

function getRelationshipId(value: unknown): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

export default async function SavedPropertiesPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const buyer = await payload.findByID({
    collection: 'buyers',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  const propertyIds = Array.isArray(buyer.savedProperties)
    ? buyer.savedProperties
        .map((property) => getRelationshipId(property))
        .filter((id): id is string => Boolean(id))
    : []

  let properties: SavedProperty[] = []

  if (propertyIds.length > 0) {
    const result = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: propertyIds.length,
      overrideAccess: true,
      pagination: false,
      where: {
        or: propertyIds.map((id) => ({
          id: {
            equals: id,
          },
        })),
      },
    })

    const propertiesById = new Map(
      result.docs.map((property) => [String(property.id), property as unknown as SavedProperty]),
    )

    properties = propertyIds
      .map((id) => propertiesById.get(id))
      .filter((property): property is SavedProperty => Boolean(property))
  }

  return (
    <div className="space-y-10">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Private Collection</p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Saved properties</h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              Review the homes in your shortlist, revisit their details and refine your private
              property collection.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
      </header>

      {properties.length > 0 ? (
        <SavedPropertiesGrid properties={properties} />
      ) : (
        <SavedPropertiesEmptyState />
      )}
    </div>
  )
}
