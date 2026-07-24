import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type ChecklistInput = {
  id?: unknown
  label?: unknown
  completed?: unknown
}

function getRelationshipId(value: unknown): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id

    if (typeof id === 'string' || typeof id === 'number') {
      return String(id)
    }
  }

  return null
}

function normaliseChecklist(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('Checklist must be an array.')
  }

  if (value.length > 200) {
    throw new Error('A checklist cannot contain more than 200 items.')
  }

  return value.map((rawItem, index) => {
    if (!rawItem || typeof rawItem !== 'object') {
      throw new Error(`Checklist item ${index + 1} is invalid.`)
    }

    const item = rawItem as ChecklistInput
    const label = typeof item.label === 'string' ? item.label.trim() : ''

    if (!label) {
      throw new Error(`Checklist item ${index + 1} requires a label.`)
    }

    if (label.length > 500) {
      throw new Error(`Checklist item ${index + 1} cannot exceed 500 characters.`)
    }

    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : undefined

    return {
      ...(id ? { id } : {}),
      label,
      completed: item.completed === true,
    }
  })
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
          error: 'You must be logged in to update a task checklist.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await request.json()) as {
      taskId?: unknown
      checklist?: unknown
    }

    const taskId = typeof body.taskId === 'string' ? body.taskId.trim() : ''

    if (!taskId) {
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

    let checklist

    try {
      checklist = normaliseChecklist(body.checklist)
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : 'The checklist is invalid.',
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
        id: taskId,
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

    const userRole = 'role' in user && typeof user.role === 'string' ? user.role : null

    const isSuperAdmin = user.collection === 'users' && userRole === 'super-admin'

    if (!isSuperAdmin) {
      const userAgencyId = 'agency' in user ? getRelationshipId(user.agency) : null

      const taskAgencyId = getRelationshipId(task.agency)

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

    const updatedTask = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: {
        checklist,
      },
      overrideAccess: true,
      user,
    })

    return NextResponse.json({
      ok: true,
      checklist: updatedTask.checklist || [],
    })
  } catch (error) {
    console.error('Task checklist update failed:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not update the task checklist.',
      },
      {
        status: 500,
      },
    )
  }
}
