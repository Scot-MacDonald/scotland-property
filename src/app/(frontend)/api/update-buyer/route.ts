import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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
    const buyerId = String(body.buyerId || '').trim()

    if (!buyerId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing buyer ID.',
        },
        {
          status: 400,
        },
      )
    }

    const existingBuyer = await payload.findByID({
      collection: 'buyers',
      id: buyerId,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)
    const buyerAgencyId = getRelationshipId(existingBuyer.agency)

    if (!isSuperAdmin && agencyId !== buyerAgencyId) {
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
      data.name = name || null
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

    if ('alertsEnabled' in body) {
      data.alertsEnabled = Boolean(body.alertsEnabled)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No buyer changes were submitted.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: buyerId,
      depth: 1,
      overrideAccess: true,
      data,
    })

    return NextResponse.json({
      ok: true,
      buyer: updatedBuyer,
    })
  } catch (error: unknown) {
    console.error('Update buyer error:', error)

    const message = error instanceof Error ? error.message : 'Could not update buyer.'

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
