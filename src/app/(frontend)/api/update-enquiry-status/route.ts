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
      return NextResponse.json(
        {
          ok: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const body = await req.json()

    const { enquiryId, status } = body

    if (!enquiryId || !status) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Missing enquiryId or status',
        },
        { status: 400 },
      )
    }

    const enquiry = await payload.findByID({
      collection: 'enquiries',
      id: enquiryId,
      overrideAccess: true,
    })

    if (!enquiry) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Enquiry not found',
        },
        { status: 404 },
      )
    }

    const isSuperAdmin = user.role === 'super-admin'

    const userAgency = typeof user.agency === 'object' ? user.agency?.id : user.agency

    const enquiryAgency = typeof enquiry.agency === 'object' ? enquiry.agency?.id : enquiry.agency

    if (!isSuperAdmin && String(userAgency) !== String(enquiryAgency)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Forbidden',
        },
        { status: 403 },
      )
    }

    await payload.update({
      collection: 'enquiries',
      id: enquiryId,
      data: {
        status,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        message: 'Something went wrong',
      },
      { status: 500 },
    )
  }
}
