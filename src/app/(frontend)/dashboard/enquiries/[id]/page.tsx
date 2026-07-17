import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { EnquiryOverviewForm, EnquiryNotesForm } from '@/components/DashboardV2/Enquiries'
import {
  formatDate,
  formatDateTime,
  formatLabel,
  getRelationshipId,
  getRelationshipLabel,
} from '@/lib/dashboard'

import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  WorkspaceTimeline,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

type EnquiryWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const enquiryTabIds = ['overview', 'notes', 'history'] as const

type EnquiryTabId = (typeof enquiryTabIds)[number]

function isEnquiryTabId(value: string): value is EnquiryTabId {
  return enquiryTabIds.includes(value as EnquiryTabId)
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'new':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'contacted':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'viewing-booked':
      return 'border-violet-200 bg-violet-50 text-violet-700'

    case 'offer-made':
      return 'border-orange-200 bg-orange-50 text-orange-700'

    case 'sale-agreed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'completed':
      return 'border-green-300 bg-green-100 text-green-800'

    case 'lost':
      return 'border-neutral-300 bg-neutral-100 text-neutral-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

export default async function EnquiryWorkspacePage({
  params,
  searchParams,
}: EnquiryWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: EnquiryTabId = isEnquiryTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/enquiries/${id}`,
    },
    {
      id: 'notes',
      label: 'Notes',
      href: `/dashboard/enquiries/${id}?tab=notes`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/enquiries/${id}?tab=history`,
    },
  ]

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

  const agencyId = getRelationshipId(user.agency)
  const isSuperAdmin = user.role === 'super-admin'

  if (!isSuperAdmin && !agencyId) {
    redirect('/dashboard')
  }

  let enquiry

  try {
    enquiry = await payload.findByID({
      collection: 'enquiries',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!enquiry) {
    notFound()
  }

  const enquiryAgencyId = getRelationshipId(enquiry.agency)

  if (!isSuperAdmin && enquiryAgencyId !== agencyId) {
    notFound()
  }

  const property =
    typeof enquiry.property === 'object' && enquiry.property !== null ? enquiry.property : null

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/enquiries"
          backLabel="Enquiries"
          eyebrow="Buyer enquiry"
          title={enquiry.name || 'Unnamed enquiry'}
          status={
            <span
              className={[
                'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                getStatusClasses(enquiry.status),
              ].join(' ')}
            >
              {formatLabel(enquiry.status)}
            </span>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Enquiry details">
          <WorkspaceSidebarItem label="Status" value={formatLabel(enquiry.status)} />

          <WorkspaceSidebarItem label="Property" value={getRelationshipLabel(enquiry.property)} />

          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(enquiry.agency)} />

          <WorkspaceSidebarItem label="Created" value={formatDate(enquiry.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(enquiry.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          <EnquiryOverviewForm
            enquiry={{
              id: String(enquiry.id),
              name: enquiry.name,
              email: enquiry.email,
              phone: enquiry.phone,
              message: enquiry.message,
              status: enquiry.status,
            }}
          />

          <WorkspacePanel title="Property" description="The property connected to this enquiry.">
            {property ? (
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-lg font-medium text-neutral-950">{property.title}</p>

                  {property.reference ? (
                    <p className="mt-1 text-sm text-neutral-500">Reference: {property.reference}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Open workspace
                  </Link>

                  {property.slug ? (
                    <a
                      href={`/property/${property.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center border border-neutral-950 bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      View listing
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No property is connected to this enquiry.</p>
            )}
          </WorkspacePanel>
        </div>
      ) : null}

      {activeTab === 'notes' ? (
        <EnquiryNotesForm
          enquiry={{
            id: String(enquiry.id),
            notes: enquiry.notes,
          }}
        />
      ) : null}

      {activeTab === 'history' ? (
        <WorkspacePanel title="History" description="Recent activity for this enquiry.">
          <WorkspaceTimeline
            items={[
              {
                id: 'updated',
                title: 'Enquiry last updated',
                date: enquiry.updatedAt,
                description: 'The enquiry record was changed.',
              },
              {
                id: 'created',
                title: 'Enquiry received',
                date: enquiry.createdAt,
                description: 'The buyer submitted a property enquiry.',
              },
            ]}
          />
        </WorkspacePanel>
      ) : null}
    </WorkspaceLayout>
  )
}
