import type { Payload } from 'payload'

import type { DashboardUser } from '@/lib/dashboard/dashboardTypes'
import { getAgencyId } from '@/lib/dashboard/getAgencyId'

import type { InvitationActionResult } from './invitationTypes'

function canManageInvitations(role?: string | null) {
  return role === 'super-admin' || role === 'agency-admin' || role === 'agency-owner'
}

export async function cancelInvitation({
  payload,
  user,
  invitationId,
}: {
  payload: Payload
  user: DashboardUser
  invitationId: string
}): Promise<InvitationActionResult> {
  if (!canManageInvitations(user.role)) {
    return {
      success: false,
      message: 'You do not have permission to cancel invitations.',
    }
  }

  const invitation = await payload.findByID({
    collection: 'user-invitations',
    id: invitationId,
    depth: 0,
    overrideAccess: true,
  })

  if (!invitation) {
    return {
      success: false,
      message: 'Invitation not found.',
    }
  }

  const agencyId = getAgencyId(user)

  const invitationAgencyId =
    typeof invitation.agency === 'object' ? invitation.agency?.id : invitation.agency

  if (user.role !== 'super-admin' && (!agencyId || invitationAgencyId !== agencyId)) {
    return {
      success: false,
      message: 'You cannot manage invitations for another agency.',
    }
  }

  if (invitation.status !== 'pending') {
    return {
      success: false,
      message: 'Only pending invitations can be cancelled.',
    }
  }

  await payload.update({
    collection: 'user-invitations',
    id: invitationId,
    overrideAccess: true,
    data: {
      status: 'cancelled',
    },
  })

  return {
    success: true,
    message: 'Invitation cancelled.',
  }
}
