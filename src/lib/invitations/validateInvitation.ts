import 'server-only'

import type { Payload } from 'payload'

import type { InvitationRole } from './invitationTypes'

export type ValidatedInvitation = {
  id: string
  name: string
  email: string
  role: InvitationRole
  expiresAt: string
  agency: {
    id: string
    name: string
  }
}

export type ValidateInvitationResult =
  | {
      success: true
      invitation: ValidatedInvitation
    }
  | {
      success: false
      message: string
    }

export async function validateInvitation({
  payload,
  token,
}: {
  payload: Payload
  token: string
}): Promise<ValidateInvitationResult> {
  const cleanToken = token.trim()

  if (!cleanToken) {
    return {
      success: false,
      message: 'This invitation link is invalid.',
    }
  }

  const result = await payload.find({
    collection: 'user-invitations',
    depth: 1,
    limit: 1,
    where: {
      token: {
        equals: cleanToken,
      },
    },
    overrideAccess: true,
  })

  const invitation = result.docs[0]

  if (!invitation) {
    return {
      success: false,
      message: 'This invitation could not be found.',
    }
  }

  if (invitation.status === 'accepted') {
    return {
      success: false,
      message: 'This invitation has already been accepted.',
    }
  }

  if (invitation.status === 'cancelled') {
    return {
      success: false,
      message: 'This invitation has been cancelled.',
    }
  }

  if (invitation.status === 'expired') {
    return {
      success: false,
      message: 'This invitation has expired.',
    }
  }

  if (new Date(invitation.expiresAt).getTime() <= Date.now()) {
    await payload.update({
      collection: 'user-invitations',
      id: invitation.id,
      overrideAccess: true,
      data: {
        status: 'expired',
      },
    })

    return {
      success: false,
      message: 'This invitation has expired.',
    }
  }

  if (typeof invitation.agency !== 'object' || !invitation.agency || !invitation.agency.id) {
    return {
      success: false,
      message: 'The agency connected to this invitation could not be found.',
    }
  }

  return {
    success: true,
    invitation: {
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      role: invitation.role as InvitationRole,
      expiresAt: invitation.expiresAt,
      agency: {
        id: invitation.agency.id,
        name: invitation.agency.name,
      },
    },
  }
}
