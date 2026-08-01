import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { ActivityTypes, createActivity } from '@/lib/activity'

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

function getPropertyTitle(property: { title?: string | null; reference?: string | null }): string {
  return property.title?.trim() || property.reference?.trim() || 'Untitled property'
}

export async function GET() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json({
      ok: false,
      savedProperties: [],
      message: 'No logged-in buyer.',
    })
  }

  return NextResponse.json({
    ok: true,
    savedProperties: Array.isArray(user.savedProperties) ? user.savedProperties : [],
  })
}

export async function PATCH(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'buyers') {
      return NextResponse.json(
        {
          ok: false,
          message: 'You must be logged in as a buyer.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await req.json()) as Record<string, unknown>
    const propertyId = String(body.propertyId || '').trim()

    if (!propertyId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Missing propertyId.',
        },
        {
          status: 400,
        },
      )
    }

    const property = await payload.findByID({
      collection: 'properties',
      id: propertyId,
      depth: 0,
      overrideAccess: true,
    })

    const currentSavedProperties = Array.isArray(user.savedProperties)
      ? user.savedProperties
          .map((savedProperty) => getRelationshipId(savedProperty))
          .filter((id): id is string => Boolean(id))
      : []

    const isSaved = currentSavedProperties.includes(propertyId)

    const nextSavedProperties = isSaved
      ? currentSavedProperties.filter((id) => id !== propertyId)
      : [...currentSavedProperties, propertyId]

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      data: {
        savedProperties: nextSavedProperties,
      },
      overrideAccess: true,
    })

    const buyerAgencyId = getRelationshipId(updatedBuyer.agency)
    const propertyTitle = getPropertyTitle(property)
    const saved = !isSaved

    await createActivity({
      type: saved ? ActivityTypes.BUYER_PROPERTY_SAVED : ActivityTypes.BUYER_PROPERTY_REMOVED,

      title: saved ? 'Property saved' : 'Saved property removed',

      description: saved
        ? `${propertyTitle} was added to the buyer's saved properties.`
        : `${propertyTitle} was removed from the buyer's saved properties.`,

      severity: saved ? 'success' : 'info',

      entityType: 'buyer',
      entityId: String(updatedBuyer.id),

      buyer: String(updatedBuyer.id),
      agency: buyerAgencyId || undefined,

      metadata: {
        propertyId: String(property.id),
        propertyTitle,
        action: saved ? 'saved' : 'removed',
      },
    })

    return NextResponse.json({
      ok: true,
      saved,
      savedProperties: nextSavedProperties,
    })
  } catch (error: unknown) {
    console.error('Update saved property error:', error)

    const message = error instanceof Error ? error.message : 'Could not update saved properties.'

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      {
        status: 500,
      },
    )
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const body = (await req.json()) as Record<string, unknown>
    const ids = Array.isArray(body.ids)
      ? body.ids.map((id) => String(id || '').trim()).filter(Boolean)
      : []

    if (ids.length === 0) {
      return NextResponse.json({
        docs: [],
      })
    }

    const properties = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: 100,
      overrideAccess: true,
      where: {
        or: ids.map((id) => ({
          id: {
            equals: id,
          },
        })),
      },
    })

    return NextResponse.json(properties)
  } catch (error: unknown) {
    console.error('Load saved properties error:', error)

    const message = error instanceof Error ? error.message : 'Could not load saved properties.'

    return NextResponse.json(
      {
        docs: [],
        message,
      },
      {
        status: 500,
      },
    )
  }
}
