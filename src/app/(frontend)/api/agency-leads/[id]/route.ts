import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const allowedStatuses = ['new', 'contacted', 'valuation-booked', 'instruction-won', 'lost']

function isAgencyUser(user: any) {
  return user?.role === 'agency-admin' || user?.role === 'agent' || user?.role === 'super-admin'
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!isAgencyUser(user)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const updateData: any = {}

  if (body.status) {
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ ok: false, message: 'Invalid status' }, { status: 400 })
    }

    updateData.status = body.status
  }

  if (typeof body.notes === 'string') {
    updateData.notes = body.notes
  }

  const updatedLead = await payload.update({
    collection: 'valuation-leads',
    id,
    data: updateData,
  })

  return NextResponse.json({
    ok: true,
    lead: updatedLead,
  })
}
