import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { leadId, notes } = body

  if (!leadId) {
    return NextResponse.json({ ok: false, message: 'Missing leadId' }, { status: 400 })
  }

  const updatedLead = await payload.update({
    collection: 'valuation-leads',
    id: leadId,
    data: {
      notes,
    },
    overrideAccess: false,
    user,
  })

  return NextResponse.json({
    ok: true,
    lead: updatedLead,
  })
}
