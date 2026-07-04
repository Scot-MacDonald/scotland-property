import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    const { user } = await payload.auth({
      headers: requestHeaders,
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { leadId, status } = body

    if (!leadId || !status) {
      return NextResponse.json({ ok: false, message: 'Missing leadId or status' }, { status: 400 })
    }

    const lead = await payload.findByID({
      collection: 'valuation-leads',
      id: leadId,
      overrideAccess: true,
    })

    if (!lead) {
      return NextResponse.json({ ok: false, message: 'Lead not found' }, { status: 404 })
    }

    const isSuperAdmin = user.role === 'super-admin'
    const userAgency = typeof user.agency === 'object' ? user.agency?.id : user.agency

    const leadAgency =
      typeof lead.assignedAgency === 'object' ? lead.assignedAgency?.id : lead.assignedAgency

    if (!isSuperAdmin && String(userAgency) !== String(leadAgency)) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    await payload.update({
      collection: 'valuation-leads',
      id: leadId,
      data: {
        status,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Update lead status error:', error)

    return NextResponse.json({ ok: false, message: 'Something went wrong' }, { status: 500 })
  }
}
