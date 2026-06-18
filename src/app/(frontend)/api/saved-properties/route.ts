import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json({
      ok: false,
      savedProperties: [],
      message: 'No logged-in buyer.',
    })
  }

  return NextResponse.json({
    ok: true,
    savedProperties: Array.isArray(user.savedProperties) ? user.savedProperties : [],
  })
}

export async function PATCH(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    return NextResponse.json(
      {
        ok: false,
        message: 'You must be logged in as a buyer.',
      },
      { status: 401 },
    )
  }

  const body = await req.json()
  const propertyId = String(body.propertyId || '').trim()

  if (!propertyId) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Missing propertyId.',
      },
      { status: 400 },
    )
  }

  const currentSavedProperties = Array.isArray(user.savedProperties)
    ? user.savedProperties.map((property: any) =>
        typeof property === 'object' ? property.id : property,
      )
    : []

  const isSaved = currentSavedProperties.includes(propertyId)

  const nextSavedProperties = isSaved
    ? currentSavedProperties.filter((id: string) => id !== propertyId)
    : [...currentSavedProperties, propertyId]

  await payload.update({
    collection: 'buyers',
    id: user.id,
    data: {
      savedProperties: nextSavedProperties,
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    saved: !isSaved,
    savedProperties: nextSavedProperties,
  })
}

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const body = await req.json()
  const ids = Array.isArray(body.ids) ? body.ids : []

  if (ids.length === 0) {
    return NextResponse.json({ docs: [] })
  }

  const properties = await payload.find({
    collection: 'properties',
    depth: 2,
    limit: 100,
    overrideAccess: true,
    where: {
      or: ids.map((id: string) => ({
        id: {
          equals: id,
        },
      })),
    },
  })

  return NextResponse.json(properties)
}
