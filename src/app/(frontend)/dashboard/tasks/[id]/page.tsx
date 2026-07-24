import { notFound } from 'next/navigation'
import { TaskChecklistForm, TaskHistoryTab, TaskNotesForm } from '@/components/DashboardV2/Tasks'
import { TaskOverviewForm } from '@/components/DashboardV2/Tasks/TaskOverviewForm'

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

  const agents = await payload.find({
    collection: 'agents',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    where: isSuperAdmin
      ? undefined
      : {
          agency: {
            equals: agencyId,
          },
        },
  })

  const agentOptions = agents.docs.map((agent) => ({
    id: String(agent.id),
    name: agent.name,
  }))

  const relatedRecord = getRelatedRecord(task)

  const checklist = task.checklist || []

  const completedChecklistItems = checklist.filter((item) => item.completed).length

  let content

  switch (activeTab) {
    case 'checklist':
      content = (
        <TaskChecklistForm
          taskId={String(task.id)}
          checklist={checklist.map((item) => ({
            id: item.id,
            label: item.label,
            completed: item.completed,
          }))}
        />
      )
      break

    case 'notes':
      content = <TaskNotesForm taskId={String(task.id)} internalNotes={task.internalNotes} />
      break
    case 'history':
      content = <TaskHistoryTab taskId={String(task.id)} />
      break

    case 'overview':
    default:
      content = (
        <TaskOverviewForm
          task={{
            id: String(task.id),
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueAt: task.dueAt,
            reminderAt: task.reminderAt,
            assignedAgentId: task.assignedAgent
              ? String(getRelationshipId(task.assignedAgent))
              : null,
          }}
          agents={agentOptions}
        />
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

          {relatedRecord ? (
            <>
              <WorkspaceSidebarItem label="Related record" value={relatedRecord.type} />

              <WorkspaceSidebarItem label="Record name" value={relatedRecord.label} />
            </>
          ) : null}

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
