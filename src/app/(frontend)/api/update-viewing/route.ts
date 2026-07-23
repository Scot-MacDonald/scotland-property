import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getChangedFields } from '@/lib/activity/getChangedFields'
import { createViewingActivities } from '@/lib/activity/createViewingActivities'
import { getRelationshipId } from '@/lib/dashboard/workspaceHelpers'

const allowedStatuses = ['requested', 'confirmed', 'completed', 'cancelled', 'no-show'] as const

const allowedViewingOutcomes = [
  'not-recorded',
  'interested',
  'second-viewing',
  'considering-offer',
  'offer-expected',
  'not-interested',
] as const

type ViewingStatus = (typeof allowedStatuses)[number]
type ViewingOutcome = (typeof allowedViewingOutcomes)[number]

type ViewingUpdateData = {
  dateTime?: string
  durationMinutes?: number
  status?: ViewingStatus
  agent?: string | null
  contactName?: string
  contactEmail?: string
  contactPhone?: string | null
  internalNotes?: string | null
  viewerRating?: number | null
  viewingOutcome?: ViewingOutcome
  feedback?: string | null
  vendorFeedback?: string | null
  followUpRequired?: boolean
  followUpNotes?: string | null
}

function isViewingStatus(value: unknown): value is ViewingStatus {
  return typeof value === 'string' && allowedStatuses.includes(value as ViewingStatus)
}

function isViewingOutcome(value: unknown): value is ViewingOutcome {
  return typeof value === 'string' && allowedViewingOutcomes.includes(value as ViewingOutcome)
}

function optionalString(value: unknown): string | null | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmedValue = value.trim()

  return trimmedValue || null
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
          error: 'You must be logged in.',
        },
        {
          status: 401,
        },
      )
    }

    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          error: 'Invalid request body.',
        },
        {
          status: 400,
        },
      )
    }

    const requestData = body as Record<string, unknown>

    const id = typeof requestData.id === 'string' ? requestData.id.trim() : ''

    if (!id) {
      return NextResponse.json(
        {
          error: 'Viewing ID is required.',
        },
        {
          status: 400,
        },
      )
    }

    let viewing

    try {
      viewing = await payload.findByID({
        collection: 'viewings',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      return NextResponse.json(
        {
          error: 'Viewing not found.',
        },
        {
          status: 404,
        },
      )
    }

    const userAgencyId = getRelationshipId(user.agency)
    const viewingAgencyId = getRelationshipId(viewing.agency)
    const isSuperAdmin = user.role === 'super-admin'

    if (!isSuperAdmin && (!userAgencyId || viewingAgencyId !== userAgencyId)) {
      return NextResponse.json(
        {
          error: 'You do not have permission to update this viewing.',
        },
        {
          status: 403,
        },
      )
    }

    const updateData: ViewingUpdateData = {}

    if ('internalNotes' in requestData) {
      updateData.internalNotes = optionalString(requestData.internalNotes)
    }

    if ('viewerRating' in requestData) {
      if (
        requestData.viewerRating === null ||
        requestData.viewerRating === undefined ||
        requestData.viewerRating === ''
      ) {
        updateData.viewerRating = null
      } else {
        const viewerRating = Number(requestData.viewerRating)

        if (!Number.isInteger(viewerRating) || viewerRating < 1 || viewerRating > 5) {
          return NextResponse.json(
            {
              error: 'Viewer rating must be a whole number between 1 and 5.',
            },
            {
              status: 400,
            },
          )
        }

        updateData.viewerRating = viewerRating
      }
    }

    if ('viewingOutcome' in requestData) {
      if (!isViewingOutcome(requestData.viewingOutcome)) {
        return NextResponse.json(
          {
            error: 'Viewing outcome is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.viewingOutcome = requestData.viewingOutcome
    }

    if ('feedback' in requestData) {
      updateData.feedback = optionalString(requestData.feedback)
    }

    if ('vendorFeedback' in requestData) {
      updateData.vendorFeedback = optionalString(requestData.vendorFeedback)
    }

    if ('followUpRequired' in requestData) {
      if (typeof requestData.followUpRequired !== 'boolean') {
        return NextResponse.json(
          {
            error: 'Follow-up required must be true or false.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.followUpRequired = requestData.followUpRequired
    }

    if ('followUpNotes' in requestData) {
      updateData.followUpNotes = optionalString(requestData.followUpNotes)
    }

    if ('contactName' in requestData) {
      const contactName =
        typeof requestData.contactName === 'string' ? requestData.contactName.trim() : ''

      if (!contactName) {
        return NextResponse.json(
          {
            error: 'Contact name is required.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.contactName = contactName
    }

    if ('contactEmail' in requestData) {
      const contactEmail =
        typeof requestData.contactEmail === 'string' ? requestData.contactEmail.trim() : ''

      if (!contactEmail) {
        return NextResponse.json(
          {
            error: 'Contact email is required.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.contactEmail = contactEmail
    }

    if ('contactPhone' in requestData) {
      updateData.contactPhone = optionalString(requestData.contactPhone)
    }

    if ('dateTime' in requestData) {
      if (typeof requestData.dateTime !== 'string' && typeof requestData.dateTime !== 'number') {
        return NextResponse.json(
          {
            error: 'A valid viewing date and time is required.',
          },
          {
            status: 400,
          },
        )
      }

      const dateTime = new Date(requestData.dateTime)

      if (Number.isNaN(dateTime.getTime())) {
        return NextResponse.json(
          {
            error: 'A valid viewing date and time is required.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.dateTime = dateTime.toISOString()
    }

    if ('durationMinutes' in requestData) {
      const durationMinutes = Number(requestData.durationMinutes)

      if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
        return NextResponse.json(
          {
            error: 'Viewing duration is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.durationMinutes = durationMinutes
    }

    if ('status' in requestData) {
      if (!isViewingStatus(requestData.status)) {
        return NextResponse.json(
          {
            error: 'Viewing status is invalid.',
          },
          {
            status: 400,
          },
        )
      }

      updateData.status = requestData.status
    }

    if ('agent' in requestData) {
      const agentId =
        typeof requestData.agent === 'string' && requestData.agent.trim()
          ? requestData.agent.trim()
          : null

      if (!agentId) {
        updateData.agent = null
      } else {
        let assignedAgent

        try {
          assignedAgent = await payload.findByID({
            collection: 'agents',
            id: agentId,
            depth: 0,
            overrideAccess: true,
          })
        } catch {
          return NextResponse.json(
            {
              error: 'The selected agent could not be found.',
            },
            {
              status: 400,
            },
          )
        }

        const agentAgencyId = getRelationshipId(assignedAgent.agency)

        if (!isSuperAdmin && agentAgencyId !== userAgencyId) {
          return NextResponse.json(
            {
              error: 'The selected agent does not belong to your agency.',
            },
            {
              status: 403,
            },
          )
        }

        updateData.agent = agentId
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'No viewing changes were provided.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedViewing = await payload.update({
      collection: 'viewings',
      id,
      /*
       * Payload accepts null when clearing an optional relationship,
       * but the generated update type may incorrectly exclude null.
       */
      data: updateData as any,
      overrideAccess: true,
    })

    const changedFields = getChangedFields(viewing, updatedViewing, Object.keys(updateData))

    await createViewingActivities({
      previousViewing: viewing,
      viewing: updatedViewing,
      changedFields,
      agencyId: getRelationshipId(updatedViewing.agency)!,
      userId: user.id,
    })
    return NextResponse.json({
      ok: true,
      viewing: updatedViewing,
    })
  } catch (error) {
    console.error('Could not update viewing:', error)

    return NextResponse.json(
      {
        error: 'Could not update the viewing.',
      },
      {
        status: 500,
      },
    )
  }
}
