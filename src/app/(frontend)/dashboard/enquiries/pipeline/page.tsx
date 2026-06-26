import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { EnquiryPipelineBoard } from '@/components/EnquiryPipelineBoard'

export default async function EnquiryPipelinePage() {
  const payload = await getPayload({ config: configPromise })
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

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'

  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const enquiryFilter =
    !isSuperAdmin && agencyId
      ? {
          agency: {
            equals: agencyId,
          },
        }
      : {}

  const enquiries = await payload.find({
    collection: 'enquiries',
    depth: 2,
    limit: 500,
    sort: '-createdAt',
    where: enquiryFilter,
    overrideAccess: true,
  })

  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Buyer CRM</p>

          <h1 className="mt-2 text-5xl font-medium">Enquiry Pipeline</h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Drag buyer enquiries between columns to update their sales status.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <EnquiryPipelineBoard initialEnquiries={enquiries.docs as any[]} />
    </main>
  )
}
