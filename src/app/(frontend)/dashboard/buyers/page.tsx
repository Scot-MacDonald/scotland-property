import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { DashboardEmptyState } from '@/components/DashboardV2/Shared/DashboardEmptyState'
import { DashboardPanel } from '@/components/DashboardV2/Shared/DashboardPanel'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'

function getRelationshipId(
  value:
    | string
    | number
    | {
        id?: string | number | null
      }
    | null
    | undefined,
) {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return value.id ? String(value.id) : null
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default async function DashboardBuyersPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any
  const isSuperAdmin = dashboardUser.role === 'super-admin'
  const agencyId = getRelationshipId(dashboardUser.agency)

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  const [dashboard, buyersResult] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    payload.find({
      collection: 'buyers',
      depth: 1,
      limit: 100,
      sort: '-lastActiveAt',
      overrideAccess: true,
      where: isSuperAdmin
        ? undefined
        : {
            agency: {
              equals: agencyId,
            },
          },
    }),
  ])

  const buyers = buyersResult.docs

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="CRM"
        title="Buyers"
        description={`${buyersResult.totalDocs} ${
          buyersResult.totalDocs === 1 ? 'buyer' : 'buyers'
        } found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <DashboardPanel>
          {buyers.length > 0 ? (
            <div>
              <div className="hidden border-b border-neutral-200 px-5 py-3 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_repeat(3,90px)_120px] md:gap-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Buyer
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Last active
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Saved
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Enquiries
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Searches
                </p>

                <p className="text-right text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Alerts
                </p>
              </div>

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
                      className="group block px-5 py-5 transition-colors hover:bg-neutral-50"
                    >
                      <div className="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_repeat(3,90px)_120px] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-950 transition-colors group-hover:text-black">
                            {buyer.name || 'Unnamed buyer'}
                          </p>

                          <p className="mt-1 truncate text-sm text-neutral-500">{buyer.email}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 md:hidden">
                            Last active
                          </p>

                          <p className="mt-1 text-sm text-neutral-700 md:mt-0">
                            {formatDate(buyer.lastActiveAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 md:hidden">
                            Saved properties
                          </p>

                          <p className="mt-1 text-sm font-medium text-neutral-900 md:mt-0">
                            {savedPropertiesCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 md:hidden">
                            Enquiries
                          </p>

                          <p className="mt-1 text-sm font-medium text-neutral-900 md:mt-0">
                            {enquiriesCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 md:hidden">
                            Saved searches
                          </p>

                          <p className="mt-1 text-sm font-medium text-neutral-900 md:mt-0">
                            {savedSearchesCount}
                          </p>
                        </div>

                        <div className="md:text-right">
                          <span
                            className={[
                              'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em]',
                              buyer.alertsEnabled
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-neutral-300 bg-neutral-100 text-neutral-600',
                            ].join(' ')}
                          >
                            {buyer.alertsEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <DashboardEmptyState
              title="No buyers found"
              description="Buyers assigned to this agency will appear here."
            />
          )}
        </DashboardPanel>
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
