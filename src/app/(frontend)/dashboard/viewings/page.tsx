import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardViewingCard } from '@/components/DashboardV2/Cards/DashboardViewingCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
import { getDashboardViewings } from '@/lib/dashboard/getDashboardViewings'

function formatViewingDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatViewingTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function createPageHref({ query, status, page }: { query: string; status: string; page: number }) {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (status) params.set('status', status)
  if (page > 1) params.set('page', String(page))

  const search = params.toString()

  return search ? `/dashboard/viewings?${search}` : '/dashboard/viewings'
}

export default async function DashboardViewingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
  }>
}) {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()
  const { q = '', status = '', page: pageValue = '1' } = await searchParams

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any
  const parsedPage = Number.parseInt(pageValue, 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const [dashboard, viewings] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardViewings({
      payload,
      user: dashboardUser,
      limit: 12,
      page,
      query: q.trim(),
      status,
    }),
  ])

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Appointments"
        title="Viewings"
        description={`${viewings.totalDocs} ${
          viewings.totalDocs === 1 ? 'viewing' : 'viewings'
        } found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard',
            variant: 'secondary',
          },
          {
            label: 'Book Viewing',
            href: '/dashboard/viewings/new',
            variant: 'primary',
          },
        ]}
      />

      <DashboardWorkspace>
        <form
          method="GET"
          className="mb-8 flex flex-col gap-3 border border-black/10 bg-white p-4 lg:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by contact name, email or phone..."
            className="min-h-11 flex-1 border border-black/10 px-4 text-sm outline-none focus:border-black"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All statuses</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>

          <button
            type="submit"
            className="min-h-11 bg-black px-6 text-sm uppercase tracking-[0.16em] text-white"
          >
            Search
          </button>

          {(q || status) && (
            <a
              href="/dashboard/viewings"
              className="inline-flex min-h-11 items-center justify-center border border-black/10 px-5 text-sm uppercase tracking-[0.16em]"
            >
              Clear
            </a>
          )}
        </form>

        <DashboardCollection
          empty={viewings.docs.length === 0}
          emptyTitle="No viewings found"
          emptyDescription={
            q || status
              ? 'Try changing your search terms or status filter.'
              : 'Book your first property viewing to begin managing appointments.'
          }
          showPagination={false}
        >
          <div className="space-y-4">
            {viewings.docs.map((viewing) => (
              <DashboardViewingCard
                key={viewing.id}
                date={formatViewingDate(viewing.dateTime)}
                time={formatViewingTime(viewing.dateTime)}
                duration={`${viewing.durationMinutes} min`}
                status={viewing.status}
                property={viewing.propertyTitle}
                contactName={viewing.contactName}
                contactEmail={viewing.contactEmail}
                contactPhone={viewing.contactPhone}
                agent={viewing.agentName}
                href={`/dashboard/viewings/${viewing.id}`}
                propertyHref={
                  viewing.propertyId ? `/dashboard/properties/${viewing.propertyId}` : null
                }
              />
            ))}
          </div>
        </DashboardCollection>

        {viewings.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <p className="text-sm text-black/50">
              Page {viewings.page} of {viewings.totalPages}
            </p>

            <div className="flex gap-2">
              {viewings.hasPrevPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: viewings.page - 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Previous
                </a>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">
                  Previous
                </span>
              )}

              {viewings.hasNextPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: viewings.page + 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Next
                </a>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">Next</span>
              )}
            </div>
          </nav>
        )}
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
