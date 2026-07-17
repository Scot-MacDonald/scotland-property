import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardEmptyState } from '@/components/DashboardV2/Shared/DashboardEmptyState'
import { DashboardPanel } from '@/components/DashboardV2/Shared/DashboardPanel'
function getRelationshipId(
  value:
    | string
    | number
    | {
        id?: string | number
      }
    | null
    | undefined,
) {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return value.id ? String(value.id) : null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function DashboardBuyersPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getRelationshipId(user.agency)

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  const buyersResult = await payload.find({
    collection: 'buyers',
    depth: 1,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
    where: isSuperAdmin
      ? undefined
      : {
          agency: {
            equals: agencyId,
          },
        },
  })

  const buyers = buyersResult.docs

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">CRM</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">Buyers</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            View buyer activity, saved properties, enquiries and saved searches.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          {buyersResult.totalDocs} {buyersResult.totalDocs === 1 ? 'buyer' : 'buyers'}
        </p>
      </div>

      <DashboardPanel>
        {buyers.length > 0 ? (
          <div className="divide-y divide-neutral-200">
            {buyers.map((buyer) => {
              const savedPropertiesCount = Array.isArray(buyer.savedProperties)
                ? buyer.savedProperties.length
                : 0

              const savedSearchesCount = Array.isArray(buyer.savedSearches)
                ? buyer.savedSearches.length
                : 0

              const enquiriesCount = Array.isArray(buyer.propertyEnquiries)
                ? buyer.propertyEnquiries.length
                : 0

              return (
                <Link
                  key={buyer.id}
                  href={`/dashboard/buyers/${buyer.id}`}
                  className="grid gap-5 px-5 py-5 transition hover:bg-neutral-50 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,1fr)_repeat(3,110px)_130px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-950">
                      {buyer.name || 'Unnamed buyer'}
                    </p>

                    <p className="mt-1 truncate text-sm text-neutral-500">{buyer.email}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Last active</p>

                    <p className="mt-1 text-sm text-neutral-700">
                      {formatDate(buyer.lastActiveAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Saved</p>

                    <p className="mt-1 text-sm font-medium text-neutral-900">
                      {savedPropertiesCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Enquiries</p>

                    <p className="mt-1 text-sm font-medium text-neutral-900">{enquiriesCount}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Searches</p>

                    <p className="mt-1 text-sm font-medium text-neutral-900">
                      {savedSearchesCount}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <span
                      className={[
                        'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                        buyer.alertsEnabled
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-neutral-300 bg-neutral-100 text-neutral-600',
                      ].join(' ')}
                    >
                      {buyer.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <DashboardEmptyState
            title="No buyers found"
            description="Buyers assigned to this agency will appear here."
          />
        )}
      </DashboardPanel>
    </div>
  )
}
