import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ValuationLeadPipelineBoard } from '@/components/ValuationLeadPipelineBoard'

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
            Drag leads between columns to update their pipeline status.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <ValuationLeadPipelineBoard initialLeads={leads.docs as any[]} />
    </main>
  )
}
