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
  },
  {
    label: 'Contacted',
    value: 'contacted',
    className: 'border-blue-200 bg-blue-50',
  },
  {
    label: 'Viewing Booked',
    value: 'viewing-booked',
    className: 'border-orange-200 bg-orange-50',
  },
  {
    label: 'Offer Made',
    value: 'offer-made',
    className: 'border-purple-200 bg-purple-50',
  },
  {
    label: 'Sale Agreed',
    value: 'sale-agreed',
    className: 'border-green-200 bg-green-50',
  },
  {
    label: 'Completed',
    value: 'completed',
    className: 'border-emerald-200 bg-emerald-50',
  },
  {
    label: 'Lost',
    value: 'lost',
    className: 'border-red-200 bg-red-50',
  },
]

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
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Buyer CRM</p>

          <h1 className="mt-2 text-5xl font-medium">Enquiry Pipeline</h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Manage buyer enquiries through your sales pipeline.
          </p>
        </div>

        <Link href="/dashboard" className="border px-4 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[1800px] gap-4 xl:grid-cols-7">
          {statuses.map((status) => {
            const statusEnquiries = enquiries.docs.filter(
              (enquiry: any) => enquiry.status === status.value,
            )

            return (
              <section key={status.value} className={`border ${status.className}`}>
                <div className="border-b bg-white p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium">{status.label}</h2>

                    <span className="rounded-full border px-3 py-1 text-xs">
                      {statusEnquiries.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  {statusEnquiries.map((enquiry: any) => {
                    const property = typeof enquiry.property === 'object' ? enquiry.property : null

                    return (
                      <Link
                        key={enquiry.id}
                        href="/admin/collections/enquiries"
                        className="block border bg-white p-4 transition-colors hover:bg-gray-50"
                      >
                        <p className="font-medium">{enquiry.name}</p>

                        <p className="mt-1 text-sm text-muted-foreground">{enquiry.email}</p>

                        {property && (
                          <>
                            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Property
                            </p>

                            <p className="mt-1 text-sm">{property.title}</p>
                          </>
                        )}

                        {enquiry.phone && (
                          <p className="mt-4 text-sm text-muted-foreground">{enquiry.phone}</p>
                        )}

                        {enquiry.notes && (
                          <div className="mt-4 border-t pt-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Notes
                            </p>

                            <p className="mt-1 text-sm line-clamp-3">{enquiry.notes}</p>
                          </div>
                        )}
                      </Link>
                    )
                  })}

                  {statusEnquiries.length === 0 && (
                    <div className="border border-dashed bg-white p-4 text-sm text-muted-foreground">
                      No enquiries.
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
