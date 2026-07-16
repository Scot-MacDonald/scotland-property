import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type EnquiryStatus =
  | 'new'
  | 'contacted'
  | 'viewing-booked'
  | 'offer-made'
  | 'sale-agreed'
  | 'completed'
  | 'lost'

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

function getEnquiryStatus(value: unknown): EnquiryStatus | undefined {
  const status = String(value || '').trim()

  if (
    status === 'new' ||
    status === 'contacted' ||
    status === 'viewing-booked' ||
    status === 'offer-made' ||
    status === 'sale-agreed' ||
    status === 'completed' ||
    status === 'lost'
  ) {
    return status
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
    const enquiryId = String(body.enquiryId || '').trim()

    if (!enquiryId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing enquiry ID.',
        },
        {
          status: 400,
        },
      )
    }

    const existingEnquiry = await payload.findByID({
      collection: 'enquiries',
      id: enquiryId,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)
    const enquiryAgencyId = getRelationshipId(existingEnquiry.agency)

    if (!isSuperAdmin && agencyId !== enquiryAgencyId) {
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
            error: 'Name is required.',
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

    if ('message' in body) {
      const message = String(body.message || '').trim()

      if (!message) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Enquiry message is required.',
          },
          {
            status: 400,
          },
        )
      }

      data.message = message
    }

    if ('status' in body) {
      const status = getEnquiryStatus(body.status)

      if (!status) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Invalid enquiry status.',
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

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No enquiry changes were submitted.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedEnquiry = await payload.update({
      collection: 'enquiries',
      id: enquiryId,
      depth: 1,
      overrideAccess: true,
      data,
    })

    return NextResponse.json({
      ok: true,
      enquiry: updatedEnquiry,
    })
  } catch (error: unknown) {
    console.error('Update enquiry error:', error)

    const message = error instanceof Error ? error.message : 'Could not update enquiry.'

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
