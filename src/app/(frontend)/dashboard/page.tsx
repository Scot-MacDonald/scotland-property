import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TrialStatusCard } from '@/components/TrialStatusCard'
import { canAgencyUsePlatform, getAgencySubscriptionBlockReason } from '@/lib/canAgencyUsePlatform'

function getFollowUpStatus(dateValue?: string | null) {
  if (!dateValue) return 'upcoming'

  const now = new Date()
  const followUpDate = new Date(dateValue)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (followUpDate < now) return 'overdue'
  if (followUpDate >= today && followUpDate < tomorrow) return 'today'

  return 'upcoming'
}

function getFollowUpLabel(status: string) {
  if (status === 'overdue') return 'Overdue'
  if (status === 'today') return 'Due today'
  return 'Upcoming'
}

function getFollowUpClass(status: string) {
  if (status === 'overdue') return 'bg-red-50'
  if (status === 'today') return 'bg-yellow-50'
  return ''
}

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agencyFilter: any =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

  const valuationLeadFilter: any =
    !isSuperAdmin && agencyId
      ? {
          assignedAgency: {
            equals: agencyId,
          },
        }
      : {}

  const properties = await payload.count({
    collection: 'properties',
    where: agencyFilter,
    overrideAccess: true,
  })

  const agents = await payload.count({
    collection: 'agents',
    where: agencyFilter,
    overrideAccess: true,
  })

  const enquiries = await payload.count({
    collection: 'enquiries',
    where: agencyFilter,
    overrideAccess: true,
  })

  const valuationLeads = await payload.count({
    collection: 'valuation-leads',
    where: valuationLeadFilter,
    overrideAccess: true,
  })

  const newValuationLeads = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        valuationLeadFilter,
        {
          status: {
            equals: 'new',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const valuationsBooked = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        valuationLeadFilter,
        {
          status: {
            equals: 'valuation-booked',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const instructionsWon = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        valuationLeadFilter,
        {
          status: {
            equals: 'instruction-won',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const newEnquiries = await payload.count({
    collection: 'enquiries',
    where: {
      and: [
        agencyFilter,
        {
          status: {
            equals: 'new',
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const upcomingFollowUps = await payload.find({
    collection: 'valuation-leads',
    depth: 1,
    limit: 10,
    sort: 'nextFollowUpAt',
    where: {
      and: [
        valuationLeadFilter,
        {
          nextFollowUpAt: {
            exists: true,
          },
        },
        {
          followUpCompleted: {
            not_equals: true,
          },
        },
      ],
    },
    overrideAccess: true,
  })

  const agencies = await payload.find({
    collection: 'agencies',
    depth: 1,
    limit: 100,
    overrideAccess: true,
    where:
      !isSuperAdmin && agencyId
        ? {
            id: {
              equals: agencyId,
            },
          }
        : undefined,
  })

  const currentAgency = agencies.docs[0] as any
  const platformAccessAllowed = currentAgency ? canAgencyUsePlatform(currentAgency) : true

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Agency Dashboard
        </p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Welcome back</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Your agency command centre for listings, enquiries, seller leads and performance.
        </p>
      </div>

      {currentAgency && currentAgency.subscriptionStatus === 'trial' && (
        <TrialStatusCard
          subscriptionStatus={currentAgency.subscriptionStatus}
          trialEndsAt={currentAgency.trialEndsAt}
        />
      )}

      {currentAgency && !platformAccessAllowed && currentAgency.subscriptionStatus !== 'trial' && (
        <div className="mb-10 border border-red-200 bg-red-50 p-6">
          <h2 className="text-2xl font-medium">Subscription Required</h2>

          <p className="mt-3 text-muted-foreground">
            {getAgencySubscriptionBlockReason(currentAgency)}
          </p>

          <Link href="/dashboard/billing" className="mt-5 inline-block border bg-white px-4 py-2">
            Upgrade Now
          </Link>
        </div>
      )}

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Properties"
          value={properties.totalDocs}
          href="/dashboard/properties"
        />

        <DashboardCard title="Agents" value={agents.totalDocs} href="/admin/collections/agents" />

        <DashboardCard title="Enquiries" value={enquiries.totalDocs} href="/dashboard/enquiries" />

        <DashboardCard
          title="New Enquiries"
          value={newEnquiries.totalDocs}
          href="/dashboard/enquiries"
        />
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Sales Overview
          </p>

          <h2 className="mt-2 text-3xl font-medium">Key Performance Indicators</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Valuation Leads"
            value={valuationLeads.totalDocs}
            href="/dashboard/leads"
          />

          <DashboardCard
            title="New Valuations"
            value={newValuationLeads.totalDocs}
            href="/dashboard/leads"
          />

          <DashboardCard
            title="Booked"
            value={valuationsBooked.totalDocs}
            href="/dashboard/pipeline"
          />

          <DashboardCard
            title="Won"
            value={instructionsWon.totalDocs}
            href="/dashboard/analytics"
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Tasks</p>

          <h2 className="mt-2 text-3xl font-medium">Upcoming Follow Ups</h2>
        </div>

        <div className="divide-y border bg-white">
          {upcomingFollowUps.docs.map((lead: any) => (
            <Link
              key={lead.id}
              href={`/admin/collections/valuation-leads/${lead.id}`}
              className={`flex items-center justify-between gap-6 p-5 hover:bg-gray-50 ${getFollowUpClass(
                getFollowUpStatus(lead.nextFollowUpAt),
              )}`}
            >
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {getFollowUpLabel(getFollowUpStatus(lead.nextFollowUpAt))}
                </p>

                <p className="text-sm text-muted-foreground">
                  {lead.name} • {lead.postcode}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {new Date(lead.nextFollowUpAt).toLocaleString('en-GB')}
                </p>
              </div>
            </Link>
          ))}

          {upcomingFollowUps.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No upcoming follow ups.</div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Quick Actions</p>

          <h2 className="mt-2 text-3xl font-medium">Manage Your Agency</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <DashboardActionCard
            title="Settings"
            description="Manage agency profile, contact details and CRM settings."
            href="/dashboard/settings"
          />
          <DashboardActionCard
            title="Properties"
            description="Manage your property portfolio, add listings and update availability."
            href="/dashboard/properties"
          />

          <DashboardActionCard
            title="Buyer Enquiries"
            description="Review buyer enquiries and manage the enquiry inbox."
            href="/dashboard/enquiries"
          />

          <DashboardActionCard
            title="Buyer Pipeline"
            description="Move enquiries through the sales pipeline."
            href="/dashboard/enquiries/pipeline"
          />

          <DashboardActionCard
            title="Seller Leads"
            description="Manage valuation requests and follow-up activity."
            href="/dashboard/leads"
          />

          <DashboardActionCard
            title="Seller Pipeline"
            description="Manage valuation leads using the CRM pipeline."
            href="/dashboard/pipeline"
          />

          <DashboardActionCard
            title="Analytics"
            description="Track performance, conversions and business growth."
            href="/dashboard/analytics"
          />

          <DashboardActionCard
            title="Billing"
            description="Manage subscriptions, plans and payment information."
            href="/dashboard/billing"
          />

          <DashboardActionCard
            title="Agents"
            description="Manage your agency team and public agent profiles."
            href="/dashboard/agents"
          />

          <DashboardActionCard
            title="CRM Imports"
            description="Review feed imports and CRM activity."
            href="/dashboard/imports"
          />
        </div>
      </section>
    </main>
  )
}

function DashboardCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link href={href} className="border bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-4 text-5xl font-medium">{value}</p>
    </Link>
  )
}

function DashboardActionCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="border bg-white p-8 transition hover:bg-neutral-50">
      <h3 className="text-2xl font-medium">{title}</h3>

      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}
