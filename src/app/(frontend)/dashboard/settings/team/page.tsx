import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardPendingInvitationCard } from '@/components/DashboardV2/Cards/DashboardPendingInvitationCard'
import { DashboardUserCard } from '@/components/DashboardV2/Cards/DashboardUserCard'
import { InviteTeamMemberForm } from '@/components/DashboardV2/Cards/InviteTeamMemberForm'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'

import { getDashboardContext, getDashboardUsers } from '@/lib/dashboard'
import { getDashboardInvitations } from '@/lib/invitations'

function formatRole(role: string) {
  if (role === 'agency-owner') return 'Agency Owner'
  if (role === 'agency-staff') return 'Agency Staff'
  if (role === 'super-admin') return 'Super Admin'

  return role.replaceAll('-', ' ')
}

export default async function DashboardV2TeamPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any

  const [dashboard, teamUsers, invitations] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardUsers({
      payload,
      user: dashboardUser,
    }),

    getDashboardInvitations({
      payload,
      user: dashboardUser,
    }),
  ])

  const pendingInvitations = invitations.filter((invitation) => invitation.status === 'pending')

  const agencyName = dashboard.agency?.name ?? dashboardUser.name ?? 'Your Agency'

  const canManage = dashboard.permissions.isSuperAdmin || dashboard.permissions.isAgencyOwner

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Agency Settings"
        title="Team"
        description="Manage your agency users and invitations."
      />

      <DashboardWorkspace>
        {canManage && (
          <div className="mb-10">
            <InviteTeamMemberForm />
          </div>
        )}

        <DashboardCollection empty={false} showPagination={false}>
          <h2 className="mb-6 text-xl font-medium">Team Members</h2>

          <div className="grid gap-4 lg:grid-cols-2">
            {teamUsers.map((member) => (
              <DashboardUserCard
                key={member.id}
                name={member.name}
                email={member.email}
                role={formatRole(member.role)}
              />
            ))}
          </div>

          <h2 className="mb-6 mt-12 text-xl font-medium">Pending Invitations</h2>

          {pendingInvitations.length === 0 ? (
            <p className="text-black/50">No pending invitations.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingInvitations.map((invitation) => (
                <DashboardPendingInvitationCard
                  key={invitation.id}
                  id={invitation.id}
                  name={invitation.name}
                  email={invitation.email}
                  role={invitation.role}
                  status={invitation.status}
                  expiresAt={invitation.expiresAt}
                  canManage={canManage}
                />
              ))}
            </div>
          )}
        </DashboardCollection>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
