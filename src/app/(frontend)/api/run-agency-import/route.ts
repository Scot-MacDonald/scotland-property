import configPromise from '@payload-config'
import { importAgencyFeed } from '@/lib/importAgencyFeed'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return NextResponse.json({ ok: false, message: 'You must be logged in.' }, { status: 401 })
  }

  if (user.collection !== 'users') {
    return NextResponse.json(
      { ok: false, message: 'Only agency users can run imports.' },
      { status: 403 },
    )
  }

  const body = await req.json()
  const requestedAgencyId = String(body.agencyId || '').trim()

  const userAsAny = user as any

  const isSuperAdmin = userAsAny.role === 'super-admin'
  const userAgencyId =
    typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

  const agencyId = isSuperAdmin ? requestedAgencyId : userAgencyId

  if (!agencyId) {
    return NextResponse.json(
      { ok: false, message: 'No agency available for import.' },
      { status: 400 },
    )
  }

  const result = await importAgencyFeed(agencyId)

  return NextResponse.json(result)
}
