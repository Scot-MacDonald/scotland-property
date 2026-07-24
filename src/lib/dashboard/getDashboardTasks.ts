import type { Payload, Where } from 'payload'

import type { DashboardUser } from './dashboardTypes'
import { getAgencyId } from './getAgencyId'
import { getAgencyWhere } from './getAgencyWhere'

export type DashboardTaskStatus = 'todo' | 'in-progress' | 'waiting' | 'completed' | 'cancelled'

export type DashboardTaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export type DashboardTaskRelatedEntityType = 'property' | 'lead' | 'enquiry' | 'viewing' | 'buyer'

export type DashboardTask = {
  id: string
  title: string
  description: string | null
  status: DashboardTaskStatus
  priority: DashboardTaskPriority
  dueAt: string | null
  reminderAt: string | null
  completedAt: string | null

  assignedAgentId: string | null
  assignedAgentName: string

  relatedEntityType: DashboardTaskRelatedEntityType | null
  relatedEntityId: string | null
  relatedEntityTitle: string | null

  checklistCompleted: number
  checklistTotal: number

  createdAt: string
  updatedAt: string
}

export type DashboardTasksResult = {
  docs: DashboardTask[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type DashboardTaskDueFilter = '' | 'overdue' | 'today' | 'upcoming' | 'no-date'

type RelationshipValue =
  | string
  | number
  | {
      id?: string | number | null
      title?: string | null
      name?: string | null
      contactName?: string | null
      email?: string | null
      reference?: string | null
    }
  | null
  | undefined

function getRelationshipId(relationship: RelationshipValue): string | null {
  if (!relationship) {
    return null
  }

  if (typeof relationship === 'object') {
    return relationship.id !== undefined && relationship.id !== null
      ? String(relationship.id)
      : null
  }

  return String(relationship)
}

function getRelationshipLabel(relationship: RelationshipValue, fallback: string): string {
  if (!relationship || typeof relationship !== 'object') {
    return fallback
  }

  return (
    relationship.title ||
    relationship.name ||
    relationship.contactName ||
    relationship.reference ||
    relationship.email ||
    fallback
  )
}

function getRelatedEntity(task: any): {
  type: DashboardTaskRelatedEntityType | null
  id: string | null
  title: string | null
} {
  if (task.property) {
    return {
      type: 'property',
      id: getRelationshipId(task.property),
      title: getRelationshipLabel(task.property, 'Property'),
    }
  }

  if (task.lead) {
    return {
      type: 'lead',
      id: getRelationshipId(task.lead),
      title: getRelationshipLabel(task.lead, 'Valuation lead'),
    }
  }

  if (task.enquiry) {
    return {
      type: 'enquiry',
      id: getRelationshipId(task.enquiry),
      title: getRelationshipLabel(task.enquiry, 'Enquiry'),
    }
  }

  if (task.viewing) {
    return {
      type: 'viewing',
      id: getRelationshipId(task.viewing),
      title: getRelationshipLabel(task.viewing, 'Viewing'),
    }
  }

  if (task.buyer) {
    return {
      type: 'buyer',
      id: getRelationshipId(task.buyer),
      title: getRelationshipLabel(task.buyer, 'Buyer'),
    }
  }

  return {
    type: null,
    id: null,
    title: null,
  }
}

function getChecklistProgress(checklist: unknown): {
  completed: number
  total: number
} {
  if (!Array.isArray(checklist)) {
    return {
      completed: 0,
      total: 0,
    }
  }

  return {
    completed: checklist.filter((item) => {
      return (
        typeof item === 'object' && item !== null && 'completed' in item && item.completed === true
      )
    }).length,
    total: checklist.length,
  }
}

function isTaskStatus(value: unknown): value is DashboardTaskStatus {
  return (
    value === 'todo' ||
    value === 'in-progress' ||
    value === 'waiting' ||
    value === 'completed' ||
    value === 'cancelled'
  )
}

function isTaskPriority(value: unknown): value is DashboardTaskPriority {
  return value === 'low' || value === 'normal' || value === 'high' || value === 'urgent'
}

function getDueDateConditions(due: DashboardTaskDueFilter): Where[] {
  if (!due) {
    return []
  }

  const now = new Date()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

  if (due === 'overdue') {
    return [
      {
        dueAt: {
          less_than: now.toISOString(),
        },
      },
      {
        status: {
          not_in: ['completed', 'cancelled'],
        },
      },
    ]
  }

  if (due === 'today') {
    return [
      {
        dueAt: {
          greater_than_equal: startOfToday.toISOString(),
        },
      },
      {
        dueAt: {
          less_than: startOfTomorrow.toISOString(),
        },
      },
    ]
  }

  if (due === 'upcoming') {
    return [
      {
        dueAt: {
          greater_than_equal: startOfTomorrow.toISOString(),
        },
      },
    ]
  }

  if (due === 'no-date') {
    return [
      {
        dueAt: {
          exists: false,
        },
      },
    ]
  }

  return []
}

function mapDashboardTask(task: any): DashboardTask {
  const relatedEntity = getRelatedEntity(task)
  const checklist = getChecklistProgress(task.checklist)

  return {
    id: String(task.id),
    title: typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task',
    description:
      typeof task.description === 'string' && task.description.trim() ? task.description : null,
    status: isTaskStatus(task.status) ? task.status : 'todo',
    priority: isTaskPriority(task.priority) ? task.priority : 'normal',
    dueAt: typeof task.dueAt === 'string' ? task.dueAt : null,
    reminderAt: typeof task.reminderAt === 'string' ? task.reminderAt : null,
    completedAt: typeof task.completedAt === 'string' ? task.completedAt : null,

    assignedAgentId: getRelationshipId(task.assignedAgent),
    assignedAgentName: getRelationshipLabel(task.assignedAgent, 'Unassigned'),

    relatedEntityType: relatedEntity.type,
    relatedEntityId: relatedEntity.id,
    relatedEntityTitle: relatedEntity.title,

    checklistCompleted: checklist.completed,
    checklistTotal: checklist.total,

    createdAt: typeof task.createdAt === 'string' ? task.createdAt : '',
    updatedAt: typeof task.updatedAt === 'string' ? task.updatedAt : '',
  }
}

export async function getDashboardTasks({
  payload,
  user,
  limit = 20,
  page = 1,
  query = '',
  status = '',
  priority = '',
  assignedAgent = '',
  due = '',
}: {
  payload: Payload
  user: DashboardUser
  limit?: number
  page?: number
  query?: string
  status?: string
  priority?: string
  assignedAgent?: string
  due?: DashboardTaskDueFilter
}): Promise<DashboardTasksResult> {
  const isSuperAdmin = user.role === 'super-admin'
  const agencyId = getAgencyId(user)

  const conditions: Where[] = []

  /*
   * Unlike some of the older helpers, do not allow overrideAccess to expose
   * every agency's records when a non-super-admin user has no agency.
   */
  if (!isSuperAdmin && !agencyId) {
    conditions.push({
      id: {
        exists: false,
      },
    })
  } else {
    const agencyFilter = getAgencyWhere(agencyId, isSuperAdmin)

    if (agencyFilter) {
      conditions.push(agencyFilter)
    }
  }

  const trimmedQuery = query.trim()

  if (trimmedQuery) {
    conditions.push({
      or: [
        {
          title: {
            like: trimmedQuery,
          },
        },
        {
          description: {
            like: trimmedQuery,
          },
        },
        {
          internalNotes: {
            like: trimmedQuery,
          },
        },
      ],
    })
  }

  if (isTaskStatus(status)) {
    conditions.push({
      status: {
        equals: status,
      },
    })
  }

  if (isTaskPriority(priority)) {
    conditions.push({
      priority: {
        equals: priority,
      },
    })
  }

  if (assignedAgent.trim()) {
    conditions.push({
      assignedAgent: {
        equals: assignedAgent.trim(),
      },
    })
  }

  conditions.push(...getDueDateConditions(due))

  const where: Where | undefined =
    conditions.length > 0
      ? {
          and: conditions,
        }
      : undefined

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1

  const result = await payload.find({
    collection: 'tasks',
    depth: 1,
    limit: safeLimit,
    page: safePage,
    sort: 'dueAt',
    where,
    overrideAccess: true,
  })

  return {
    docs: result.docs.map(mapDashboardTask),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || safePage,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  }
}
