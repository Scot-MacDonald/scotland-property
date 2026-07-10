import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardEnquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  status: string
  createdAt: string
  updatedAt: string
  property: {
    id: string
    title: string
    slug: string | null
  } | null
}

export type DashboardEnquiriesResult = {
  docs: DashboardEnquiry[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function getDashboardEnquiries({
  payload,
  user,
  limit = 20,
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
}): Promise<DashboardEnquiriesResult> {
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
          name: {
            like: query,
          },
        },
        {
          email: {
            like: query,
          },
        },
        {
          phone: {
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
    collection: 'enquiries',
    depth: 1,
    limit,
    page,
    sort: '-createdAt',
    where,
    overrideAccess: true,
  })

  const docs = result.docs.map((enquiry: any): DashboardEnquiry => {
    const property =
      typeof enquiry.property === 'object' && enquiry.property
        ? {
            id: enquiry.property.id,
            title: enquiry.property.title,
            slug: enquiry.property.slug || null,
          }
        : null

    return {
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone || null,
      message: enquiry.message || null,
      status: enquiry.status || 'new',
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
      property,
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
