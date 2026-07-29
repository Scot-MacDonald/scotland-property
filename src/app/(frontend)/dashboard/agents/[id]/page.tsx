import { notFound } from 'next/navigation'
import { AgentOverviewForm } from '@/components/DashboardV2/Agents'

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

const agentTabIds = ['overview', 'history'] as const
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
      {activeTab === 'overview' ? <AgentOverviewForm agent={agent} /> : null}

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
