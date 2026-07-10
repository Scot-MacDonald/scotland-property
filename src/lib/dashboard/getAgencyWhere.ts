// src/lib/dashboard/getAgencyWhere.ts

import type { Where } from 'payload'

export function getAgencyWhere(agencyId?: string | null, isSuperAdmin = false): Where | undefined {
  if (isSuperAdmin || !agencyId) {
    return undefined
  }

  return {
    agency: {
      equals: agencyId,
    },
  }
}
