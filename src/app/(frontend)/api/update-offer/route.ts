import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { getRelationshipId } from '@/lib/dashboard/workspaceHelpers'

const allowedStatuses = [
  'draft',
  'submitted',
  'negotiating',
  'accepted',
  'rejected',
  'withdrawn',
] as const

const allowedConfidenceLevels = ['low', 'medium', 'high'] as const

type OfferStatus = (typeof allowedStatuses)[number]
type OfferConfidence = (typeof allowedConfidenceLevels)[number]

type OfferUpdateData = {
  property?: string
  buyer?: string
  agent?: string | null
  viewing?: string | null
  enquiry?: string | null
  amount?: number
  status?: OfferStatus
  confidence?: OfferConfidence
  submittedAt?: string | null
  expiresAt?: string | null
  conditions?: string | null
  vendorResponse?: string | null
  buyerResponse?: string | null
  internalNotes?: string | null
}

function isOfferStatus(value: unknown): value is OfferStatus {
  return typeof value === 'string' && allowedStatuses.includes(value as OfferStatus)
}

function isOfferConfidence(value: unknown): value is OfferConfidence {
  return typeof value === 'string' && allowedConfidenceLevels.includes(value as OfferConfidence)
}

function optionalString(value: unknown): string | null | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmedValue = value.trim()

  return trimmedValue || null
}

function relationshipValue(value: unknown): string | null | undefined {
  if (value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmedValue = value.trim()

  return trimmedValue || null
}

function optionalDate(value: unknown): string | null | undefined {
  if (value === null || value === '') {
    return null
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

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
          error: 'You must be logged in.',
        },
        {
          status: 401,
        },
      )
    }

    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          error: 'Invalid request body.',
        },
        {
          status: 400,
        },
      )
    }

    const requestData = body as Record<string, unknown>

    const id = typeof requestData.id === 'string' ? requestData.id.trim() : ''

    if (!id) {
      return NextResponse.json(
        {
          error: 'Offer ID is required.',
        },
        {
          status: 400,
        },
      )
    }

    let offer

    try {
      offer = await payload.findByID({
        collection: 'offers',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return NextResponse.json(
        {
          error: 'Offer not found.',
        },
        {
          status: 404,
        },
      )
    }

    const userAgencyId = getRelationshipId(user.agency)
    const offerAgencyId = getRelationshipId(offer.agency)
    const isSuperAdmin = user.role === 'super-admin'

    if (!isSuperAdmin && (!userAgencyId || offerAgencyId !== userAgencyId)) {
      return NextResponse.json(
        {
          error: 'You do not have permission to update this offer.',
        },
        {
          status: 403,
        },
      )
    }

    const updateData: OfferUpdateData = {}

    if ('amount' in requestData) {
      const amount = Number(requestData.amount)

      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json(
          {
            error: 'Offer amount must be a valid positive number.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.amount = amount
    }

    if ('status' in requestData) {
      if (!isOfferStatus(requestData.status)) {
        return NextResponse.json(
          {
            error: 'Offer status is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.status = requestData.status

      if (
        requestData.status === 'submitted' &&
        !offer.submittedAt &&
        !('submittedAt' in requestData)
      ) {
        updateData.submittedAt = new Date().toISOString()
      }
    }

    if ('confidence' in requestData) {
      if (!isOfferConfidence(requestData.confidence)) {
        return NextResponse.json(
          {
            error: 'Offer confidence is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.confidence = requestData.confidence
    }

    if ('submittedAt' in requestData) {
      const submittedAt = optionalDate(requestData.submittedAt)

      if (submittedAt === undefined) {
        return NextResponse.json(
          {
            error: 'Submitted date is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.submittedAt = submittedAt
    }

    if ('expiresAt' in requestData) {
      const expiresAt = optionalDate(requestData.expiresAt)

      if (expiresAt === undefined) {
        return NextResponse.json(
          {
            error: 'Expiry date is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.expiresAt = expiresAt
    }

    if ('conditions' in requestData) {
      updateData.conditions = optionalString(requestData.conditions)
    }

    if ('vendorResponse' in requestData) {
      updateData.vendorResponse = optionalString(requestData.vendorResponse)
    }

    if ('buyerResponse' in requestData) {
      updateData.buyerResponse = optionalString(requestData.buyerResponse)
    }

    if ('internalNotes' in requestData) {
      updateData.internalNotes = optionalString(requestData.internalNotes)
    }

    if ('property' in requestData) {
      const propertyId = relationshipValue(requestData.property)

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

      let property

      try {
        property = await payload.findByID({
          collection: 'properties',
          id: propertyId,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        return NextResponse.json(
          {
            error: 'The selected property could not be found.',
          },
          {
            status: 400,
          },
        )
      }

      const propertyAgencyId = getRelationshipId(property.agency)

      if (!isSuperAdmin && propertyAgencyId !== userAgencyId) {
        return NextResponse.json(
          {
            error: 'The selected property does not belong to your agency.',
          },
          {
            status: 403,
          },
        )
      }

      updateData.property = propertyId
    }

    if ('buyer' in requestData) {
      const buyerId = relationshipValue(requestData.buyer)

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

      let buyer

      try {
        buyer = await payload.findByID({
          collection: 'buyers',
          id: buyerId,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        return NextResponse.json(
          {
            error: 'The selected buyer could not be found.',
          },
          {
            status: 400,
          },
        )
      }

      const buyerAgencyId = getRelationshipId(buyer.agency)

      if (!isSuperAdmin && buyerAgencyId && buyerAgencyId !== userAgencyId) {
        return NextResponse.json(
          {
            error: 'The selected buyer does not belong to your agency.',
          },
          {
            status: 403,
          },
        )
      }

      updateData.buyer = buyerId
    }

    if ('agent' in requestData) {
      const agentId = relationshipValue(requestData.agent)

      if (!agentId) {
        updateData.agent = null
      } else {
        let agent

        try {
          agent = await payload.findByID({
            collection: 'agents',
            id: agentId,
            depth: 0,
            overrideAccess: true,
          })
        } catch {
          return NextResponse.json(
            {
              error: 'The selected agent could not be found.',
            },
            {
              status: 400,
            },
          )
        }

        const agentAgencyId = getRelationshipId(agent.agency)

        if (!isSuperAdmin && agentAgencyId !== userAgencyId) {
          return NextResponse.json(
            {
              error: 'The selected agent does not belong to your agency.',
            },
            {
              status: 403,
            },
          )
        }

        updateData.agent = agentId
      }
    }

    if ('viewing' in requestData) {
      const viewingId = relationshipValue(requestData.viewing)

      if (!viewingId) {
        updateData.viewing = null
      } else {
        let viewing

        try {
          viewing = await payload.findByID({
            collection: 'viewings',
            id: viewingId,
            depth: 0,
            overrideAccess: true,
          })
        } catch {
          return NextResponse.json(
            {
              error: 'The selected viewing could not be found.',
            },
            {
              status: 400,
            },
          )
        }

        const viewingAgencyId = getRelationshipId(viewing.agency)

        if (!isSuperAdmin && viewingAgencyId !== userAgencyId) {
          return NextResponse.json(
            {
              error: 'The selected viewing does not belong to your agency.',
            },
            {
              status: 403,
            },
          )
        }

        updateData.viewing = viewingId
      }
    }

    if ('enquiry' in requestData) {
      const enquiryId = relationshipValue(requestData.enquiry)

      if (!enquiryId) {
        updateData.enquiry = null
      } else {
        let enquiry

        try {
          enquiry = await payload.findByID({
            collection: 'enquiries',
            id: enquiryId,
            depth: 0,
            overrideAccess: true,
          })
        } catch {
          return NextResponse.json(
            {
              error: 'The selected enquiry could not be found.',
            },
            {
              status: 400,
            },
          )
        }

        const enquiryAgencyId = getRelationshipId(enquiry.agency)

        if (!isSuperAdmin && enquiryAgencyId !== userAgencyId) {
          return NextResponse.json(
            {
              error: 'The selected enquiry does not belong to your agency.',
            },
            {
              status: 403,
            },
          )
        }

        updateData.enquiry = enquiryId
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No offer changes were provided.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedOffer = await payload.update({
      collection: 'offers',
      id,
      /*
       * Payload supports null when optional relationships or fields
       * are cleared, although generated update types can be stricter.
       */
      data: updateData as any,
      overrideAccess: true,
      req: {
        user,
      } as any,
    })

    return NextResponse.json({
      ok: true,
      offer: updatedOffer,
    })
  } catch (error) {
    console.error('Could not update offer:', error)

    return NextResponse.json(
      {
        error: 'Could not update the offer.',
      },
      {
        status: 500,
      },
    )
  }
}
