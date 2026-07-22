import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardPrioritySummary = {
  overdueFollowUps: number
  todayViewings: number
  newEnquiries: number
}

export async function getDashboardPriorities({
  payload,
  user,
}: {
  payload: Payload
  user: DashboardUser
}): Promise<DashboardPrioritySummary> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)
  const agencyFilter = getAgencyWhere(agencyId, isSuperAdmin)

  const leadAgencyFilter = getAgencyWhere(agencyId, isSuperAdmin, 'assignedAgency')
  const now = new Date()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  const leadConditions: Where[] = [
    {
      followUpCompleted: {
        equals: false,
      },
    },
    {
      nextFollowUpAt: {
        less_than: now.toISOString(),
      },
    },
  ]

  if (leadAgencyFilter) {
    leadConditions.push(leadAgencyFilter)
  }

  const viewingConditions: Where[] = [
    {
      dateTime: {
        greater_than_equal: startOfToday.toISOString(),
      },
    },
    {
      dateTime: {
        less_than: startOfTomorrow.toISOString(),
      },
    },
    {
      status: {
        not_in: ['cancelled', 'no-show'],
      },
    },
  ]

  if (agencyFilter) {
    viewingConditions.push(agencyFilter)
  }

  const enquiryConditions: Where[] = [
    {
      status: {
        equals: 'new',
      },
    },
  ]

  if (agencyFilter) {
    enquiryConditions.push(agencyFilter)
  }

  const [overdueFollowUps, todayViewings, newEnquiries] = await Promise.all([
    payload.count({
      collection: 'valuation-leads',
      where: {
        and: leadConditions,
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'viewings',
      where: {
        and: viewingConditions,
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'enquiries',
      where: {
        and: enquiryConditions,
      },
      overrideAccess: true,
    }),
  ])

  return {
    overdueFollowUps: overdueFollowUps.totalDocs,
    todayViewings: todayViewings.totalDocs,
    newEnquiries: newEnquiries.totalDocs,
  }
}
