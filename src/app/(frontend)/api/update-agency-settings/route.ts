import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    const { user } = await payload.auth({
      headers: requestHeaders,
    })

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    if (user.collection !== 'users') {
      return NextResponse.json(
        {
          ok: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const agencyId = typeof user.agency === 'object' ? user.agency?.id : user.agency

    if (!agencyId) {
      return NextResponse.json(
        {
          ok: false,
          message: 'No agency assigned.',
        },
        { status: 400 },
      )
    }

    const body = await req.json()

    const {
      name,
      email,
      phone,
      website,
      street,
      city,
      postcode,
      country,
      crmEnabled,
      crmType,
      crmFeedUrl,
    } = body

    const agency = await payload.update({
      collection: 'agencies',
      id: agencyId,
      data: {
        name,
        email,
        phone,
        website,

        address: {
          street,
          city,
          postcode,
          country,
        },

        crm: {
          enabled: crmEnabled,
          type: crmType,
          feedUrl: crmFeedUrl,
        },
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      agency,
      message: 'Agency updated successfully.',
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        message: 'Could not update agency settings.',
      },
      { status: 500 },
    )
  }
}
