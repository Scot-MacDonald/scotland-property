import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import EnquiryStatusForm from '@/components/EnquiryStatusForm'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function DashboardEnquiryDetailPage({ params }: Props) {
  const { id } = await params

  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/admin/login')
  if (user.collection !== 'users') redirect('/login')

  const enquiry = await payload.findByID({
    collection: 'enquiries',
    id,
    depth: 2,
    overrideAccess: true,
  })

  if (!enquiry) return notFound()

  const userAsAny = user as any
  const isSuperAdmin = userAsAny.role === 'super-admin'
  const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const enquiryAgencyId = typeof enquiry.agency === 'object' ? enquiry.agency?.id : enquiry.agency

  if (!isSuperAdmin && agencyId !== enquiryAgencyId) {
    redirect('/dashboard/enquiries')
  }

  const property = typeof enquiry.property === 'object' ? enquiry.property : null

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard/enquiries" className="text-sm text-muted-foreground">
              ← Back to enquiries
            </Link>

            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Enquiry
            </p>

            <h1 className="mt-2 text-5xl font-medium tracking-tight">
              {enquiry.name || 'Unnamed enquiry'}
            </h1>

            <p className="mt-4 text-muted-foreground">
              Review the enquiry details and update its status.
            </p>
          </div>
          <EnquiryStatusForm enquiryId={enquiry.id} currentStatus={enquiry.status ?? undefined} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-6">
            <div className="border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Message</p>

              <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed">
                {enquiry.message || 'No message provided.'}
              </p>
            </div>

            {property ? (
              <div className="border bg-white p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Property</p>

                <h2 className="mt-4 text-2xl font-medium">{property.title}</h2>

                {property.slug ? (
                  <Link
                    href={`/property/${property.slug}`}
                    className="mt-4 inline-block border px-4 py-2 text-sm"
                  >
                    View public listing
                  </Link>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <div className="border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Contact</p>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium">{enquiry.name || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 break-all font-medium">{enquiry.email || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-1 font-medium">{enquiry.phone || '-'}</dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium">{enquiry.status || 'new'}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
