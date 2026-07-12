export type InvitationRole = 'agency-owner' | 'agency-staff'

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export type DashboardInvitation = {
  id: string
  name: string
  email: string
  role: InvitationRole
  status: InvitationStatus
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export type InvitationActionResult =
  | {
      success: true
      message: string
      invitationId?: string
      invitationUrl?: string
    }
  | {
      success: false
      message: string
    }
