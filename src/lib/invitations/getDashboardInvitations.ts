import type { Payload } from 'payload'

import type { DashboardUser } from '@/lib/dashboard/dashboardTypes'
import { getAgencyId } from '@/lib/dashboard/getAgencyId'

import type { DashboardInvitation, InvitationRole, InvitationStatus } from './invitationTypes'

export async function getDashboardInvitations({
  payload,
  user,
}: {
  payload: Payload
  user: DashboardUser
}): Promise<DashboardInvitation[]> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  if (!isSuperAdmin && !agencyId) {
    return []
  }

  const result = await payload.find({
    collection: 'user-invitations',
    depth: 0,
    pagination: false,
    sort: '-createdAt',
    where:
      !isSuperAdmin && agencyId
        ? {
            agency: {
              equals: agencyId,
            },
          }
        : undefined,
    overrideAccess: true,
  })

  const now = Date.now()

  return result.docs.map((invitation: any) => {
    const storedStatus = (invitation.status as InvitationStatus | undefined) || 'pending'

    const status: InvitationStatus =
      storedStatus === 'pending' && new Date(invitation.expiresAt).getTime() < now
        ? 'expired'
        : storedStatus

    return {
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role as InvitationRole,
      status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    }
  })
}
