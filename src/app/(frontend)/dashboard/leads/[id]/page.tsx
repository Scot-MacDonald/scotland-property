import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import LeadStatusForm from '@/components/LeadStatusForm'
import { ValuationLeadStatusSelect } from '@/components/ValuationLeadStatusSelect'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function DashboardLeadDetailPage({ params }: Props) {
  const { id } = await params

  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const lead = await payload.findByID({
    collection: 'valuation-leads',
    id,
    depth: 2,
    overrideAccess: true,
  })

  if (!lead) return notFound()

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const leadAgencyId =
    typeof lead.assignedAgency === 'object' ? lead.assignedAgency?.id : lead.assignedAgency

  if (!isSuperAdmin && agencyId !== leadAgencyId) {
    redirect('/dashboard/leads')
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard/leads" className="text-sm text-muted-foreground">
              ← Back to leads
            </Link>

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Seller Lead
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">
              {lead.name || 'Unnamed lead'}
            </h1>

            <p className="mt-4 text-muted-foreground">
              Review seller valuation details and update the lead status.
            </p>
          </div>

          <div className="w-56">
            <ValuationLeadStatusSelect leadId={lead.id} currentStatus={lead.status || 'new'} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div className="border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Message</p>

              <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed">
                {lead.message || 'No message provided.'}
              </p>
            </div>

            <div className="border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Property Details
              </p>

              <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Postcode</dt>
                  <dd className="mt-1 font-medium">{lead.postcode || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Property type</dt>
                  <dd className="mt-1 font-medium">{lead.propertyType || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Estimated value</dt>
                  <dd className="mt-1 font-medium">
                    {lead.estimatedValue
                      ? new Intl.NumberFormat('en-GB', {
                          style: 'currency',
                          currency: 'GBP',
                          maximumFractionDigits: 0,
                        }).format(lead.estimatedValue)
                      : '-'}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="mt-1 font-medium">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contact</p>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium">{lead.name || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 break-all font-medium">{lead.email || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-1 font-medium">{lead.phone || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium">{lead.status || 'new'}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
