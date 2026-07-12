import type { Payload } from 'payload'

import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

type DashboardUser = {
  role?: string | null
  agency?: string | { id?: string | null } | null
}

export type DashboardTeamUser = {
  id: string
  name: string
  email: string
  role: 'agency-admin' | 'agency-staff'
  createdAt: string
  updatedAt: string
}

export async function getDashboardUsers({
  payload,
  user,
}: {
  payload: Payload
  user: DashboardUser
}): Promise<DashboardTeamUser[]> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  const where = getAgencyWhere(agencyId, isSuperAdmin)

  const result = await payload.find({
    collection: 'users',
    depth: 0,
    pagination: false,
    sort: 'name',
    where,
    overrideAccess: true,
  })

  return result.docs.map((user: any) => ({
    id: user.id,
    name: user.name || 'Unnamed User',
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }))
}
