import { notFound } from 'next/navigation'

import AgentEditForm from '@/components/AgentEditForm'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'
import {
  assertWorkspaceOwnership,
  formatDate,
  getRelationshipLabel,
  getWorkspaceContext,
} from '@/lib/dashboard'

type AgentWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const agentTabIds = ['overview', 'settings', 'history'] as const

type AgentTabId = (typeof agentTabIds)[number]

function isAgentTabId(value: string): value is AgentTabId {
  return agentTabIds.includes(value as AgentTabId)
}

export default async function AgentWorkspacePage({
  params,
  searchParams,
}: AgentWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: AgentTabId = isAgentTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/agents/${id}`,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/dashboard/agents/${id}?tab=settings`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/agents/${id}?tab=history`,
    },
  ]

  const { payload, agencyId, isSuperAdmin } = await getWorkspaceContext()

  let agent

  try {
    agent = await payload.findByID({
      collection: 'agents',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    const agentResult = await payload.find({
      collection: 'agents',
      depth: 2,
      limit: 1,
      overrideAccess: true,
      where: {
        slug: {
          equals: id,
        },
      },
    })

    agent = agentResult.docs[0]
  }

  if (!agent) {
    notFound()
  }

  assertWorkspaceOwnership({
    recordAgency: agent.agency,
    agencyId,
    isSuperAdmin,
  })

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/agents"
          backLabel="Agents"
          eyebrow={agent.jobTitle || 'Agent'}
          title={agent.name}
          actions={
            agent.slug ? (
              <a
                href={`/agent/${agent.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                View profile
              </a>
            ) : null
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Agent details">
          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(agent.agency)} />

          <WorkspaceSidebarItem label="Job title" value={agent.jobTitle || 'Not set'} />

          <WorkspaceSidebarItem label="Email" value={agent.email || 'Not set'} />

          <WorkspaceSidebarItem label="Phone" value={agent.phone || 'Not set'} />

          <WorkspaceSidebarItem label="Created" value={formatDate(agent.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(agent.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <div className="border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Agent overview
            </p>

            <h2 className="mt-2 text-xl font-semibold text-neutral-950">{agent.name}</h2>

            <p className="mt-1 text-sm text-neutral-600">
              {agent.jobTitle || 'No job title has been added.'}
            </p>
          </div>

          <dl className="divide-y divide-neutral-200">
            <div className="grid gap-2 px-6 py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-sm font-medium text-neutral-500">Agency</dt>
              <dd className="text-sm font-medium text-neutral-950">
                {getRelationshipLabel(agent.agency)}
              </dd>
            </div>

            <div className="grid gap-2 px-6 py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-sm font-medium text-neutral-500">Email</dt>
              <dd className="text-sm text-neutral-800">
                {agent.email ? (
                  <a
                    href={`mailto:${agent.email}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {agent.email}
                  </a>
                ) : (
                  'Not set'
                )}
              </dd>
            </div>

            <div className="grid gap-2 px-6 py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-sm font-medium text-neutral-500">Phone</dt>
              <dd className="text-sm text-neutral-800">
                {agent.phone ? (
                  <a
                    href={`tel:${agent.phone}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {agent.phone}
                  </a>
                ) : (
                  'Not set'
                )}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {activeTab === 'settings' ? (
        <div className="border border-neutral-200 bg-white p-6">
          <div className="mb-8 border-b border-neutral-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Agent settings
            </p>

            <h2 className="mt-2 text-xl font-semibold text-neutral-950">Profile details</h2>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Update this agent&apos;s contact and profile information.
            </p>
          </div>

          <AgentEditForm agent={agent} />
        </div>
      ) : null}

      {activeTab === 'history' ? (
        <div className="border border-neutral-200 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-neutral-950">Agent history</h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-600">
            Activity connected to this agent will appear here.
          </p>
        </div>
      ) : null}
    </WorkspaceLayout>
  )
}
