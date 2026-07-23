import type { Payload } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'
import { getAssignedAgencyWhere } from './getAssignedAgencyWhere'

export type DashboardActivityType = 'property' | 'lead' | 'enquiry' | 'agent'

export type DashboardActivityItem = {
  id: string
  type: DashboardActivityType
  title: string
  description: string
  href: string
  date: string
}

export async function getDashboardActivity({
  payload,
  user,
  limit = 8,
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
}): Promise<DashboardActivityItem[]> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  const agencyFilter = getAgencyWhere(agencyId, isSuperAdmin)
  const leadFilter = getAssignedAgencyWhere(agencyId, isSuperAdmin)

  const [properties, leads, enquiries, agents] = await Promise.all([
    payload.find({
      collection: 'properties',
      depth: 0,
      limit,
      sort: '-updatedAt',
      where: agencyFilter,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'valuation-leads',
      depth: 0,
      limit,
      sort: '-createdAt',
      where: leadFilter,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'enquiries',
      depth: 1,
      limit,
      sort: '-createdAt',
      where: agencyFilter,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'agents',
      depth: 0,
      limit,
      sort: '-updatedAt',
      where: agencyFilter,
      overrideAccess: true,
    }),
  ])

  const propertyActivity: DashboardActivityItem[] = properties.docs.map((property: any) => ({
    id: `property-${property.id}`,
    type: 'property',
    title: 'Property updated',
    description: property.title,
    href: `/dashboard/properties/${property.id}/edit`,
    date: property.updatedAt,
  }))

  const leadActivity: DashboardActivityItem[] = leads.docs.map((lead: any) => ({
    id: `lead-${lead.id}`,
    type: 'lead',
    title: 'Valuation lead received',
    description: lead.postcode ? `${lead.name} • ${lead.postcode}` : lead.name,
    href: `/dashboard/leads/${lead.id}`,
    date: lead.createdAt,
  }))

  const enquiryActivity: DashboardActivityItem[] = enquiries.docs.map((enquiry: any) => {
    const propertyTitle =
      typeof enquiry.property === 'object' && enquiry.property?.title
        ? enquiry.property.title
        : null

    return {
      id: `enquiry-${enquiry.id}`,
      type: 'enquiry',
      title: 'Buyer enquiry received',
      description: propertyTitle ? `${enquiry.name} • ${propertyTitle}` : enquiry.name,
      href: `/dashboard/enquiries/${enquiry.id}`,
      date: enquiry.createdAt,
    }
  })

  const agentActivity: DashboardActivityItem[] = agents.docs.map((agent: any) => ({
    id: `agent-${agent.id}`,
    type: 'agent',
    title: 'Agent profile updated',
    description: agent.name,
    href: '/dashboard/agents',
    date: agent.updatedAt,
  }))

  return [...propertyActivity, ...leadActivity, ...enquiryActivity, ...agentActivity]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
