import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type LeadStatus = 'new' | 'contacted' | 'valuation-booked' | 'instruction-won' | 'lost'

type PropertyType = 'house' | 'flat' | 'estate' | 'land' | 'commercial' | 'other'

function getRelationshipId(value: unknown) {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

function optionalString(value: unknown) {
  const stringValue = String(value || '').trim()

  return stringValue || null
}

function optionalNumber(value: unknown) {
  const stringValue = String(value || '').trim()

  if (!stringValue) {
    return null
  }

  const numberValue = Number(stringValue)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

function getLeadStatus(value: unknown): LeadStatus | undefined {
  const status = String(value || '').trim()

  if (
    status === 'new' ||
    status === 'contacted' ||
    status === 'valuation-booked' ||
    status === 'instruction-won' ||
    status === 'lost'
  ) {
    return status
  }

  return undefined
}

function getPropertyType(value: unknown): PropertyType | null | undefined {
  const propertyType = String(value || '').trim()

  if (!propertyType) {
    return null
  }

  if (
    propertyType === 'house' ||
    propertyType === 'flat' ||
    propertyType === 'estate' ||
    propertyType === 'land' ||
    propertyType === 'commercial' ||
    propertyType === 'other'
  ) {
    return propertyType
  }

  return undefined
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Not authorised.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await req.json()) as Record<string, unknown>
    const leadId = String(body.leadId || '').trim()

    if (!leadId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing lead ID.',
        },
        {
          status: 400,
        },
      )
    }

    const existingLead = await payload.findByID({
      collection: 'valuation-leads',
      id: leadId,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)
    const leadAgencyId = getRelationshipId(existingLead.assignedAgency)

    if (!isSuperAdmin && agencyId !== leadAgencyId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Not authorised.',
        },
        {
          status: 403,
        },
      )
    }

    const data: Record<string, unknown> = {}

    if ('name' in body) {
      const name = String(body.name || '').trim()

      if (!name) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Lead name is required.',
          },
          {
            status: 400,
          },
        )
      }

      data.name = name
    }

    if ('email' in body) {
      const email = String(body.email || '').trim()

      if (!email) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Email address is required.',
          },
          {
            status: 400,
          },
        )
      }

      data.email = email
    }

    if ('phone' in body) {
      data.phone = optionalString(body.phone)
    }

    if ('postcode' in body) {
      const postcode = String(body.postcode || '').trim()

      if (!postcode) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Postcode is required.',
          },
          {
            status: 400,
          },
        )
      }

      data.postcode = postcode
    }

    if ('propertyType' in body) {
      const propertyType = getPropertyType(body.propertyType)

      if (propertyType === undefined) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Invalid property type.',
          },
          {
            status: 400,
          },
        )
      }

      data.propertyType = propertyType
    }

    if ('estimatedValue' in body) {
      const estimatedValue = optionalNumber(body.estimatedValue)

      if (estimatedValue === undefined) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Estimated value must be a valid number.',
          },
          {
            status: 400,
          },
        )
      }

      data.estimatedValue = estimatedValue
    }

    if ('message' in body) {
      data.message = optionalString(body.message)
    }

    if ('status' in body) {
      const status = getLeadStatus(body.status)

      if (!status) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Invalid lead status.',
          },
          {
            status: 400,
          },
        )
      }

      data.status = status
    }

    if ('notes' in body) {
      data.notes = optionalString(body.notes)
    }

    if ('nextFollowUpAt' in body) {
      data.nextFollowUpAt = optionalString(body.nextFollowUpAt)
    }

    if ('nextFollowUpTask' in body) {
      data.nextFollowUpTask = optionalString(body.nextFollowUpTask)
    }

    if ('followUpCompleted' in body) {
      data.followUpCompleted = Boolean(body.followUpCompleted)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No lead changes were submitted.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedLead = await payload.update({
      collection: 'valuation-leads',
      id: leadId,
      data,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      lead: updatedLead,
    })
  } catch (error: unknown) {
    console.error('Update valuation lead error:', error)

    const message = error instanceof Error ? error.message : 'Could not update valuation lead.'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    )
  }
}
