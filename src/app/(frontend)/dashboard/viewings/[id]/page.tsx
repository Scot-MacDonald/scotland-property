import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { Timeline } from '@/components/DashboardV2/Timeline'
import { ViewingFeedbackForm } from '@/components/DashboardV2/Viewings/ViewingFeedbackForm'
import { ViewingNotesForm } from '@/components/DashboardV2/Viewings/ViewingNotesForm'
import { ViewingOverviewForm } from '@/components/DashboardV2/Viewings/ViewingOverviewForm'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

import { ActivityEntityTypes } from '@/lib/activity'
import {
  formatDate,
  formatDateTime,
  formatLabel,
  getRelationshipId,
  getRelationshipLabel,
} from '@/lib/dashboard/workspaceHelpers'

type ViewingWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const viewingTabIds = ['overview', 'notes', 'feedback', 'history'] as const

type ViewingTabId = (typeof viewingTabIds)[number]

function isViewingTabId(value: string): value is ViewingTabId {
  return viewingTabIds.includes(value as ViewingTabId)
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'requested':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'confirmed':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'cancelled':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'

    case 'no-show':
      return 'border-red-200 bg-red-50 text-red-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function getOutcomeLabel(outcome: string | null | undefined) {
  if (!outcome || outcome === 'not-recorded') {
    return 'Not recorded'
  }

  return formatLabel(outcome)
}

function getFollowUpLabel(required: boolean | null | undefined) {
  return required ? 'Required' : 'Not required'
}

export default async function ViewingWorkspacePage({
  params,
  searchParams,
}: ViewingWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: ViewingTabId = isViewingTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/viewings/${id}`,
    },
    {
      id: 'notes',
      label: 'Notes',
      href: `/dashboard/viewings/${id}?tab=notes`,
    },
    {
      id: 'feedback',
      label: 'Feedback',
      href: `/dashboard/viewings/${id}?tab=feedback`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/viewings/${id}?tab=history`,
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

  let viewing

  try {
    viewing = await payload.findByID({
      collection: 'viewings',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!viewing) {
    notFound()
  }

  const viewingAgencyId = getRelationshipId(viewing.agency)

  if (!isSuperAdmin && viewingAgencyId !== agencyId) {
    notFound()
  }

  const agentsResult = await payload.find({
    collection: 'agents',
    depth: 0,
    limit: 200,
    sort: 'name',
    overrideAccess: true,
    where: isSuperAdmin
      ? undefined
      : {
          agency: {
            equals: agencyId,
          },
        },
  })

  const agentOptions = agentsResult.docs.map((agent) => ({
    id: String(agent.id),
    label: agent.name || agent.email || 'Unnamed agent',
  }))

  const propertyId = getRelationshipId(viewing.property)
  const enquiryId = getRelationshipId(viewing.enquiry)
  const buyerId = getRelationshipId(viewing.buyer)

  const propertyLabel = getRelationshipLabel(viewing.property) || 'Property viewing'

  const agentLabel = getRelationshipLabel(viewing.agent) || 'Not assigned'

  const agencyLabel = getRelationshipLabel(viewing.agency) || 'Not assigned'

  const buyerLabel = getRelationshipLabel(viewing.buyer) || 'No buyer record'

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/viewings"
          backLabel="Viewings"
          eyebrow={propertyLabel}
          title={viewing.contactName}
          status={
            <span
              className={[
                'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                getStatusClasses(viewing.status),
              ].join(' ')}
            >
              {formatLabel(viewing.status)}
            </span>
          }
          actions={
            <>
              {viewing.contactPhone ? (
                <a
                  href={`tel:${viewing.contactPhone}`}
                  className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Call contact
                </a>
              ) : null}

              <a
                href={`mailto:${viewing.contactEmail}`}
                className="inline-flex h-10 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Email contact
              </a>

              {propertyId ? (
                <Link
                  href={`/dashboard/properties/${propertyId}`}
                  className="inline-flex h-10 items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Open property
                </Link>
              ) : null}
            </>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Viewing details">
          <WorkspaceSidebarItem label="Status" value={formatLabel(viewing.status)} />

          <WorkspaceSidebarItem label="Appointment" value={formatDateTime(viewing.dateTime)} />

          <WorkspaceSidebarItem
            label="Duration"
            value={`${viewing.durationMinutes || 60} minutes`}
          />

          <WorkspaceSidebarItem label="Property" value={propertyLabel} />

          <WorkspaceSidebarItem label="Assigned agent" value={agentLabel} />

          <WorkspaceSidebarItem label="Contact" value={viewing.contactName} />

          <WorkspaceSidebarItem label="Buyer record" value={buyerLabel} />

          <WorkspaceSidebarItem label="Outcome" value={getOutcomeLabel(viewing.viewingOutcome)} />

          <WorkspaceSidebarItem
            label="Follow-up"
            value={getFollowUpLabel(viewing.followUpRequired)}
          />

          <WorkspaceSidebarItem label="Agency" value={agencyLabel} />

          <WorkspaceSidebarItem label="Created" value={formatDate(viewing.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(viewing.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <ViewingOverviewForm
          viewing={{
            id: String(viewing.id),
            dateTime: viewing.dateTime,
            durationMinutes: viewing.durationMinutes,
            status: viewing.status,
            agentId: getRelationshipId(viewing.agent),
            contactName: viewing.contactName,
            contactEmail: viewing.contactEmail,
            contactPhone: viewing.contactPhone,
          }}
          agents={agentOptions}
        />
      ) : null}

      {activeTab === 'notes' ? (
        <ViewingNotesForm viewingId={String(viewing.id)} internalNotes={viewing.internalNotes} />
      ) : null}

      {activeTab === 'feedback' ? (
        <ViewingFeedbackForm
          viewing={{
            id: String(viewing.id),
            viewerRating: viewing.viewerRating,
            viewingOutcome: viewing.viewingOutcome,
            feedback: viewing.feedback,
            vendorFeedback: viewing.vendorFeedback,
            followUpRequired: viewing.followUpRequired,
            followUpNotes: viewing.followUpNotes,
          }}
        />
      ) : null}

      {activeTab === 'history' ? (
        <section className="border border-neutral-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Activity history
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
            Viewing activity
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Significant changes, status updates and actions associated with this viewing are
            recorded here.
          </p>

          <div className="mt-8">
            <Timeline entityType={ActivityEntityTypes.VIEWING} entityId={String(viewing.id)} />
          </div>
        </section>
      ) : null}
    </WorkspaceLayout>
  )
}
