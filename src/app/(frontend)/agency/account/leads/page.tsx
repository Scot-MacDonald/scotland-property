import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'

function formatMoney(value?: number | null) {
  if (!value) return '-'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AgencyLeadsPage() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return (
      <main className="mx-auto max-w-[800px] px-4 py-16">
        <h1 className="text-3xl font-medium">Please log in</h1>

        <Link href="/login" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Login
        </Link>
      </main>
    )
  }

  const leads = await payload.find({
    collection: 'valuation-leads',
    sort: '-createdAt',
    limit: 50,
  })

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Agency Dashboard
          </p>

          <h1 className="mt-2 text-5xl font-medium tracking-tight">Valuation leads</h1>
        </div>

        <Link href="/agency/account" className="border px-5 py-3">
          Back to dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {leads.docs.map((lead) => (
          <div key={lead.id} className="border border-neutral-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-medium">{lead.name}</h2>
                <p className="mt-1 text-muted-foreground">{lead.postcode}</p>
              </div>

              <span className="border px-3 py-1 text-sm uppercase tracking-wide">
                {lead.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {lead.email}
                </p>

                <p>
                  <strong>Phone:</strong> {lead.phone || '-'}
                </p>

                <p>
                  <strong>Property Type:</strong> {lead.propertyType || '-'}
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Estimated Value:</strong> {formatMoney(lead.estimatedValue)}
                </p>

                <p>
                  <strong>Source:</strong> {lead.source || '-'}
                </p>

                <p>
                  <strong>Created:</strong>{' '}
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '-'}
                </p>
              </div>
            </div>

            {lead.message && (
              <div className="mt-6">
                <p className="font-medium">Message</p>
                <p className="mt-2 text-muted-foreground">{lead.message}</p>
              </div>
            )}

            {lead.notes && (
              <div className="mt-6 border-t pt-6">
                <p className="font-medium">Internal notes</p>
                <p className="mt-2 text-muted-foreground">{lead.notes}</p>
              </div>
            )}
          </div>
        ))}

        {leads.docs.length === 0 && (
          <div className="border p-10 text-center text-muted-foreground">
            No valuation leads yet.
          </div>
        )}
      </div>
    </main>
  )
}
