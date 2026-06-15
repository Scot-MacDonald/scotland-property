import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

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
