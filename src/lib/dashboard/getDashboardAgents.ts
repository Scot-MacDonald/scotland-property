import type { Payload } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardAgent = {
  id: string
  name: string
  jobTitle: string | null
  email: string | null
  phone: string | null
  photo: string | null
  createdAt: string
  updatedAt: string
}

export async function getDashboardAgents({
  payload,
  user,
  limit = 10,
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
}): Promise<DashboardAgent[]> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)
  const where = getAgencyWhere(agencyId, isSuperAdmin)

  const result = await payload.find({
    collection: 'agents',
    depth: 1,
    limit,
    sort: 'name',
    where,
    overrideAccess: true,
  })

  return result.docs.map((agent: any) => {
    const photo = typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null

    return {
      id: agent.id,
      name: agent.name,
      jobTitle: agent.jobTitle || null,
      email: agent.email || null,
      phone: agent.phone || null,
      photo,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }
  })
}
