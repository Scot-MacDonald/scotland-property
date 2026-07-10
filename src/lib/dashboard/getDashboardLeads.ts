import type { Payload } from 'payload'

type DashboardUser = {
  role?: string | null
  agency?: string | { id?: string | null } | null
}

export type DashboardLead = {
  id: string
  name: string
  email: string
  phone: string | null
  postcode: string | null
  propertyType: string | null
  estimatedValue: number | null
  status: string
  nextFollowUpAt: string | null
  followUpCompleted: boolean
  createdAt: string
  updatedAt: string
}

function getAgencyId(user: DashboardUser) {
  if (!user.agency) return null

  if (typeof user.agency === 'object') {
    return user.agency.id || null
  }

  return user.agency
}

export async function getDashboardLeads({
  payload,
  user,
  limit = 5,
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
}): Promise<DashboardLead[]> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)
  const where =
    !isSuperAdmin && agencyId
      ? {
          assignedAgency: {
            equals: agencyId,
          },
        }
      : undefined

  const result = await payload.find({
    collection: 'valuation-leads',
    depth: 0,
    limit,
    sort: '-createdAt',
    where,
    overrideAccess: true,
  })

  return result.docs.map((lead: any) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    postcode: lead.postcode || null,
    propertyType: lead.propertyType || null,
    estimatedValue: typeof lead.estimatedValue === 'number' ? lead.estimatedValue : null,
    status: lead.status || 'new',
    nextFollowUpAt: lead.nextFollowUpAt || null,
    followUpCompleted: Boolean(lead.followUpCompleted),
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }))
}
