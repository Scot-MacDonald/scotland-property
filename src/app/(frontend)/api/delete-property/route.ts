import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const body = await req.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Missing property ID.' }, { status: 400 })
    }

    const property = await payload.findByID({
      collection: 'properties',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const userAsAny = user as any
    const isSuperAdmin = userAsAny.role === 'super-admin'

    const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

    const propertyAgencyId =
      typeof property.agency === 'object' ? property.agency?.id : property.agency

    if (!isSuperAdmin && agencyId !== propertyAgencyId) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
    }

    await payload.delete({
      collection: 'properties',
      id,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not delete property.',
      },
      { status: 500 },
    )
  }
}
