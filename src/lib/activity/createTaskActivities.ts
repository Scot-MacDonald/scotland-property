import type { Task } from '@/payload-types'

import { ActivityEntityTypes } from './activityEntityTypes'
import { ActivitySeverities } from './activitySeverity'
import { ActivityTypes } from './activityTypes'
import { createActivity } from './createActivity'

type CreateTaskActivitiesArgs = {
  previousTask?: Task | null
  task: Task
  changedFields: string[]
  agencyId: string
  userId: string
  operation: 'create' | 'update'
}

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String(value.id)
  }

  return String(value)
}

function formatValue(value: string | null | undefined): string {
  if (!value) return 'Not set'

  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not set'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export async function createTaskActivities({
  previousTask,
  task,
  changedFields,
  agencyId,
  userId,
  operation,
}: CreateTaskActivitiesArgs): Promise<void> {
  const create = (
    type: (typeof ActivityTypes)[keyof typeof ActivityTypes],
    title: string,
    description: string,
    metadata: Record<string, unknown> = {},
    severity: 'info' | 'success' | 'warning' | 'error' = ActivitySeverities.INFO,
  ) =>
    createActivity({
      agency: agencyId,
      entityType: ActivityEntityTypes.TASK,
      entityId: String(task.id),
      type,
      title,
      description,
      metadata,
      severity,
      user: userId,
    })

  if (operation === 'create') {
    await create(ActivityTypes.TASK_CREATED, 'Task created', `Task created: ${task.title}.`, {
      status: task.status,
      priority: task.priority,
      dueAt: task.dueAt,
      assignedAgent: getRelationshipId(task.assignedAgent),
    })

    return
  }

  if (!previousTask) {
    return
  }

  if (changedFields.includes('status') && previousTask.status !== task.status) {
    const severity =
      task.status === 'completed'
        ? ActivitySeverities.SUCCESS
        : task.status === 'cancelled'
          ? ActivitySeverities.WARNING
          : ActivitySeverities.INFO

    const title =
      task.status === 'completed'
        ? 'Task completed'
        : previousTask.status === 'completed'
          ? 'Task reopened'
          : 'Task status changed'

    await create(
      ActivityTypes.TASK_STATUS_CHANGED,
      title,
      `${formatValue(previousTask.status)} → ${formatValue(task.status)}`,
      {
        previousStatus: previousTask.status,
        newStatus: task.status,
      },
      severity,
    )
  }

  if (changedFields.includes('assignedAgent')) {
    await create(
      ActivityTypes.TASK_ASSIGNED,
      'Task assignment changed',
      task.assignedAgent
        ? 'The task was assigned to an agent.'
        : 'The task assignment was removed.',
      {
        previousAssignedAgent: getRelationshipId(previousTask.assignedAgent),
        newAssignedAgent: getRelationshipId(task.assignedAgent),
      },
    )
  }

  if (changedFields.includes('priority') && previousTask.priority !== task.priority) {
    await create(
      ActivityTypes.TASK_PRIORITY_CHANGED,
      'Task priority changed',
      `${formatValue(previousTask.priority)} → ${formatValue(task.priority)}`,
      {
        previousPriority: previousTask.priority,
        newPriority: task.priority,
      },
      task.priority === 'urgent' ? ActivitySeverities.WARNING : ActivitySeverities.INFO,
    )
  }

  if (changedFields.includes('dueAt')) {
    await create(
      ActivityTypes.TASK_DUE_DATE_CHANGED,
      'Task due date changed',
      `${formatDateTime(previousTask.dueAt)} → ${formatDateTime(task.dueAt)}`,
      {
        previousDueAt: previousTask.dueAt,
        newDueAt: task.dueAt,
      },
    )
  }

  if (changedFields.includes('checklist')) {
    const completedItems = task.checklist?.filter((item) => item.completed).length ?? 0
    const totalItems = task.checklist?.length ?? 0

    await create(
      ActivityTypes.TASK_CHECKLIST_UPDATED,
      'Task checklist updated',
      `${completedItems} of ${totalItems} checklist items completed.`,
      {
        completedItems,
        totalItems,
      },
    )
  }

  if (changedFields.includes('internalNotes')) {
    await create(
      ActivityTypes.TASK_NOTES_UPDATED,
      'Task notes updated',
      'The internal task notes were updated.',
    )
  }

  const specificallyHandledFields = [
    'status',
    'assignedAgent',
    'priority',
    'dueAt',
    'checklist',
    'internalNotes',
    'completedAt',
  ]

  const ignoredFields = ['updatedAt', 'createdAt']

  const generalFields = changedFields.filter(
    (field) => !specificallyHandledFields.includes(field) && !ignoredFields.includes(field),
  )

  if (generalFields.length > 0) {
    await create(ActivityTypes.TASK_UPDATED, 'Task updated', 'General task details were updated.', {
      updatedFields: generalFields,
    })
  }
}
