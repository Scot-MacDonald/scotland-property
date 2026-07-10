import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardProperty = {
  id: string
  title: string
  slug: string
  price: number | null
  status: string | null
  reference: string | null
  bedrooms: number | null
  bathrooms: number | null
  featured: boolean
  updatedAt: string
  image: string | null
  town: string | null
  region: string | null
}

export type DashboardPropertiesResult = {
  docs: DashboardProperty[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function getDashboardProperties({
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
}): Promise<DashboardPropertiesResult> {
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
          title: {
            like: query,
          },
        },
        {
          reference: {
            like: query,
          },
        },
        {
          slug: {
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
    collection: 'properties',
    depth: 1,
    limit,
    page,
    sort: '-updatedAt',
    where,
    overrideAccess: true,
  })

  const docs = result.docs.map((property: any): DashboardProperty => {
    const image =
      typeof property.featuredImage === 'object' && property.featuredImage?.url
        ? property.featuredImage.url
        : null

    const town =
      typeof property.town === 'object' && property.town?.name ? property.town.name : null

    const region =
      typeof property.region === 'object' && property.region?.name ? property.region.name : null

    return {
      id: property.id,
      title: property.title,
      slug: property.slug,
      price: typeof property.price === 'number' ? property.price : null,
      status: property.status || null,
      reference: property.reference || null,
      bedrooms: typeof property.bedrooms === 'number' ? property.bedrooms : null,
      bathrooms: typeof property.bathrooms === 'number' ? property.bathrooms : null,
      featured: Boolean(property.featured),
      updatedAt: property.updatedAt,
      image,
      town,
      region,
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
