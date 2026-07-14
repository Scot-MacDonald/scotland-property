import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { LeadOverviewForm } from '@/components/DashboardV2/Leads'
import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'

type LeadWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const leadTabIds = ['overview', 'follow-up', 'notes', 'attachments', 'history'] as const

type LeadTabId = (typeof leadTabIds)[number]

function isLeadTabId(value: string): value is LeadTabId {
  return leadTabIds.includes(value as LeadTabId)
}

function getRelationshipId(
  relationship:
    | string
    | number
    | {
        id?: string | number
      }
    | null
    | undefined,
) {
  if (!relationship) return null

  if (typeof relationship === 'string' || typeof relationship === 'number') {
    return String(relationship)
  }

  return relationship.id ? String(relationship.id) : null
}

function getRelationshipLabel(
  relationship:
    | string
    | number
    | {
        id?: string | number
        name?: string | null
        title?: string | null
      }
    | null
    | undefined,
) {
  if (!relationship) return '—'

  if (typeof relationship === 'string' || typeof relationship === 'number') {
    return String(relationship)
  }

  return relationship.name || relationship.title || '—'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatMoney(value: number | null | undefined) {
  if (!value) return '—'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLabel(value: string | null | undefined) {
  if (!value) return '—'

  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'new':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'contacted':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'valuation-booked':
      return 'border-violet-200 bg-violet-50 text-violet-700'

    case 'instruction-won':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'lost':
      return 'border-neutral-300 bg-neutral-100 text-neutral-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

export default async function LeadWorkspacePage({ params, searchParams }: LeadWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: LeadTabId = isLeadTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/leads/${id}`,
    },
    {
      id: 'follow-up',
      label: 'Follow Up',
      href: `/dashboard/leads/${id}?tab=follow-up`,
    },
    {
      id: 'notes',
      label: 'Notes',
      href: `/dashboard/leads/${id}?tab=notes`,
    },
    {
      id: 'attachments',
      label: 'Attachments',
      href: `/dashboard/leads/${id}?tab=attachments`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/leads/${id}?tab=history`,
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

  let lead

  try {
    lead = await payload.findByID({
      collection: 'valuation-leads',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!lead) {
    notFound()
  }

  const leadAgencyId = getRelationshipId(lead.assignedAgency)

  if (!isSuperAdmin && agencyId !== leadAgencyId) {
    notFound()
  }

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/leads"
          backLabel="Leads"
          eyebrow="Seller lead"
          title={lead.name || 'Unnamed lead'}
          status={
            <span
              className={[
                'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                getStatusClasses(lead.status),
              ].join(' ')}
            >
              {formatLabel(lead.status)}
            </span>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Lead details">
          <WorkspaceSidebarItem label="Status" value={formatLabel(lead.status)} />

          <WorkspaceSidebarItem
            label="Assigned agency"
            value={getRelationshipLabel(lead.assignedAgency)}
          />

          <WorkspaceSidebarItem label="Source" value={formatLabel(lead.source)} />

          <WorkspaceSidebarItem
            label="Next follow-up"
            value={formatDateTime(lead.nextFollowUpAt)}
          />

          <WorkspaceSidebarItem
            label="Follow-up completed"
            value={lead.followUpCompleted ? 'Yes' : 'No'}
          />

          <WorkspaceSidebarItem label="Created" value={formatDate(lead.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(lead.updatedAt)} />
        </WorkspaceSidebar>
      }
    >
      {activeTab === 'overview' ? (
        <LeadOverviewForm
          lead={{
            id: String(lead.id),
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            postcode: lead.postcode,
            propertyType: lead.propertyType,
            estimatedValue: lead.estimatedValue,
            status: lead.status,
            message: lead.message,
          }}
        />
      ) : null}

      {activeTab === 'follow-up' ? (
        <WorkspacePanel
          title="Follow Up"
          description="Manage the next action and follow-up date for this lead."
        >
          <dl className="grid gap-6 text-sm md:grid-cols-2">
            <div>
              <dt className="text-neutral-500">Next follow-up</dt>
              <dd className="mt-1 font-medium text-neutral-950">
                {formatDateTime(lead.nextFollowUpAt)}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Completed</dt>
              <dd className="mt-1 font-medium text-neutral-950">
                {lead.followUpCompleted ? 'Yes' : 'No'}
              </dd>
            </div>

            <div className="md:col-span-2">
              <dt className="text-neutral-500">Next task</dt>
              <dd className="mt-1 font-medium text-neutral-950">{lead.nextFollowUpTask || '—'}</dd>
            </div>
          </dl>
        </WorkspacePanel>
      ) : null}

      {activeTab === 'notes' ? (
        <WorkspacePanel title="Internal notes" description="Private notes for agency staff.">
          <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">
            {lead.notes || 'No internal notes have been added.'}
          </p>
        </WorkspacePanel>
      ) : null}

      {activeTab === 'attachments' ? (
        <WorkspacePanel
          title="Attachments"
          description="Documents and files connected to this lead."
        >
          <p className="text-sm leading-7 text-neutral-600">
            Lead attachments will be added here next.
          </p>
        </WorkspacePanel>
      ) : null}

      {activeTab === 'history' ? (
        <WorkspacePanel title="History" description="Recent activity for this lead.">
          <div className="space-y-5">
            <div className="border-l-2 border-neutral-950 pl-4">
              <p className="text-sm font-medium text-neutral-950">Lead last updated</p>

              <p className="mt-1 text-sm text-neutral-500">{formatDateTime(lead.updatedAt)}</p>
            </div>

            <div className="border-l-2 border-neutral-300 pl-4">
              <p className="text-sm font-medium text-neutral-950">Lead created</p>

              <p className="mt-1 text-sm text-neutral-500">{formatDateTime(lead.createdAt)}</p>
            </div>
          </div>
        </WorkspacePanel>
      ) : null}
    </WorkspaceLayout>
  )
}
