import 'server-only'

import type { Payload } from 'payload'

import { validateInvitation } from './validateInvitation'

export type AcceptInvitationResult =
  | {
      success: true
      message: string
      userId: string
      email: string
    }
  | {
      success: false
      message: string
    }

export async function acceptInvitation({
  payload,
  token,
  password,
}: {
  payload: Payload
  token: string
  password: string
}): Promise<AcceptInvitationResult> {
  if (password.length < 8) {
    return {
      success: false,
      message: 'Your password must contain at least 8 characters.',
    }
  }

  const validation = await validateInvitation({
    payload,
    token,
  })

  if (!validation.success) {
    return validation
  }

  const { invitation } = validation

  const existingUser = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: {
      email: {
        equals: invitation.email,
      },
    },
    overrideAccess: true,
  })

  if (existingUser.totalDocs > 0) {
    return {
      success: false,
      message: 'An account already exists for this email address.',
    }
  }

  const user = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: invitation.name,
      email: invitation.email,
      password,
      role: invitation.role,
      agency: invitation.agency.id,
    },
  })

  await payload.update({
    collection: 'user-invitations',
    id: invitation.id,
    overrideAccess: true,
    data: {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedBy: user.id,
    },
  })

  return {
    success: true,
    message: 'Your account has been created.',
    userId: user.id,
    email: invitation.email,
  }
}
