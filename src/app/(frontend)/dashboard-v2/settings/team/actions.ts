'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { cancelInvitation, createInvitation, type InvitationRole } from '@/lib/invitations'

export type TeamActionResult =
  | {
      success: true
      message: string
      invitationUrl?: string
    }
  | {
      success: false
      message: string
    }

async function getAuthenticatedDashboardUser() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    return {
      payload,
      user: null,
    }
  }

  return {
    payload,
    user: user as any,
  }
}

export async function createTeamInvitationAction({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: InvitationRole
}): Promise<TeamActionResult> {
  const { payload, user } = await getAuthenticatedDashboardUser()

  if (!user) {
    return {
      success: false,
      message: 'Your session has expired. Please sign in again.',
    }
  }

  const result = await createInvitation({
    payload,
    user,
    name,
    email,
    role,
  })

  if (!result.success) {
    return result
  }

  revalidatePath('/dashboard-v2/settings/team')

  return {
    success: true,
    message: result.message,
    invitationUrl: result.invitationUrl,
  }
}

export async function cancelTeamInvitationAction({
  invitationId,
}: {
  invitationId: string
}): Promise<TeamActionResult> {
  const { payload, user } = await getAuthenticatedDashboardUser()

  if (!user) {
    return {
      success: false,
      message: 'Your session has expired. Please sign in again.',
    }
  }

  const result = await cancelInvitation({
    payload,
    user,
    invitationId,
  })

  if (!result.success) {
    return result
  }

  revalidatePath('/dashboard-v2/settings/team')

  return {
    success: true,
    message: result.message,
  }
}
