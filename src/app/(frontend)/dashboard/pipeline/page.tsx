import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const statuses = [
  {
    label: 'New',
    value: 'new',
    className: 'border-yellow-200 bg-yellow-50',
    badgeClassName: 'bg-yellow-100',
  },
  {
    label: 'Contacted',
    value: 'contacted',
    className: 'border-blue-200 bg-blue-50',
    badgeClassName: 'bg-blue-100',
  },
  {
    label: 'Booked',
    value: 'valuation-booked',
    className: 'border-orange-200 bg-orange-50',
    badgeClassName: 'bg-orange-100',
  },
  {
    label: 'Won',
    value: 'instruction-won',
    className: 'border-green-200 bg-green-50',
    badgeClassName: 'bg-green-100',
  },
  {
    label: 'Lost',
    value: 'lost',
    className: 'border-red-200 bg-red-50',
    badgeClassName: 'bg-red-100',
  },
]

function formatMoney(value?: number | null) {
  if (!value) return 'Not provided'
  return `£${value.toLocaleString('en-GB')}`
}

function getFollowUpStatus(dateValue?: string | null) {
  if (!dateValue) return null

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

function getFollowUpLabel(status: string | null) {
  if (status === 'overdue') return 'Overdue'
  if (status === 'today') return 'Due today'
  if (status === 'upcoming') return 'Upcoming'
  return 'No follow-up'
}

function getFollowUpClass(status: string | null) {
  if (status === 'overdue') return 'border-red-200 bg-red-50 text-red-700'
  if (status === 'today') return 'border-yellow-200 bg-yellow-50 text-yellow-800'
  if (status === 'upcoming') return 'border-gray-200 bg-gray-50 text-gray-700'
  return 'border-gray-200 bg-white text-gray-500'
}

export default async function PipelinePage() {
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

  const valuationLeadFilter: any =
    !isSuperAdmin && agencyId
      ? {
          assignedAgency: {
            equals: agencyId,
          },
        }
      : {}

  const leads = await payload.find({
    collection: 'valuation-leads',
    depth: 1,
    limit: 200,
    sort: '-createdAt',
    where: valuationLeadFilter,
    overrideAccess: true,
  })

  return (
    <main className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Agency CRM</p>

          <h1 className="mt-2 text-5xl font-medium tracking-tight">Lead Pipeline</h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Track valuation leads from first enquiry through to won instructions.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {statuses.map((status) => {
          const statusLeads = leads.docs.filter((lead: any) => lead.status === status.value)

          return (
            <section key={status.value} className={`border ${status.className}`}>
              <div className="border-b bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-medium">{status.label}</h2>

                  <span className={`rounded-full px-3 py-1 text-xs ${status.badgeClassName}`}>
                    {statusLeads.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 p-3">
                {statusLeads.map((lead: any) => {
                  const followUpStatus = getFollowUpStatus(lead.nextFollowUpAt)

                  return (
                    <Link
                      key={lead.id}
                      href={`/admin/collections/valuation-leads/${lead.id}`}
                      className="block border bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{lead.name}</p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {lead.postcode || 'No postcode'}
                          </p>
                        </div>

                        <span className="text-xl text-gray-300">→</span>
                      </div>

                      <p className="mt-4 text-lg font-medium">{formatMoney(lead.estimatedValue)}</p>

                      <div
                        className={`mt-4 border px-3 py-2 text-xs ${getFollowUpClass(
                          followUpStatus,
                        )}`}
                      >
                        <p className="uppercase tracking-[0.2em]">
                          {getFollowUpLabel(followUpStatus)}
                        </p>

                        {lead.nextFollowUpAt && (
                          <p className="mt-1 normal-case tracking-normal">
                            {new Date(lead.nextFollowUpAt).toLocaleString('en-GB')}
                          </p>
                        )}

                        {lead.nextFollowUpTask && (
                          <p className="mt-1 normal-case tracking-normal">
                            {lead.nextFollowUpTask}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="border px-2 py-1 text-xs text-muted-foreground">
                          {lead.source || 'website'}
                        </span>

                        {lead.phone && (
                          <span className="border px-2 py-1 text-xs text-muted-foreground">
                            Phone
                          </span>
                        )}

                        {lead.notes && (
                          <span className="border px-2 py-1 text-xs text-muted-foreground">
                            Notes
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}

                {statusLeads.length === 0 && (
                  <div className="border border-dashed bg-white p-4 text-sm text-muted-foreground">
                    No leads.
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
