import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const validStatuses = ['todo', 'in-progress', 'waiting', 'completed', 'cancelled'] as const

const validPriorities = ['low', 'normal', 'high', 'urgent'] as const

type TaskStatus = (typeof validStatuses)[number]
type TaskPriority = (typeof validPriorities)[number]

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
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value.id === null || value.id === undefined) {
    return null
  }

  return String(value.id)
}

function getOptionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()

  return stringValue || null
}

function getOptionalDate(value: FormDataEntryValue | null) {
  const stringValue = String(value || '').trim()

  if (!stringValue) {
    return null
  }

  const date = new Date(stringValue)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value.')
  }

  return date.toISOString()
}

function isTaskStatus(value: string): value is TaskStatus {
  return validStatuses.includes(value as TaskStatus)
}

function isTaskPriority(value: string): value is TaskPriority {
  return validPriorities.includes(value as TaskPriority)
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const requestHeaders = await headers()

    const { user } = await payload.auth({
      headers: requestHeaders,
    })

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You must be logged in to update a task.',
        },
        {
          status: 401,
        },
      )
    }

    const formData = await request.formData()

    const id = String(formData.get('id') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const description = getOptionalString(formData.get('description'))
    const status = String(formData.get('status') || '').trim()
    const priority = String(formData.get('priority') || '').trim()
    const dueAt = getOptionalDate(formData.get('dueAt'))
    const reminderAt = getOptionalDate(formData.get('reminderAt'))
    const assignedAgentId = getOptionalString(formData.get('assignedAgent'))

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Task ID is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!title) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Task title is required.',
        },
        {
          status: 400,
        },
      )
    }

    if (!isTaskStatus(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid task status.',
        },
        {
          status: 400,
        },
      )
    }

    if (!isTaskPriority(priority)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid task priority.',
        },
        {
          status: 400,
        },
      )
    }

    if (dueAt && reminderAt && new Date(reminderAt).getTime() > new Date(dueAt).getTime()) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The reminder must be scheduled before the task due date.',
        },
        {
          status: 400,
        },
      )
    }

    let task

    try {
      task = await payload.findByID({
        collection: 'tasks',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Task not found.',
        },
        {
          status: 404,
        },
      )
    }

    const isSuperAdmin =
      user.collection === 'users' && 'role' in user && user.role === 'super-admin'

    const userAgencyId =
      user.collection === 'users' && 'agency' in user ? getRelationshipId(user.agency) : null

    const taskAgencyId = getRelationshipId(task.agency)

    if (!isSuperAdmin) {
      if (!userAgencyId || !taskAgencyId || userAgencyId !== taskAgencyId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'You do not have permission to update this task.',
          },
          {
            status: 403,
          },
        )
      }
    }

    if (assignedAgentId) {
      let assignedAgent

      try {
        assignedAgent = await payload.findByID({
          collection: 'agents',
          id: assignedAgentId,
          depth: 0,
          overrideAccess: true,
        })
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: 'The selected agent could not be found.',
          },
          {
            status: 400,
          },
        )
      }

      const agentAgencyId = getRelationshipId(assignedAgent.agency)

      if (!isSuperAdmin && agentAgencyId !== taskAgencyId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'The selected agent does not belong to this agency.',
          },
          {
            status: 403,
          },
        )
      }
    }

    const updatedTask = await payload.update({
      collection: 'tasks',
      id,
      overrideAccess: true,
      data: {
        title,
        description,
        status,
        priority,
        dueAt,
        reminderAt,
        assignedAgent: assignedAgentId,
      },
      req: {
        user,
      },
    })

    return NextResponse.json({
      ok: true,
      task: {
        id: String(updatedTask.id),
        title: updatedTask.title,
        status: updatedTask.status,
        priority: updatedTask.priority,
      },
    })
  } catch (error) {
    console.error('Could not update task:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not update task.',
      },
      {
        status: 500,
      },
    )
  }
}
