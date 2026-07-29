import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { DashboardPendingInvitationCard } from '@/components/DashboardV2/Cards/DashboardPendingInvitationCard'
import { DashboardUserCard } from '@/components/DashboardV2/Cards/DashboardUserCard'
import { InviteTeamMemberForm } from '@/components/DashboardV2/Cards/InviteTeamMemberForm'
import { getDashboardUsers } from '@/lib/dashboard'
import { getDashboardInvitations } from '@/lib/invitations'

import {
  AgencyBrandingForm,
  AgencyContactForm,
  AgencyCRMForm,
  AgencyOverviewForm,
} from '@/components/DashboardV2/Agency'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'
import { formatDate } from '@/lib/dashboard'

type AgencySettingsPageProps = {
  searchParams: Promise<{
    tab?: string
  }>
}

const agencyTabIds = ['overview', 'branding', 'contact', 'crm', 'team', 'history'] as const
type AgencyTabId = (typeof agencyTabIds)[number]

function isAgencyTabId(value: string): value is AgencyTabId {
  return agencyTabIds.includes(value as AgencyTabId)
}

function formatLabel(value?: string | null) {
  if (!value) return 'Not set'

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatRole(role: string) {
  if (role === 'agency-owner') return 'Agency Owner'
  if (role === 'agency-staff') return 'Agency Staff'
  if (role === 'super-admin') return 'Super Admin'

  return role
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function AgencySettingsPage({ searchParams }: AgencySettingsPageProps) {
  const { tab = 'overview' } = await searchParams
  const activeTab: AgencyTabId = isAgencyTabId(tab) ? tab : 'overview'

  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    redirect('/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const isSuperAdmin = user.role === 'super-admin'
  const userAgencyId = typeof user.agency === 'object' ? user.agency?.id : user.agency

  let agency

  if (userAgencyId) {
    agency = await payload.findByID({
      collection: 'agencies',
      id: userAgencyId,
      depth: 2,
      overrideAccess: true,
    })
  } else if (isSuperAdmin) {
    const result = await payload.find({
      collection: 'agencies',
      depth: 2,
      limit: 1,
      overrideAccess: true,
      sort: '-updatedAt',
    })

    agency = result.docs[0]
  }

  if (!agency) {
    notFound()
  }

  const [teamUsers, invitations] = await Promise.all([
    getDashboardUsers({
      payload,
      user,
    }),

    getDashboardInvitations({
      payload,
      user,
    }),
  ])

  const pendingInvitations = invitations.filter((invitation) => invitation.status === 'pending')

  const canManageTeam = isSuperAdmin || user.role === 'agency-owner'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: '/dashboard/settings',
    },
    {
      id: 'branding',
      label: 'Branding',
      href: '/dashboard/settings?tab=branding',
    },
    {
      id: 'contact',
      label: 'Contact',
      href: '/dashboard/settings?tab=contact',
    },
    {
      id: 'crm',
      label: 'CRM',
      href: '/dashboard/settings?tab=crm',
    },
    {
      id: 'team',
      label: 'Team',
      href: '/dashboard/settings?tab=team',
    },
    {
      id: 'history',
      label: 'History',
      href: '/dashboard/settings?tab=history',
    },
  ]

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard"
          backLabel="Dashboard"
          eyebrow="Agency workspace"
          title={agency.name}
          actions={
            agency.slug ? (
              <a
                className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
                href={`/agency/${agency.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                View profile
              </a>
            ) : null
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Agency details">
          <WorkspaceSidebarItem label="Subscription" value={formatLabel(agency.subscriptionPlan)} />

          <WorkspaceSidebarItem label="Status" value={formatLabel(agency.subscriptionStatus)} />

          <WorkspaceSidebarItem label="Featured" value={agency.featured ? 'Yes' : 'No'} />

          <WorkspaceSidebarItem label="CRM" value={agency.crm?.enabled ? 'Enabled' : 'Disabled'} />

          <WorkspaceSidebarItem label="Created" value={formatDate(agency.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(agency.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? <AgencyOverviewForm agency={agency} /> : null}

      {activeTab === 'branding' ? <AgencyBrandingForm agency={agency} /> : null}

      {activeTab === 'contact' ? <AgencyContactForm agency={agency} /> : null}

      {activeTab === 'crm' ? <AgencyCRMForm agency={agency} /> : null}

      {activeTab === 'team' ? (
        <div className="space-y-6">
          {canManageTeam ? <InviteTeamMemberForm /> : null}

          <section className="border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-neutral-950">Team members</h2>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Users who currently have access to this agency workspace.
              </p>
            </div>

            <div className="p-6">
              {teamUsers.length === 0 ? (
                <div className="border border-dashed border-neutral-300 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-neutral-950">No team members found</p>

                  <p className="mt-1 text-sm text-neutral-600">
                    Invite your first team member to give them access.
                  </p>
                </div>
              ) : (
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
              )}
            </div>
          </section>

          <section className="border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-neutral-950">Pending invitations</h2>

              <p className="mt-1 text-sm leading-6 text-neutral-600">
                Invitations that have been sent but not yet accepted.
              </p>
            </div>

            <div className="p-6">
              {pendingInvitations.length === 0 ? (
                <div className="border border-dashed border-neutral-300 px-6 py-10 text-center">
                  <p className="text-sm font-medium text-neutral-950">No pending invitations</p>

                  <p className="mt-1 text-sm text-neutral-600">
                    Outstanding invitations will appear here.
                  </p>
                </div>
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
                      canManage={canManageTeam}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <div className="border border-neutral-200 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-neutral-950">Agency history</h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-600">
            Changes, imports and other activity connected to this agency will appear here.
          </p>
        </div>
      ) : null}
    </WorkspaceLayout>
  )
}
