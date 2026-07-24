import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardOffer = {
  id: string
  reference: string
  amount: number
  currency: string
  status: string
  confidence: string
  submittedAt: string | null
  expiresAt: string | null
  propertyId: string | null
  propertyTitle: string
  buyerId: string | null
  buyerName: string
  agentId: string | null
  agentName: string
  updatedAt: string
}

export type DashboardOffersResult = {
  docs: DashboardOffer[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function getRelationshipId(
  relationship:
    | string
    | number
    | {
        id?: string | number | null
      }
    | null
    | undefined,
) {
  if (!relationship) return null

  if (typeof relationship === 'object') {
    return relationship.id ? String(relationship.id) : null
  }

  return String(relationship)
}

function getRelationshipLabel(
  relationship:
    | string
    | number
    | {
        title?: string | null
        name?: string | null
        email?: string | null
      }
    | null
    | undefined,
  fallback: string,
) {
  if (!relationship || typeof relationship !== 'object') {
    return fallback
  }

  return relationship.title || relationship.name || relationship.email || fallback
}

export async function getDashboardOffers({
  payload,
  user,
  limit = 12,
  page = 1,
  query = '',
  status = '',
  confidence = '',
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
  page?: number
  query?: string
  status?: string
  confidence?: string
}): Promise<DashboardOffersResult> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)
  const agencyFilter = getAgencyWhere(agencyId, isSuperAdmin)

  const conditions: Where[] = []

  if (agencyFilter) {
    conditions.push(agencyFilter)
  }

  if (query) {
    conditions.push({
      or: [
        {
          reference: {
            like: query,
          },
        },
        {
          'property.title': {
            like: query,
          },
        },
        {
          'buyer.name': {
            like: query,
          },
        },
        {
          'buyer.email': {
            like: query,
          },
        },
      ],
    })
  }

  if (status) {
    conditions.push({
      status: {
        equals: status,
      },
    })
  }

  if (confidence) {
    conditions.push({
      confidence: {
        equals: confidence,
      },
    })
  }

  const where: Where | undefined =
    conditions.length > 0
      ? {
          and: conditions,
        }
      : undefined

  const result = await payload.find({
    collection: 'offers',
    depth: 1,
    limit,
    page,
    sort: '-updatedAt',
    where,
    overrideAccess: true,
  })

  const docs = result.docs.map((offer: any): DashboardOffer => {
    return {
      id: String(offer.id),
      reference: offer.reference || 'Offer',
      amount: typeof offer.amount === 'number' ? offer.amount : 0,
      currency: offer.currency || 'GBP',
      status: offer.status || 'draft',
      confidence: offer.confidence || 'medium',
      submittedAt: offer.submittedAt || null,
      expiresAt: offer.expiresAt || null,
      propertyId: getRelationshipId(offer.property),
      propertyTitle: getRelationshipLabel(offer.property, 'Unknown property'),
      buyerId: getRelationshipId(offer.buyer),
      buyerName: getRelationshipLabel(offer.buyer, 'Unknown buyer'),
      agentId: getRelationshipId(offer.agent),
      agentName: getRelationshipLabel(offer.agent, 'Unassigned'),
      updatedAt: offer.updatedAt,
    }
  })

  return {
    docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  }
}
