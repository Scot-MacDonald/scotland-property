import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardEnquiriesPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

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
    limit: 100,
    sort: '-createdAt',
    where: enquiryFilter,
    overrideAccess: true,
  })

  const newCount = enquiries.docs.filter((enquiry: any) => enquiry.status === 'new').length

  const viewingCount = enquiries.docs.filter(
    (enquiry: any) => enquiry.status === 'viewing-booked',
  ).length

  const offerCount = enquiries.docs.filter((enquiry: any) => enquiry.status === 'offer-made').length

  const saleCount = enquiries.docs.filter((enquiry: any) => enquiry.status === 'sale-agreed').length

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Buyer CRM</p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">Enquiries</h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage and track all buyer enquiries for your agency.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="border px-4 py-2 text-sm">
              Back
            </Link>

            <Link
              href="/dashboard/enquiries/pipeline"
              className="bg-black px-4 py-2 text-sm text-white"
            >
              Pipeline View
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-5">
          <StatCard title="Total" value={enquiries.totalDocs} />
          <StatCard title="New" value={newCount} />
          <StatCard title="Viewings" value={viewingCount} />
          <StatCard title="Offers" value={offerCount} />
          <StatCard title="Agreed" value={saleCount} />
        </section>

        <section className="mt-12 overflow-hidden border bg-white">
          <div className="grid gap-4 border-b bg-neutral-50 p-5 text-sm uppercase tracking-[0.2em] text-muted-foreground md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_auto]">
            <p>Buyer</p>
            <p>Property</p>
            <p>Status</p>
            <p>Phone</p>
            <p>Date</p>
            <p className="text-right">Actions</p>
          </div>

          <div className="divide-y">
            {enquiries.docs.map((enquiry: any) => (
              <div
                key={enquiry.id}
                className="grid gap-4 p-5 hover:bg-neutral-50 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-medium">{enquiry.name}</p>

                  <p className="mt-1 text-sm text-muted-foreground">{enquiry.email}</p>
                </div>

                <div>
                  <p className="font-medium">
                    {typeof enquiry.property === 'object'
                      ? enquiry.property?.title
                      : 'Unknown property'}
                  </p>
                </div>

                <p className="capitalize">{enquiry.status?.replaceAll('-', ' ')}</p>

                <p>{enquiry.phone || '-'}</p>

                <p className="text-sm text-muted-foreground">
                  {new Date(enquiry.createdAt).toLocaleDateString('en-GB')}
                </p>

                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/enquiries/${enquiry.id}`}
                    className="border px-3 py-2 text-sm"
                  >
                    open
                  </Link>
                </div>
              </div>
            ))}

            {enquiries.docs.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">No enquiries found.</div>
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
