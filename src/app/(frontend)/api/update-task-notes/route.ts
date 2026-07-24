import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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
          error: 'You must be logged in to update task notes.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await request.json()) as {
      taskId?: unknown
      internalNotes?: unknown
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

    if (body.internalNotes !== undefined && typeof body.internalNotes !== 'string') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Task notes must be text.',
        },
        {
          status: 400,
        },
      )
    }

    const internalNotes = typeof body.internalNotes === 'string' ? body.internalNotes.trim() : ''

    if (internalNotes.length > 20000) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Task notes cannot exceed 20,000 characters.',
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
        internalNotes: internalNotes || null,
      },
      overrideAccess: true,
      user,
    })

    return NextResponse.json({
      ok: true,
      internalNotes: updatedTask.internalNotes || null,
    })
  } catch (error) {
    console.error('Task notes update failed:', error)

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not update the task notes.',
      },
      {
        status: 500,
      },
    )
  }
}
