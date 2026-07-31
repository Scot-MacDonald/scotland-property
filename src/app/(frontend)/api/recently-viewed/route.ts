import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { ActivityTypes, createActivity } from '@/lib/activity'

const MAX_RECENTLY_VIEWED = 25

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

function getPropertyTitle(property: {
  title?: string | null
  reference?: string | null
}): string {
  return property.title?.trim() || property.reference?.trim() || 'Untitled property'
}

type RecentlyViewedEntry = {
  property?: unknown
  viewedAt?: string | null
  id?: string | null
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
      recentlyViewed: [],
      message: 'No logged-in buyer.',
    })
  }

  const buyer = await payload.findByID({
    collection: 'buyers',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    recentlyViewed: Array.isArray(buyer.recentlyViewed) ? buyer.recentlyViewed : [],
  })
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'buyers') {
      return NextResponse.json({
        ok: true,
        tracked: false,
        message: 'Anonymous property view not stored.',
      })
    }

    const body = (await req.json()) as Record<string, unknown>
    const propertyId = String(body.propertyId || '').trim()

    if (!propertyId) {
      return NextResponse.json(
        {
          ok: false,
          tracked: false,
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

    const buyer = await payload.findByID({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const viewedAt = new Date().toISOString()

    const currentRecentlyViewed = Array.isArray(buyer.recentlyViewed)
      ? (buyer.recentlyViewed as RecentlyViewedEntry[])
      : []

    const existingEntry = currentRecentlyViewed.find(
      (entry) => getRelationshipId(entry.property) === propertyId,
    )

    const nextRecentlyViewed = [
      {
        ...(existingEntry?.id ? { id: existingEntry.id } : {}),
        property: propertyId,
        viewedAt,
      },
      ...currentRecentlyViewed
        .filter((entry) => getRelationshipId(entry.property) !== propertyId)
        .map((entry) => ({
          ...(entry.id ? { id: entry.id } : {}),
          property: getRelationshipId(entry.property),
          viewedAt: entry.viewedAt || viewedAt,
        }))
        .filter(
          (
            entry,
          ): entry is {
            id?: string
            property: string
            viewedAt: string
          } => Boolean(entry.property),
        ),
    ].slice(0, MAX_RECENTLY_VIEWED)

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      data: {
        recentlyViewed: nextRecentlyViewed,
        lastActiveAt: viewedAt,
      },
      overrideAccess: true,
    })

    const buyerAgencyId = getRelationshipId(updatedBuyer.agency)

    if (buyerAgencyId) {
      const propertyTitle = getPropertyTitle(property)

      await createActivity({
        type: ActivityTypes.BUYER_PROPERTY_VIEWED,
        title: 'Property viewed',
        description: `${propertyTitle} was viewed by the buyer.`,
        severity: 'info',
        entityType: 'buyer',
        entityId: String(updatedBuyer.id),
        agency: buyerAgencyId,
        metadata: {
          propertyId: String(property.id),
          propertyTitle,
          action: 'viewed',
        },
      })
    }

    return NextResponse.json({
      ok: true,
      tracked: true,
      recentlyViewed: nextRecentlyViewed,
    })
  } catch (error: unknown) {
    console.error('Track recently viewed property error:', error)

    const message =
      error instanceof Error ? error.message : 'Could not track the recently viewed property.'

    return NextResponse.json(
      {
        ok: false,
        tracked: false,
        message,
      },
      {
        status: 500,
      },
    )
  }
}
