// src/lib/dashboard/getAgencyId.ts

import type { DashboardUser } from './dashboardTypes'

export function getAgencyId(user: DashboardUser): string | null {
  if (!user.agency) {
    return null
  }

  if (typeof user.agency === 'object') {
    return user.agency.id || null
  }

  return user.agency
}
