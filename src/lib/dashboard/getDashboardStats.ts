import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'
import { getAssignedAgencyWhere } from './getAssignedAgencyWhere'

export type DashboardStats = {
  totalProperties: number
  activeListings: number
  soldProperties: number
  totalAgents: number
  totalLeads: number
  newLeads: number
  newEnquiries: number
  portfolioValue: number
}

export async function getDashboardStats({
  payload,
  user,
}: {
  payload: Payload
  user: DashboardUser
}): Promise<DashboardStats> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  const propertyAgencyFilter = getAgencyWhere(agencyId, isSuperAdmin)
  const leadAgencyFilter = getAssignedAgencyWhere(agencyId, isSuperAdmin)

  const activeListingsWhere: Where = {
    and: [
      ...(propertyAgencyFilter ? [propertyAgencyFilter] : []),
      {
        status: {
          equals: 'for-sale',
        },
      },
    ],
  }

  const soldPropertiesWhere: Where = {
    and: [
      ...(propertyAgencyFilter ? [propertyAgencyFilter] : []),
      {
        status: {
          equals: 'sold',
        },
      },
    ],
  }

  const newLeadsWhere: Where = {
    and: [
      ...(leadAgencyFilter ? [leadAgencyFilter] : []),
      {
        status: {
          equals: 'new',
        },
      },
    ],
  }

  const newEnquiriesWhere: Where = {
    and: [
      ...(propertyAgencyFilter ? [propertyAgencyFilter] : []),
      {
        status: {
          equals: 'new',
        },
      },
    ],
  }

  const [properties, activeListings, soldProperties, agents, totalLeads, newLeads, newEnquiries] =
    await Promise.all([
      payload.find({
        collection: 'properties',
        depth: 0,
        limit: 1000,
        pagination: false,
        where: propertyAgencyFilter,
        overrideAccess: true,
        select: {
          price: true,
        },
      }),

      payload.count({
        collection: 'properties',
        where: activeListingsWhere,
        overrideAccess: true,
      }),

      payload.count({
        collection: 'properties',
        where: soldPropertiesWhere,
        overrideAccess: true,
      }),

      payload.count({
        collection: 'agents',
        where: propertyAgencyFilter,
        overrideAccess: true,
      }),

      payload.count({
        collection: 'valuation-leads',
        where: leadAgencyFilter,
        overrideAccess: true,
      }),

      payload.count({
        collection: 'valuation-leads',
        where: newLeadsWhere,
        overrideAccess: true,
      }),

      payload.count({
        collection: 'enquiries',
        where: newEnquiriesWhere,
        overrideAccess: true,
      }),
    ])

  const portfolioValue = properties.docs.reduce((total, property) => {
    const price = typeof property.price === 'number' ? property.price : 0

    return total + price
  }, 0)

  return {
    totalProperties: properties.totalDocs,
    activeListings: activeListings.totalDocs,
    soldProperties: soldProperties.totalDocs,
    totalAgents: agents.totalDocs,
    totalLeads: totalLeads.totalDocs,
    newLeads: newLeads.totalDocs,
    newEnquiries: newEnquiries.totalDocs,
    portfolioValue,
  }
}
