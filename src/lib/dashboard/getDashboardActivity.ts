import type { Payload, Where } from 'payload'

import { getActivityRelationMap, type ActivityRelationMap } from '@/lib/activity'
import type { Activity } from '@/payload-types'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'

export type DashboardActivityResult = {
  activities: Activity[]
  relationMap: ActivityRelationMap
}

export async function getDashboardActivity({
  payload,
  user,
  limit = 8,
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
}): Promise<DashboardActivityResult> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  if (!isSuperAdmin && !agencyId) {
    return {
      activities: [],
      relationMap: {},
    }
  }

  const where: Where | undefined =
    isSuperAdmin || !agencyId
      ? undefined
      : {
          agency: {
            equals: agencyId,
          },
        }

  const result = await payload.find({
    collection: 'activities',
    depth: 1,
    limit,
    sort: '-createdAt',
    where,
    overrideAccess: true,
  })

  const activities = result.docs as Activity[]
  const relationMap = await getActivityRelationMap(payload, activities)

  return {
    activities,
    relationMap,
  }
}
