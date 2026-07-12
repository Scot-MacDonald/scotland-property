import crypto from 'node:crypto'
import type { Payload } from 'payload'

import type { DashboardUser } from '@/lib/dashboard/dashboardTypes'
import { getAgencyId } from '@/lib/dashboard/getAgencyId'

import type { InvitationActionResult, InvitationRole } from './invitationTypes'

function canInviteUsers(role?: string | null) {
  return role === 'super-admin' || role === 'agency-admin' || role === 'agency-owner'
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

function formatRole(role: InvitationRole) {
  return role === 'agency-owner' ? 'Agency Owner' : 'Agency Staff'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function createInvitation({
  payload,
  user,
  name,
  email,
  role,
}: {
  payload: Payload
  user: DashboardUser
  name: string
  email: string
  role: InvitationRole
}): Promise<InvitationActionResult> {
  if (!canInviteUsers(user.role)) {
    return {
      success: false,
      message: 'You do not have permission to invite team members.',
    }
  }

  const agencyId = getAgencyId(user)

  if (!agencyId && user.role !== 'super-admin') {
    return {
      success: false,
      message: 'Your account is not connected to an agency.',
    }
  }

  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanName) {
    return {
      success: false,
      message: 'Please enter the team member’s name.',
    }
  }

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Please enter an email address.',
    }
  }

  if (role !== 'agency-owner' && role !== 'agency-staff') {
    return {
      success: false,
      message: 'Please select a valid role.',
    }
  }

  if (!agencyId) {
    return {
      success: false,
      message: 'An agency must be selected before creating an invitation.',
    }
  }

  const existingUser = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: {
      email: {
        equals: cleanEmail,
      },
    },
    overrideAccess: true,
  })

  if (existingUser.totalDocs > 0) {
    return {
      success: false,
      message: 'A user with this email address already exists.',
    }
  }

  const existingInvitation = await payload.find({
    collection: 'user-invitations',
    depth: 0,
    limit: 1,
    where: {
      and: [
        {
          email: {
            equals: cleanEmail,
          },
        },
        {
          agency: {
            equals: agencyId,
          },
        },
        {
          status: {
            equals: 'pending',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  if (existingInvitation.totalDocs > 0) {
    return {
      success: false,
      message: 'A pending invitation already exists for this email address.',
    }
  }

  const token = crypto.randomBytes(32).toString('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const invitation = await payload.create({
    collection: 'user-invitations',
    overrideAccess: true,
    data: {
      name: cleanName,
      email: cleanEmail,
      agency: agencyId,
      role,
      status: 'pending',
      token,
      expiresAt: expiresAt.toISOString(),
      createdBy: user.id,
    },
  })

  const invitationUrl = `${getBaseUrl()}/invite/${invitation.token}`

  const inviterName =
    typeof user.name === 'string' && user.name.trim()
      ? user.name.trim()
      : 'Your agency administrator'

  try {
    await payload.sendEmail({
      to: cleanEmail,
      subject: `You've been invited to join Scotland Luxury Estates`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:0 auto;padding:32px;">
          <p style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#777;margin:0 0 24px;">
            Scotland Luxury Estates
          </p>

          <h1 style="font-size:32px;line-height:1.2;margin:0 0 20px;">
            You're invited
          </h1>

          <p style="margin:0 0 16px;">
            ${escapeHtml(inviterName)} has invited you to join their agency workspace.
          </p>

          <p style="margin:0 0 16px;">
            Your role will be:
            <strong>${formatRole(role)}</strong>
          </p>

          <p style="margin:32px 0;">
            <a
              href="${invitationUrl}"
              style="display:inline-block;background:#111;color:#fff;padding:14px 22px;text-decoration:none;"
            >
              Accept invitation
            </a>
          </p>

          <p style="margin:0 0 16px;color:#666;">
            This invitation expires in 7 days.
          </p>

          <p style="font-size:13px;color:#777;word-break:break-all;margin:0;">
            If the button does not work, copy and paste this link into your browser:<br />
            ${invitationUrl}
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Invitation email failed:', error)

    return {
      success: true,
      message:
        'Invitation created, but the email could not be sent. Use the invitation link below.',
      invitationId: invitation.id,
      invitationUrl,
    }
  }

  return {
    success: true,
    message: 'Invitation sent successfully.',
    invitationId: invitation.id,
    invitationUrl,
  }
}
