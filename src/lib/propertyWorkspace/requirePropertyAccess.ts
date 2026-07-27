import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { headers } from 'next/headers'

import type { Property, User } from '@/payload-types'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') return value

  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id: unknown }).id === 'string'
  ) {
    return (value as { id: string }).id
  }

  return null
}

export type PropertyWorkspaceContext = {
  payload: Payload
  property: Property
  user: User
}

type RequirePropertyAccessOptions = {
  payload?: Payload
  user?: User
}

export async function requirePropertyAccess(
  propertyId: string,
  options: RequirePropertyAccessOptions = {},
): Promise<PropertyWorkspaceContext> {
  const payload =
    options.payload ??
    (await getPayload({
      config: configPromise,
    }))

  let user = options.user

  if (!user) {
    const authResult = await payload.auth({
      headers: await headers(),
    })

    if (!authResult.user || authResult.user.collection !== 'users') {
      throw new Error('Not authorised.')
    }

    user = authResult.user
  }

  const property = await payload.findByID({
    collection: 'properties',
    id: propertyId,
    depth: 0,
    overrideAccess: true,
  })

  const isSuperAdmin = user.role === 'super-admin'

  const userAgencyId = getRelationshipId(user.agency)
  const propertyAgencyId = getRelationshipId(property.agency)

  if (!isSuperAdmin && userAgencyId !== propertyAgencyId) {
    throw new Error('Not authorised.')
  }

  return {
    payload,
    property,
    user,
  }
}
