import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardEnquiryCard } from '@/components/DashboardV2/Cards/DashboardEnquiryCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardEnquiries, getDashboardStats } from '@/lib/dashboard'

function createPageHref({ query, status, page }: { query: string; status: string; page: number }) {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (status) params.set('status', status)
  if (page > 1) params.set('page', String(page))

  const search = params.toString()

  return search ? `/dashboard-v2/enquiries?${search}` : '/dashboard-v2/enquiries'
}

export default async function DashboardV2EnquiriesPage({
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

  if (!user) {
    redirect('/login')
  }

  if (user.collection !== 'users') {
    redirect('/login')
  }

  const parsedPage = Number.parseInt(pageValue, 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const [enquiries, stats] = await Promise.all([
    getDashboardEnquiries({
      payload,
      user: user as any,
      limit: 20,
      page,
      query: q.trim(),
      status,
    }),

    getDashboardStats({
      payload,
      user: user as any,
    }),
  ])

  return (
    <DashboardLayout
      navigationCounts={{
        properties: stats.totalProperties,
        agents: stats.totalAgents,
        leads: stats.newLeads,
        enquiries: stats.newEnquiries,
      }}
    >
      <DashboardHeader
        eyebrow="Buyer Pipeline"
        title="Enquiries"
        description={`${enquiries.totalDocs} ${
          enquiries.totalDocs === 1 ? 'enquiry' : 'enquiries'
        } found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard-v2',
            variant: 'secondary',
          },
          {
            label: 'Pipeline',
            href: '/dashboard/enquiries/pipeline',
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
            placeholder="Search name, email or phone..."
            className="min-h-11 flex-1 border border-black/10 px-4 text-sm outline-none focus:border-black"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>

          <button
            type="submit"
            className="min-h-11 bg-black px-6 text-sm uppercase tracking-[0.16em] text-white"
          >
            Search
          </button>

          {(q || status) && (
            <a
              href="/dashboard-v2/enquiries"
              className="inline-flex min-h-11 items-center justify-center border border-black/10 px-5 text-sm uppercase tracking-[0.16em]"
            >
              Clear
            </a>
          )}
        </form>

        <DashboardCollection
          empty={enquiries.docs.length === 0}
          emptyTitle="No enquiries found"
          emptyDescription={
            q || status
              ? 'Try changing your search terms or status filter.'
              : 'Buyer enquiries will appear here when visitors contact an agency about a property.'
          }
          showPagination={false}
        >
          {enquiries.docs.map((enquiry) => (
            <DashboardEnquiryCard
              key={enquiry.id}
              id={enquiry.id}
              name={enquiry.name}
              email={enquiry.email}
              phone={enquiry.phone}
              message={enquiry.message}
              status={enquiry.status}
              createdAt={enquiry.createdAt}
              property={enquiry.property}
            />
          ))}
        </DashboardCollection>

        {enquiries.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <p className="text-sm text-black/50">
              Page {enquiries.page} of {enquiries.totalPages}
            </p>

            <div className="flex gap-2">
              {enquiries.hasPrevPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: enquiries.page - 1,
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

              {enquiries.hasNextPage ? (
                <a
                  href={createPageHref({
                    query: q,
                    status,
                    page: enquiries.page + 1,
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
