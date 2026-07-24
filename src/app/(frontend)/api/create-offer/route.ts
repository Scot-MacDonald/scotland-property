import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type OfferStatus = 'draft' | 'submitted' | 'negotiating' | 'accepted' | 'rejected' | 'withdrawn'

type OfferConfidence = 'low' | 'medium' | 'high'

type CreateOfferBody = {
  property?: string
  buyer?: string
  agent?: string | null
  amount?: number
  status?: OfferStatus
  confidence?: OfferConfidence
  submittedAt?: string | null
  expiresAt?: string | null
  conditions?: string | null
  internalNotes?: string | null
}

function getRelationshipId(
  value:
    | string
    | number
    | {
        id?: string | number | null
      }
    | null
    | undefined,
) {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return value.id ? String(value.id) : null
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined

  const cleaned = value.trim()

  return cleaned || undefined
}

function parseOptionalDate(value: unknown) {
  const cleaned = cleanOptionalString(value)

  if (!cleaned) {
    return undefined
  }

  const date = new Date(cleaned)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function createOfferReference() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `OFF-${timestamp}-${randomPart}`
}

const validStatuses: OfferStatus[] = [
  'draft',
  'submitted',
  'negotiating',
  'accepted',
  'rejected',
  'withdrawn',
]

const validConfidenceLevels: OfferConfidence[] = ['low', 'medium', 'high']

export async function POST(request: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const requestHeaders = await headers()

    const { user } = await payload.auth({
      headers: requestHeaders,
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json(
        {
          error: 'You must be logged in to create an offer.',
        },
        {
          status: 401,
        },
      )
    }

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)

    if (!isSuperAdmin && !agencyId) {
      return NextResponse.json(
        {
          error: 'Your account is not linked to an agency.',
        },
        {
          status: 403,
        },
      )
    }

    const body = (await request.json()) as CreateOfferBody

    const propertyId = cleanOptionalString(body.property)
    const buyerId = cleanOptionalString(body.buyer)
    const agentId = cleanOptionalString(body.agent)

    if (!propertyId) {
      return NextResponse.json(
        {
          error: 'A property is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!buyerId) {
      return NextResponse.json(
        {
          error: 'A buyer is required.',
        },
        {
          status: 400,
        },
      )
    }

    const amount = Number(body.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: 'A valid offer amount is required.',
        },
        {
          status: 400,
        },
      )
    }

    const status = body.status && validStatuses.includes(body.status) ? body.status : 'draft'

    const confidence =
      body.confidence && validConfidenceLevels.includes(body.confidence)
        ? body.confidence
        : 'medium'

    const submittedAt = parseOptionalDate(body.submittedAt)
    const expiresAt = parseOptionalDate(body.expiresAt)

    if (submittedAt === null) {
      return NextResponse.json(
        {
          error: 'The submitted date is invalid.',
        },
        {
          status: 400,
        },
      )
    }

    if (expiresAt === null) {
      return NextResponse.json(
        {
          error: 'The expiry date is invalid.',
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

    const propertyAgencyId = getRelationshipId(property.agency)

    if (!isSuperAdmin && propertyAgencyId !== agencyId) {
      return NextResponse.json(
        {
          error: 'You cannot create an offer for this property.',
        },
        {
          status: 403,
        },
      )
    }

    const buyer = await payload.findByID({
      collection: 'buyers',
      id: buyerId,
      depth: 0,
      overrideAccess: true,
    })

    const buyerAgencyId = getRelationshipId(buyer.agency)

    if (!isSuperAdmin && buyerAgencyId && buyerAgencyId !== agencyId) {
      return NextResponse.json(
        {
          error: 'The selected buyer does not belong to your agency.',
        },
        {
          status: 403,
        },
      )
    }

    if (agentId) {
      const agent = await payload.findByID({
        collection: 'agents',
        id: agentId,
        depth: 0,
        overrideAccess: true,
      })

      const agentAgencyId = getRelationshipId(agent.agency)

      if (!isSuperAdmin && agentAgencyId !== agencyId) {
        return NextResponse.json(
          {
            error: 'The selected agent does not belong to your agency.',
          },
          {
            status: 403,
          },
        )
      }
    }

    const offerAgencyId = agencyId || propertyAgencyId

    if (!offerAgencyId) {
      return NextResponse.json(
        {
          error: 'The offer could not be linked to an agency.',
        },
        {
          status: 400,
        },
      )
    }

    const currency = 'GBP'

    const offer = await payload.create({
      collection: 'offers',
      overrideAccess: true,
      data: {
        reference: createOfferReference(),
        property: propertyId,
        buyer: buyerId,
        agency: offerAgencyId,
        agent: agentId,
        amount,
        currency,
        status,
        confidence,
        submittedAt,
        expiresAt,
        conditions: cleanOptionalString(body.conditions),
        internalNotes: cleanOptionalString(body.internalNotes),
      },
    })

    return NextResponse.json({
      ok: true,
      id: offer.id,
    })
  } catch (error) {
    console.error('Create offer error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'The offer could not be created.',
      },
      {
        status: 500,
      },
    )
  }
}
