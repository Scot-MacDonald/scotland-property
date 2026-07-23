// src/lib/dashboard/getAssignedAgencyWhere.ts

import type { Where } from 'payload'

export function getAssignedAgencyWhere(
  agencyId?: string | null,
  isSuperAdmin = false,
): Where | undefined {
  if (isSuperAdmin || !agencyId) {
    return undefined
  }

  return {
    assignedAgency: {
      equals: agencyId,
    },
  }
}
