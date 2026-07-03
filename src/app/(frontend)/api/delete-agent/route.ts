import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
    }

    const body = await req.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Missing agent ID.' }, { status: 400 })
    }

    const existingAgent = await payload.findByID({
      collection: 'agents',
      id,
      depth: 0,
      overrideAccess: true,
    })

    const userAsAny = user as any
    const isSuperAdmin = userAsAny.role === 'super-admin'

    const agencyId = typeof userAsAny.agency === 'object' ? userAsAny.agency?.id : userAsAny.agency

    const agentAgencyId =
      typeof existingAgent.agency === 'object' ? existingAgent.agency?.id : existingAgent.agency

    if (!isSuperAdmin && agencyId !== agentAgencyId) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
    }

    await payload.delete({
      collection: 'agents',
      id,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Delete agent error:', error)

    return NextResponse.json(
      {
        error: error?.message || 'Could not delete agent.',
      },
      { status: 500 },
    )
  }
}
