import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { ActivityTypes, createActivity } from '@/lib/activity'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'buyers') {
      return NextResponse.json(
        {
          ok: false,
          error: 'You must be logged in as a buyer.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await req.json()) as Record<string, unknown>

    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')
    const confirmPassword = String(body.confirmPassword || '')

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please complete all password fields.',
        },
        {
          status: 400,
        },
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your new password must contain at least 8 characters.',
        },
        {
          status: 400,
        },
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: 'The new passwords do not match.',
        },
        {
          status: 400,
        },
      )
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your new password must be different from your current password.',
        },
        {
          status: 400,
        },
      )
    }

    try {
      await payload.login({
        collection: 'buyers',
        data: {
          email: user.email,
          password: currentPassword,
        },
      })
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your current password is incorrect.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
      data: {
        password: newPassword,
        lastActiveAt: new Date().toISOString(),
      },
    })

    const buyerAgencyId = getRelationshipId(updatedBuyer.agency)

    await createActivity({
      type: ActivityTypes.BUYER_UPDATED,
      title: 'Password changed',
      description: 'Your account password was changed.',
      severity: 'success',
      entityType: 'buyer',
      entityId: String(updatedBuyer.id),
      buyer: String(updatedBuyer.id),
      agency: buyerAgencyId || undefined,
      metadata: {
        changedFields: ['password'],
        source: 'buyer-security',
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Your password has been changed.',
    })
  } catch (error: unknown) {
    console.error('Change buyer password error:', error)

    return NextResponse.json(
      {
        ok: false,
        error: 'Your password could not be changed.',
      },
      {
        status: 500,
      },
    )
  }
}
