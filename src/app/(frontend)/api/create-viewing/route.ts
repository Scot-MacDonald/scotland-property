import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type ViewingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'

type CreateViewingBody = {
  dateTime?: string
  durationMinutes?: number
  status?: ViewingStatus
  property?: string
  agent?: string
  enquiry?: string | null
  buyer?: string | null
  contactName?: string
  contactEmail?: string
  contactPhone?: string | null
  internalNotes?: string | null
}

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
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return value.id ? String(value.id) : null
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined

  const cleaned = value.trim()
  return cleaned || undefined
}

const validStatuses: ViewingStatus[] = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
]

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
          error: 'You must be logged in to book a viewing.',
        },
        {
          status: 401,
        },
      )
    }

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)

    if (!isSuperAdmin && !agencyId) {
      return NextResponse.json(
        {
          error: 'Your account is not linked to an agency.',
        },
        {
          status: 403,
        },
      )
    }

    const body = (await request.json()) as CreateViewingBody

    const dateTime = cleanOptionalString(body.dateTime)
    const propertyId = cleanOptionalString(body.property)
    const agentId = cleanOptionalString(body.agent)
    const contactName = cleanOptionalString(body.contactName)
    const contactEmail = cleanOptionalString(body.contactEmail)

    if (!dateTime) {
      return NextResponse.json({ error: 'A viewing date and time is required.' }, { status: 400 })
    }

    if (Number.isNaN(new Date(dateTime).getTime())) {
      return NextResponse.json({ error: 'The viewing date is invalid.' }, { status: 400 })
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'A property is required.' }, { status: 400 })
    }

    if (!agentId) {
      return NextResponse.json({ error: 'An agent is required.' }, { status: 400 })
    }

    if (!contactName) {
      return NextResponse.json({ error: 'A contact name is required.' }, { status: 400 })
    }

    if (!contactEmail) {
      return NextResponse.json({ error: 'A contact email is required.' }, { status: 400 })
    }

    const durationMinutes = Number(body.durationMinutes || 60)

    if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
      return NextResponse.json(
        {
          error: 'The duration must be at least 15 minutes.',
        },
        {
          status: 400,
        },
      )
    }

    const status = body.status && validStatuses.includes(body.status) ? body.status : 'requested'

    const property = await payload.findByID({
      collection: 'properties',
      id: propertyId,
      depth: 0,
      overrideAccess: true,
    })

    const propertyAgencyId = getRelationshipId(property.agency)

    if (!isSuperAdmin && propertyAgencyId !== agencyId) {
      return NextResponse.json(
        {
          error: 'You cannot book a viewing for this property.',
        },
        {
          status: 403,
        },
      )
    }

    const agent = await payload.findByID({
      collection: 'agents',
      id: agentId,
      depth: 0,
      overrideAccess: true,
    })

    const agentAgencyId = getRelationshipId(agent.agency)

    if (!isSuperAdmin && agentAgencyId !== agencyId) {
      return NextResponse.json(
        {
          error: 'The selected agent does not belong to your agency.',
        },
        {
          status: 403,
        },
      )
    }

    const viewingAgencyId = agencyId || propertyAgencyId

    if (!viewingAgencyId) {
      return NextResponse.json(
        {
          error: 'The viewing could not be linked to an agency.',
        },
        {
          status: 400,
        },
      )
    }

    const viewing = await payload.create({
      collection: 'viewings',
      overrideAccess: true,
      data: {
        dateTime: new Date(dateTime).toISOString(),
        durationMinutes,
        status,
        property: propertyId,
        agent: agentId,
        agency: viewingAgencyId,
        enquiry: cleanOptionalString(body.enquiry),
        buyer: cleanOptionalString(body.buyer),
        contactName,
        contactEmail,
        contactPhone: cleanOptionalString(body.contactPhone),
        internalNotes: cleanOptionalString(body.internalNotes),
      },
    })

    return NextResponse.json({
      ok: true,
      id: viewing.id,
    })
  } catch (error) {
    console.error('Create viewing error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'The viewing could not be created.',
      },
      {
        status: 500,
      },
    )
  }
}
