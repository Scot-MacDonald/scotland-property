import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardLeadCard } from '@/components/DashboardV2/Cards/DashboardLeadCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardLeads, getDashboardStats } from '@/lib/dashboard'

export default async function DashboardV2LeadsPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user) redirect('/admin/login')

  if (user.collection !== 'users') redirect('/login')

  const [leads, stats] = await Promise.all([
    getDashboardLeads({
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
        eyebrow="Seller Pipeline"
        title="Valuation Leads"
        description={`${leads.length} valuation ${leads.length === 1 ? 'lead' : 'leads'}`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard-v2',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <DashboardCollection
          empty={leads.length === 0}
          emptyTitle="No valuation leads"
          emptyDescription="New valuation requests will appear here."
          showPagination={false}
        >
          <div className="grid gap-4">
            {leads.map((lead) => (
              <DashboardLeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </DashboardCollection>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
