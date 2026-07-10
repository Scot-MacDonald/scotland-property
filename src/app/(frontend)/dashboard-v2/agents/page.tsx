import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardAgentCard } from '@/components/DashboardV2/Cards/DashboardAgentCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardAgents, getDashboardStats } from '@/lib/dashboard'

export default async function DashboardV2AgentsPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const [agents, stats] = await Promise.all([
    getDashboardAgents({
      payload,
      user: user as any,
      limit: 100,
    }),

    getDashboardStats({
      payload,
      user: user as any,
    }),
  ])

  return (
    <DashboardLayout
      navigationCounts={{
        properties: stats.totalProperties,
        agents: stats.totalAgents,
        leads: stats.newLeads,
        enquiries: stats.newEnquiries,
      }}
    >
      <DashboardHeader
        eyebrow="Agency Team"
        title="Agents"
        description={`${agents.length} ${
          agents.length === 1 ? 'agent' : 'agents'
        } in your agency team.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard-v2',
            variant: 'secondary',
          },
          {
            label: 'Add Agent',
            href: '/dashboard/agents/new',
            variant: 'primary',
          },
        ]}
      />

      <DashboardWorkspace>
        <DashboardCollection
          empty={agents.length === 0}
          emptyTitle="No agents yet"
          emptyDescription="Add your first agent to begin building your public agency team."
          showPagination={false}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <DashboardAgentCard
                key={agent.id}
                name={agent.name}
                role={agent.jobTitle || undefined}
                email={agent.email || undefined}
                phone={agent.phone || undefined}
                href={`/dashboard/agents`}
              />
            ))}
          </div>
        </DashboardCollection>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
