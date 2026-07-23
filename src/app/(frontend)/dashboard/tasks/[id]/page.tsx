import { notFound } from 'next/navigation'

import {
  WorkspaceHeader,
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceSidebar,
  WorkspaceSidebarItem,
  WorkspaceTabs,
  type WorkspaceTab,
} from '@/components/DashboardV2/Workspace'
import {
  assertWorkspaceOwnership,
  formatDate,
  formatDateTime,
  formatLabel,
  getRelationshipId,
  getRelationshipLabel,
  getWorkspaceContext,
} from '@/lib/dashboard'

type TaskWorkspacePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

const taskTabIds = ['overview', 'checklist', 'notes', 'history'] as const

type TaskTabId = (typeof taskTabIds)[number]

function isTaskTabId(value: string): value is TaskTabId {
  return taskTabIds.includes(value as TaskTabId)
}

function getStatusClasses(status: string | null | undefined) {
  switch (status) {
    case 'todo':
      return 'border-neutral-300 bg-white text-neutral-700'

    case 'in-progress':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'waiting':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'cancelled':
      return 'border-neutral-300 bg-neutral-100 text-neutral-500'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function getPriorityClasses(priority: string | null | undefined) {
  switch (priority) {
    case 'urgent':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'high':
      return 'border-orange-200 bg-orange-50 text-orange-700'

    case 'normal':
      return 'border-neutral-300 bg-neutral-100 text-neutral-700'

    case 'low':
      return 'border-neutral-200 bg-white text-neutral-500'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

type TaskRelationship =
  | string
  | number
  | {
      id?: string | number
      name?: string | null
      title?: string | null
      email?: string | null
    }
  | null
  | undefined

function getRelatedRecord(task: {
  property?: TaskRelationship
  lead?: TaskRelationship
  enquiry?: TaskRelationship
  viewing?: TaskRelationship
  buyer?: TaskRelationship
}) {
  if (getRelationshipId(task.property)) {
    return {
      type: 'Property',
      label: getRelationshipLabel(task.property),
    }
  }

  if (getRelationshipId(task.lead)) {
    return {
      type: 'Valuation lead',
      label: getRelationshipLabel(task.lead),
    }
  }

  if (getRelationshipId(task.enquiry)) {
    return {
      type: 'Enquiry',
      label: getRelationshipLabel(task.enquiry),
    }
  }

  if (getRelationshipId(task.viewing)) {
    return {
      type: 'Viewing',
      label: getRelationshipLabel(task.viewing),
    }
  }

  if (getRelationshipId(task.buyer)) {
    return {
      type: 'Buyer',
      label: getRelationshipLabel(task.buyer),
    }
  }

  return null
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="border-b border-neutral-200 py-4 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</dt>

      <dd className="mt-1 text-sm leading-6 text-neutral-900">
        {value === null || value === undefined || value === '' ? '—' : value}
      </dd>
    </div>
  )
}

export default async function TaskWorkspacePage({ params, searchParams }: TaskWorkspacePageProps) {
  const { id } = await params
  const { tab = 'overview' } = await searchParams

  const activeTab: TaskTabId = isTaskTabId(tab) ? tab : 'overview'

  const workspaceTabs: WorkspaceTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: `/dashboard/tasks/${id}`,
    },
    {
      id: 'checklist',
      label: 'Checklist',
      href: `/dashboard/tasks/${id}?tab=checklist`,
    },
    {
      id: 'notes',
      label: 'Notes',
      href: `/dashboard/tasks/${id}?tab=notes`,
    },
    {
      id: 'history',
      label: 'History',
      href: `/dashboard/tasks/${id}?tab=history`,
    },
  ]

  const { payload, agencyId, isSuperAdmin } = await getWorkspaceContext()

  let task

  try {
    task = await payload.findByID({
      collection: 'tasks',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!task) {
    notFound()
  }

  assertWorkspaceOwnership({
    recordAgency: task.agency,
    agencyId,
    isSuperAdmin,
  })

  const relatedRecord = getRelatedRecord(task)

  const checklist = task.checklist || []
  const completedChecklistItems = checklist.filter((item) => item.completed).length

  let content

  switch (activeTab) {
    case 'checklist':
      content = (
        <WorkspacePanel
          title="Checklist"
          description="Track the individual actions required to complete this task."
        >
          {checklist.length > 0 ? (
            <div className="divide-y divide-neutral-200 border border-neutral-200">
              {checklist.map((item, index) => (
                <div
                  key={item.id || `${item.label}-${index}`}
                  className="flex items-start gap-3 px-4 py-4"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-xs font-bold',
                      item.completed
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-neutral-300 bg-white text-transparent',
                    ].join(' ')}
                  >
                    ✓
                  </span>

                  <span
                    className={[
                      'text-sm leading-6',
                      item.completed ? 'text-neutral-500 line-through' : 'text-neutral-900',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-neutral-300 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">No checklist items</p>

              <p className="mt-1 text-sm text-neutral-500">
                Checklist editing will be added in the next step.
              </p>
            </div>
          )}
        </WorkspacePanel>
      )
      break

    case 'notes':
      content = (
        <WorkspacePanel
          title="Internal notes"
          description="Private information visible only to the agency team."
        >
          <div className="min-h-40 whitespace-pre-wrap border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-7 text-neutral-800">
            {task.internalNotes || 'No internal notes have been added.'}
          </div>
        </WorkspacePanel>
      )
      break

    case 'history':
      content = (
        <WorkspacePanel
          title="Task history"
          description="Changes and activity associated with this task."
        >
          <div className="border border-dashed border-neutral-300 px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-900">History timeline coming next</p>

            <p className="mt-1 text-sm text-neutral-500">
              The task already creates activity records. This tab will display them.
            </p>
          </div>
        </WorkspacePanel>
      )
      break

    case 'overview':
    default:
      content = (
        <div className="space-y-6">
          <WorkspacePanel
            title="Task overview"
            description="Core task information, assignment and scheduling."
          >
            <dl>
              <DetailRow label="Title" value={task.title} />

              <DetailRow label="Description" value={task.description} />

              <div className="grid gap-x-8 md:grid-cols-2">
                <DetailRow label="Status" value={formatLabel(task.status)} />

                <DetailRow label="Priority" value={formatLabel(task.priority)} />

                <DetailRow label="Due date" value={formatDateTime(task.dueAt)} />

                <DetailRow label="Reminder" value={formatDateTime(task.reminderAt)} />

                <DetailRow
                  label="Assigned agent"
                  value={getRelationshipLabel(task.assignedAgent)}
                />

                <DetailRow label="Created by" value={getRelationshipLabel(task.createdBy)} />
              </div>
            </dl>
          </WorkspacePanel>

          <WorkspacePanel
            title="Related record"
            description="The CRM record connected to this task."
          >
            {relatedRecord ? (
              <dl className="grid gap-x-8 md:grid-cols-2">
                <DetailRow label="Record type" value={relatedRecord.type} />

                <DetailRow label="Record" value={relatedRecord.label} />
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">
                This task is not connected to another CRM record.
              </p>
            )}
          </WorkspacePanel>
        </div>
      )
      break
  }

  return (
    <WorkspaceLayout
      header={
        <WorkspaceHeader
          backHref="/dashboard/tasks"
          backLabel="Tasks"
          eyebrow="Task"
          title={task.title}
          status={
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                  getStatusClasses(task.status),
                ].join(' ')}
              >
                {formatLabel(task.status)}
              </span>

              <span
                className={[
                  'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                  getPriorityClasses(task.priority),
                ].join(' ')}
              >
                {formatLabel(task.priority)}
              </span>
            </div>
          }
          actions={
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center bg-neutral-950 px-4 text-sm font-semibold text-white opacity-50"
            >
              Save changes
            </button>
          }
        />
      }
      tabs={<WorkspaceTabs tabs={workspaceTabs} activeTab={activeTab} />}
      sidebar={
        <WorkspaceSidebar title="Task details">
          <WorkspaceSidebarItem label="Status" value={formatLabel(task.status)} />

          <WorkspaceSidebarItem label="Priority" value={formatLabel(task.priority)} />

          <WorkspaceSidebarItem
            label="Assigned agent"
            value={getRelationshipLabel(task.assignedAgent)}
          />

          <WorkspaceSidebarItem label="Created by" value={getRelationshipLabel(task.createdBy)} />

          <WorkspaceSidebarItem label="Agency" value={getRelationshipLabel(task.agency)} />

          <WorkspaceSidebarItem label="Due" value={formatDateTime(task.dueAt)} />

          <WorkspaceSidebarItem
            label="Checklist"
            value={`${completedChecklistItems} of ${checklist.length} completed`}
          />

          <WorkspaceSidebarItem label="Created" value={formatDate(task.createdAt)} />

          <WorkspaceSidebarItem label="Last updated" value={formatDate(task.updatedAt)} />

          {task.completedAt ? (
            <WorkspaceSidebarItem label="Completed" value={formatDateTime(task.completedAt)} />
          ) : null}
        </WorkspaceSidebar>
      }
    >
      {content}
    </WorkspaceLayout>
  )
}
