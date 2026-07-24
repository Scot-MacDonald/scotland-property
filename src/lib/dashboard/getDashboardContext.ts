import type { Payload, Where } from 'payload'

import { getDashboardStats } from './getDashboardStats'
import { getAgencyWhere } from './getAgencyWhere'

type DashboardUser = {
  id: string
  role?: string | null
  agency?: string | { id?: string | null; name?: string | null } | null
}

export type DashboardContext = {
  user: DashboardUser

  agency: {
    id: string
    name: string
    slug?: string | null
    subscriptionStatus?: string | null
    subscriptionPlan?: string | null
  } | null

  stats: Awaited<ReturnType<typeof getDashboardStats>>

  navigationCounts: {
    properties: number
    agents: number
    leads: number
    enquiries: number
    viewings: number
    tasks: number
  }

  permissions: {
    isSuperAdmin: boolean
    isAgencyOwner: boolean
    isAgencyStaff: boolean
  }
}

function getAgencyId(user: DashboardUser) {
  if (!user.agency) return null

  if (typeof user.agency === 'object') {
    return user.agency.id || null
  }

  return user.agency
}

export async function getDashboardContext({
  payload,
  user,
}: {
  payload: Payload
  user: DashboardUser
}): Promise<DashboardContext> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  const stats = await getDashboardStats({
    payload,
    user,
  })

  let agency: DashboardContext['agency'] = null

  if (agencyId) {
    const result = await payload.find({
      collection: 'agencies',
      depth: 0,
      limit: 1,
      where: {
        id: {
          equals: agencyId,
        },
      },
      overrideAccess: true,
      select: {
        name: true,
        slug: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      },
    })

    const doc = result.docs[0]

    if (doc) {
      agency = {
        id: doc.id,
        name: doc.name,
        slug: doc.slug,
        subscriptionStatus: doc.subscriptionStatus ?? null,
        subscriptionPlan: doc.subscriptionPlan ?? null,
      }
    }
  }

  const agencyWhere = getAgencyWhere(agencyId, isSuperAdmin)

  const viewingsWhere: Where | undefined = agencyWhere || undefined

  const tasksWhere: Where = {
    and: [
      ...(agencyWhere ? [agencyWhere] : []),
      {
        status: {
          in: ['todo', 'in-progress', 'waiting'],
        },
      },
    ],
  }

  const [viewingsResult, tasksResult] = await Promise.all([
    payload.count({
      collection: 'viewings',
      where: viewingsWhere,
      overrideAccess: true,
    }),

    payload.count({
      collection: 'tasks',
      where: tasksWhere,
      overrideAccess: true,
    }),
  ])

  return {
    user,

    agency,

    stats,

    navigationCounts: {
      properties: stats.totalProperties,
      agents: stats.totalAgents,
      leads: stats.newLeads,
      enquiries: stats.newEnquiries,
      viewings: viewingsResult.totalDocs,
      tasks: tasksResult.totalDocs,
    },

    permissions: {
      isSuperAdmin,
      isAgencyOwner: user.role === 'agency-owner',
      isAgencyStaff: user.role === 'agency-staff',
    },
  }
}
