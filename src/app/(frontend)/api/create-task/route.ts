import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const relationshipFields = {
  property: 'property',
  lead: 'lead',
  enquiry: 'enquiry',
  viewing: 'viewing',
  buyer: 'buyer',
} as const

const relationshipCollections = {
  property: 'properties',
  lead: 'valuation-leads',
  enquiry: 'enquiries',
  viewing: 'viewings',
  buyer: 'buyers',
} as const

type RelationshipType = keyof typeof relationshipFields
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

type CreateTaskBody = {
  title?: unknown
  description?: unknown
  priority?: unknown
  dueAt?: unknown
  assignedAgent?: unknown
  relationshipType?: unknown
  relationshipId?: unknown
}

function getRelationshipId(
  value:
    | string
    | number
    | {
        id?: string | number
      }
    | null
    | undefined,
) {
  if (!value) {
    return null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && value.id) {
    return String(value.id)
  }

  return null
}

function normaliseOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalisedValue = value.trim()

  return normalisedValue || null
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'normal' || value === 'high' || value === 'urgent'
}

function isRelationshipType(value: unknown): value is RelationshipType {
  return (
    value === 'property' ||
    value === 'lead' ||
    value === 'enquiry' ||
    value === 'viewing' ||
    value === 'buyer'
  )
}

function normaliseDueAt(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
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

    if (!user || user.collection !== 'users') {
      return NextResponse.json(
        {
          ok: false,
          error: 'You must be signed in to create a task.',
        },
        {
          status: 401,
        },
      )
    }

    let body: CreateTaskBody

    try {
      body = (await request.json()) as CreateTaskBody
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'The request body is invalid.',
        },
        {
          status: 400,
        },
      )
    }

    const title = normaliseOptionalString(body.title)
    const description = normaliseOptionalString(body.description)
    const assignedAgent = normaliseOptionalString(body.assignedAgent)
    const relationshipId = normaliseOptionalString(body.relationshipId)
    const dueAt = normaliseDueAt(body.dueAt)

    if (!title) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please enter a task title.',
        },
        {
          status: 400,
        },
      )
    }

    if (!isTaskPriority(body.priority)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please select a valid priority.',
        },
        {
          status: 400,
        },
      )
    }

    if (!isRelationshipType(body.relationshipType)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The related record type is invalid.',
        },
        {
          status: 400,
        },
      )
    }

    if (!relationshipId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The related record is missing.',
        },
        {
          status: 400,
        },
      )
    }

    if (dueAt === undefined) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The due date is invalid.',
        },
        {
          status: 400,
        },
      )
    }

    const dashboardUser = user as typeof user & {
      role?: string | null
      agency?:
        | string
        | number
        | {
            id?: string | number
          }
        | null
    }

    const isSuperAdmin = dashboardUser.role === 'super-admin'
    const userAgencyId = getRelationshipId(dashboardUser.agency)

    const relatedCollection = relationshipCollections[body.relationshipType]

    let relatedRecord

    try {
      relatedRecord = await payload.findByID({
        collection: relatedCollection,
        id: relationshipId,
        depth: 1,
        overrideAccess: true,
      })
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'The related record could not be found.',
        },
        {
          status: 404,
        },
      )
    }

    if (!relatedRecord) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The related record could not be found.',
        },
        {
          status: 404,
        },
      )
    }

    const relatedAgencyId =
      getRelationshipId(
        'agency' in relatedRecord
          ? relatedRecord.agency
          : 'assignedAgency' in relatedRecord
            ? relatedRecord.assignedAgency
            : null,
      ) || userAgencyId

    if (!isSuperAdmin && (!userAgencyId || relatedAgencyId !== userAgencyId)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'You do not have permission to create a task for this record.',
        },
        {
          status: 403,
        },
      )
    }

    if (!relatedAgencyId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The task could not be linked to an agency.',
        },
        {
          status: 400,
        },
      )
    }

    if (assignedAgent) {
      let agent

      try {
        agent = await payload.findByID({
          collection: 'agents',
          id: assignedAgent,
          depth: 1,
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

      const agentAgencyId = getRelationshipId(agent.agency)

      if (!isSuperAdmin && agentAgencyId !== userAgencyId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'The selected agent does not belong to your agency.',
          },
          {
            status: 403,
          },
        )
      }
    }

    const relationshipField = relationshipFields[body.relationshipType]

    const task = await payload.create({
      collection: 'tasks',
      overrideAccess: true,
      data: {
        title,
        description,
        status: 'todo',
        priority: body.priority,
        dueAt,
        agency: relatedAgencyId,
        assignedAgent,
        createdBy: String(user.id),
        [relationshipField]: relationshipId,
      },
    })

    return NextResponse.json({
      ok: true,
      task: {
        id: String(task.id),
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueAt: task.dueAt,
      },
    })
  } catch (error) {
    console.error('Create task error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'The task could not be created.',
      },
      {
        status: 500,
      },
    )
  }
}
