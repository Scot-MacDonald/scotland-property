import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

function formatMoney(value?: number | null) {
  if (!value) return 'Not provided'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardLeadsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const leadFilter =
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
    limit: 100,
    sort: '-createdAt',
    where: leadFilter,
    overrideAccess: true,
  })

  const newCount = leads.docs.filter((lead: any) => lead.status === 'new').length
  const bookedCount = leads.docs.filter((lead: any) => lead.status === 'valuation-booked').length
  const wonCount = leads.docs.filter((lead: any) => lead.status === 'instruction-won').length
  const lostCount = leads.docs.filter((lead: any) => lead.status === 'lost').length

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Seller CRM</p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Valuation Leads</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage seller valuation requests, follow-ups and instructions.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border px-4 py-2 text-sm">
              Back
            </Link>

            <Link href="/dashboard/pipeline" className="bg-black px-4 py-2 text-sm text-white">
              Pipeline View
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total" value={leads.totalDocs} />
          <StatCard title="New" value={newCount} />
          <StatCard title="Booked" value={bookedCount} />
          <StatCard title="Won" value={wonCount} />
          <StatCard title="Lost" value={lostCount} />
        </section>

        <section className="mt-12 overflow-hidden border bg-white">
          <div className="grid gap-4 border-b bg-neutral-50 p-5 text-sm uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1.2fr_auto]">
            <p>Lead</p>
            <p>Postcode</p>
            <p>Value</p>
            <p>Status</p>
            <p>Follow-up</p>
            <p className="text-right">Actions</p>
          </div>

          <div className="divide-y">
            {leads.docs.map((lead: any) => (
              <div
                key={lead.id}
                className="grid gap-4 p-5 hover:bg-neutral-50 md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1.2fr_auto] md:items-center"
              >
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{lead.email}</p>
                </div>

                <p className="font-medium">{lead.postcode}</p>

                <p>{formatMoney(lead.estimatedValue)}</p>

                <p className="capitalize">{lead.status?.replaceAll('-', ' ')}</p>

                <div>
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
                    <p className="text-muted-foreground">None set</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/collections/valuation-leads/${lead.id}`}
                    className="border px-3 py-2 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {leads.docs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">
                No valuation leads found.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-4 text-5xl font-medium">{value}</p>
    </div>
  )
}
