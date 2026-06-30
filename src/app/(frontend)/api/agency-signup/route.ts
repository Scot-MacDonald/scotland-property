import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const { agencyName, name, email, password, phone, website } = body

    if (!agencyName || !name || !email || !password) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Agency name, name, email and password are required.',
        },
        { status: 400 },
      )
    }

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const baseSlug = createSlug(agencyName)

    const existingAgency = await payload.find({
      collection: 'agencies',
      where: {
        slug: {
          equals: baseSlug,
        },
      },
      limit: 1,
      overrideAccess: true,
    })

    const slug =
      existingAgency.docs.length > 0 ? `${baseSlug}-${existingAgency.docs.length + 1}` : baseSlug

    const agency = await payload.create({
      collection: 'agencies',
      data: {
        name: agencyName,
        slug,
        email,
        phone,
        website,
        subscriptionPlan: 'starter',
        subscriptionStatus: 'trial',
        trialEndsAt: trialEndsAt.toISOString(),
        crm: {
          enabled: false,
          type: 'manual',
        },
      },
      overrideAccess: true,
    })

    const user = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        role: 'agency-admin',
        agency: agency.id,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      agencyId: agency.id,
      userId: user.id,
      message: 'Agency trial created successfully.',
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        ok: false,
        message: 'Could not create agency account.',
      },
      { status: 500 },
    )
  }
}
