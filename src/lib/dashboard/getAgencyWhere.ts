import type { Where } from 'payload'

export function getAgencyWhere(
  agencyId?: string | null,
  isSuperAdmin = false,
  field = 'agency',
): Where | undefined {
  if (isSuperAdmin || !agencyId) {
    return undefined
  }

  return {
    [field]: {
      equals: agencyId,
    },
  }
}
