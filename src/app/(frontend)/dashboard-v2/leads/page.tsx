import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardLeadCard } from '@/components/DashboardV2/Cards/DashboardLeadCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
import { getDashboardLeads } from '@/lib/dashboard/getDashboardLeads'

function formatPrice(value?: number | null) {
  if (!value) return 'Not provided'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardV2LeadsPage() {
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

  const [dashboard, leads] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardLeads({
      payload,
      user: dashboardUser,
      limit: 100,
    }),
  ])

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
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
              <DashboardLeadCard
                key={lead.id}
                name={lead.name}
                postcode={lead.postcode || undefined}
                estimatedValue={formatPrice(lead.estimatedValue)}
                status={lead.status}
                href={`/dashboard/leads/${lead.id}`}
              />
            ))}
          </div>
        </DashboardCollection>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
