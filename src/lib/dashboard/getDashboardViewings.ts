import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardViewing = {
  id: string
  dateTime: string
  durationMinutes: number
  status: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  propertyId: string | null
  propertyTitle: string
  agentId: string | null
  agentName: string
  buyerId: string | null
  enquiryId: string | null
  updatedAt: string
}

export type DashboardViewingsResult = {
  docs: DashboardViewing[]
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

export async function getDashboardViewings({
  payload,
  user,
  limit = 12,
  page = 1,
  query = '',
  status = '',
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
  page?: number
  query?: string
  status?: string
}): Promise<DashboardViewingsResult> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)
  const agencyFilter = getAgencyWhere(agencyId, isSuperAdmin)

  const conditions: Where[] = []

  if (agencyFilter) {
    conditions.push(agencyFilter)
  }

  if (status) {
    conditions.push({
      status: {
        equals: status,
      },
    })
  }

  if (query) {
    conditions.push({
      or: [
        {
          contactName: {
            like: query,
          },
        },
        {
          contactEmail: {
            like: query,
          },
        },
        {
          contactPhone: {
            like: query,
          },
        },
      ],
    })
  }

  const where: Where | undefined =
    conditions.length > 0
      ? {
          and: conditions,
        }
      : undefined

  const result = await payload.find({
    collection: 'viewings',
    depth: 1,
    limit,
    page,
    sort: 'dateTime',
    where,
    overrideAccess: true,
  })

  const docs = result.docs.map((viewing: any): DashboardViewing => {
    return {
      id: String(viewing.id),
      dateTime: viewing.dateTime,
      durationMinutes: typeof viewing.durationMinutes === 'number' ? viewing.durationMinutes : 60,
      status: viewing.status || 'requested',
      contactName: viewing.contactName || 'Unknown contact',
      contactEmail: viewing.contactEmail || '',
      contactPhone: viewing.contactPhone || null,
      propertyId: getRelationshipId(viewing.property),
      propertyTitle: getRelationshipLabel(viewing.property, 'Unknown property'),
      agentId: getRelationshipId(viewing.agent),
      agentName: getRelationshipLabel(viewing.agent, 'Unassigned'),
      buyerId: getRelationshipId(viewing.buyer),
      enquiryId: getRelationshipId(viewing.enquiry),
      updatedAt: viewing.updatedAt,
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
