import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { RunImportButton } from '@/components/RunImportButton'
import { ValuationLeadStatusSelect } from '@/components/ValuationLeadStatusSelect'
import { ValuationLeadNotesButton } from '@/components/ValuationLeadNotesButton'
import { ClickableLeadRow } from '@/components/ClickableLeadRow'

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

  const recentEnquiries = await payload.find({
    collection: 'enquiries',
    depth: 2,
    limit: 5,
    sort: '-createdAt',
    where: agencyFilter,
    overrideAccess: true,
  })

  const recentValuationLeads = await payload.find({
    collection: 'valuation-leads',
    depth: 1,
    limit: 5,
    sort: '-createdAt',
    where: valuationLeadFilter,
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

  const recentProperties = await payload.find({
    collection: 'properties',
    depth: 1,
    limit: 5,
    sort: '-updatedAt',
    where: agencyFilter,
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

  const importLogs = await payload.find({
    collection: 'import-logs',
    sort: '-createdAt',
    limit: 50,
    overrideAccess: true,
  })

  const agencyImportData = agencies.docs.map((agency: any) => {
    const latestLog = importLogs.docs.find((log: any) => log.agencyName === agency.name)

    return {
      agency,
      latestLog,
    }
  })

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Agency Dashboard
        </p>

        <h1 className="mt-2 text-5xl font-medium tracking-tight">Welcome back</h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Manage your properties, agents, enquiries and CRM feed activity from one place.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Properties"
          value={properties.totalDocs}
          href="/admin/collections/properties"
        />

        <DashboardCard title="Agents" value={agents.totalDocs} href="/admin/collections/agents" />

        <DashboardCard
          title="Enquiries"
          value={enquiries.totalDocs}
          href="/admin/collections/enquiries"
        />

        <DashboardCard
          title="New Enquiries"
          value={newEnquiries.totalDocs}
          href="/admin/collections/enquiries?where[status][equals]=new"
        />
      </div>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Valuation Leads
          </p>

          <h2 className="mt-2 text-3xl font-medium">Seller Lead Performance</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Valuation Leads"
            value={valuationLeads.totalDocs}
            href="/admin/collections/valuation-leads"
          />

          <DashboardCard
            title="New Valuations"
            value={newValuationLeads.totalDocs}
            href="/admin/collections/valuation-leads"
          />

          <DashboardCard
            title="Booked"
            value={valuationsBooked.totalDocs}
            href="/admin/collections/valuation-leads"
          />

          <DashboardCard
            title="Won"
            value={instructionsWon.totalDocs}
            href="/admin/collections/valuation-leads"
          />
        </div>
      </section>

      <section className="mt-8 border p-8">
        <h3 className="text-2xl font-medium">Seller Conversion Funnel</h3>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="border p-5">
            <p className="text-sm text-muted-foreground">Leads</p>
            <p className="mt-2 text-4xl font-medium">{valuationLeads.totalDocs}</p>
          </div>

          <div className="border p-5">
            <p className="text-sm text-muted-foreground">Booked</p>
            <p className="mt-2 text-4xl font-medium">{valuationsBooked.totalDocs}</p>
          </div>

          <div className="border p-5">
            <p className="text-sm text-muted-foreground">Instructions Won</p>
            <p className="mt-2 text-4xl font-medium">{instructionsWon.totalDocs}</p>
          </div>

          <div className="border p-5">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="mt-2 text-4xl font-medium">
              {valuationLeads.totalDocs > 0
                ? Math.round((instructionsWon.totalDocs / valuationLeads.totalDocs) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Tasks</p>

          <h2 className="mt-2 text-3xl font-medium">Upcoming Follow Ups</h2>
        </div>

        <div className="divide-y border">
          {upcomingFollowUps.docs.map((lead: any) => (
            <Link
              key={lead.id}
              href={`/admin/collections/valuation-leads/${lead.id}`}
              className="flex items-center justify-between gap-6 p-5 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{lead.nextFollowUpTask || 'Follow up required'}</p>

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
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">CRM</p>

            <h2 className="mt-2 text-3xl font-medium">Import Status</h2>
          </div>

          <Link href="/admin/collections/import-logs" className="border px-4 py-2 text-sm">
            View Import Logs
          </Link>
        </div>

        <div className="grid gap-4">
          {agencyImportData.map(({ agency, latestLog }: any) => (
            <section key={agency.id} className="border p-6">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <h3 className="text-2xl font-medium">{agency.name}</h3>

                  <div className="mt-4 space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">CRM enabled:</span>{' '}
                      {agency.crm?.enabled ? 'Yes' : 'No'}
                    </p>

                    <p>
                      <span className="text-muted-foreground">CRM type:</span>{' '}
                      {agency.crm?.type || 'Not set'}
                    </p>

                    <p className="break-all">
                      <span className="text-muted-foreground">Feed URL:</span>{' '}
                      {agency.crm?.feedUrl || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="border p-4 text-sm">
                  <p className="font-medium">Latest Import</p>

                  {latestLog ? (
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      <p className="text-muted-foreground">Status</p>
                      <p className="capitalize">{latestLog.status}</p>

                      <p className="text-muted-foreground">Found</p>
                      <p>{latestLog.found ?? 0}</p>

                      <p className="text-muted-foreground">Created</p>
                      <p>{latestLog.created ?? 0}</p>

                      <p className="text-muted-foreground">Updated</p>
                      <p>{latestLog.updated ?? 0}</p>

                      <p className="text-muted-foreground">Skipped</p>
                      <p>{latestLog.skipped ?? 0}</p>

                      <p className="text-muted-foreground">Images</p>
                      <p>
                        {latestLog.imagesUploaded ?? 0} uploaded / {latestLog.imagesReused ?? 0}{' '}
                        reused
                      </p>

                      <p className="text-muted-foreground">Date</p>
                      <p>{new Date(latestLog.createdAt).toLocaleString('en-GB')}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-muted-foreground">No imports yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-start gap-3">
                <Link href={`/agency/${agency.slug}`} className="border px-4 py-2 text-sm">
                  View Agency Page
                </Link>

                <Link
                  href={`/admin/collections/agencies/${agency.id}`}
                  className="border px-4 py-2 text-sm"
                >
                  Edit Agency
                </Link>

                {agency.crm?.enabled ? <RunImportButton agencyId={agency.id} /> : null}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Latest Activity
            </p>

            <h2 className="mt-2 text-3xl font-medium">Recent Enquiries</h2>
          </div>

          <Link href="/admin/collections/enquiries" className="border px-4 py-2 text-sm">
            View all
          </Link>
        </div>

        <div className="divide-y border">
          {recentEnquiries.docs.map((enquiry) => {
            const property = typeof enquiry.property === 'object' ? enquiry.property : null

            return (
              <Link
                key={enquiry.id}
                href="/admin/collections/enquiries"
                className="grid gap-4 p-5 hover:bg-gray-50 md:grid-cols-[1.5fr_1.5fr_1fr]"
              >
                <div>
                  <p className="font-medium">{enquiry.name}</p>
                  <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{property?.title || 'Unknown property'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{enquiry.status?.replaceAll('-', ' ')}</p>
                </div>
              </Link>
            )
          })}

          {recentEnquiries.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No enquiries yet.</div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Seller Leads
            </p>

            <h2 className="mt-2 text-3xl font-medium">Recent Valuation Leads</h2>
          </div>

          <Link href="/admin/collections/valuation-leads" className="border px-4 py-2 text-sm">
            View all
          </Link>
        </div>

        <div className="divide-y border">
          {recentValuationLeads.docs.map((lead: any) => (
            <ClickableLeadRow key={lead.id} href={`/admin/collections/valuation-leads/${lead.id}`}>
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Postcode</p>
                <p className="font-medium">{lead.postcode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="font-medium">
                  {lead.estimatedValue
                    ? `£${lead.estimatedValue.toLocaleString('en-GB')}`
                    : 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  <ValuationLeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Follow-up</p>

                {lead.nextFollowUpAt ? (
                  <>
                    <p className="font-medium">
                      {new Date(lead.nextFollowUpAt).toLocaleDateString('en-GB')}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {lead.nextFollowUpTask || 'No task'}
                    </p>
                  </>
                ) : (
                  <p className="font-medium text-muted-foreground">None set</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Notes</p>

                <ValuationLeadNotesButton leadId={lead.id} currentNotes={lead.notes} />
              </div>
            </ClickableLeadRow>
          ))}

          {recentValuationLeads.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No valuation leads yet.</div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Listings</p>

            <h2 className="mt-2 text-3xl font-medium">Recent Properties</h2>
          </div>

          <Link href="/admin/collections/properties" className="border px-4 py-2 text-sm">
            View all
          </Link>
        </div>

        <div className="divide-y border">
          {recentProperties.docs.map((property) => (
            <Link
              key={property.id}
              href="/admin/collections/properties"
              className="flex items-center justify-between gap-4 p-5 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{property.title}</p>

                <p className="text-sm text-muted-foreground">
                  Ref: {property.reference || property.slug}
                </p>
              </div>

              <p className="font-medium">£{property.price?.toLocaleString('en-GB')}</p>
            </Link>
          ))}

          {recentProperties.docs.length === 0 && (
            <div className="p-6 text-muted-foreground">No properties yet.</div>
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-3 lg:grid-cols-3">
        <Link href="/admin/collections/properties" className="border p-8">
          <h2 className="text-2xl font-medium">Manage Properties</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Add, edit and review your property listings.
          </p>
        </Link>

        <Link href="/admin/collections/agents" className="border p-8">
          <h2 className="text-2xl font-medium">Manage Agents</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage your agency team and public agent profiles.
          </p>
        </Link>

        <Link href="/admin/collections/enquiries" className="border p-8">
          <h2 className="text-2xl font-medium">View Enquiries</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Track new leads, update statuses and add internal notes.
          </p>
        </Link>
      </section>
    </main>
  )
}

function DashboardCard({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Link href={href} className="border p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>

      <p className="mt-4 text-5xl font-medium">{value}</p>
    </Link>
  )
}
