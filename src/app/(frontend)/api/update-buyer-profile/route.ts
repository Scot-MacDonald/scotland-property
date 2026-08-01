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

function getNullableString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  return value.trim() || null
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

    const existingBuyer = await payload.findByID({
      collection: 'buyers',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const data: Record<string, unknown> = {}
    const changedFields: string[] = []
    const changes: Record<
      string,
      {
        from: unknown
        to: unknown
      }
    > = {}

    if ('name' in body) {
      const name = getNullableString(body.name)
      const existingName = getNullableString(existingBuyer.name)

      if (name !== existingName) {
        data.name = name
        changedFields.push('name')
        changes.name = {
          from: existingName,
          to: name,
        }
      }
    }

    if ('email' in body) {
      const email = String(body.email || '')
        .trim()
        .toLowerCase()

      if (!email) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Email address is required.',
          },
          {
            status: 400,
          },
        )
      }

      if (email !== existingBuyer.email.toLowerCase()) {
        data.email = email
        changedFields.push('email')
        changes.email = {
          from: existingBuyer.email,
          to: email,
        }
      }
    }

    if ('alertsEnabled' in body) {
      const alertsEnabled = Boolean(body.alertsEnabled)
      const existingAlertsEnabled = Boolean(existingBuyer.alertsEnabled)

      if (alertsEnabled !== existingAlertsEnabled) {
        data.alertsEnabled = alertsEnabled
        changedFields.push('alerts')
        changes.alertsEnabled = {
          from: existingAlertsEnabled,
          to: alertsEnabled,
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({
        ok: true,
        unchanged: true,
        buyer: existingBuyer,
      })
    }

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: user.id,
      depth: 1,
      overrideAccess: true,
      data: {
        ...data,
        lastActiveAt: new Date().toISOString(),
      },
    })

    const buyerAgencyId = getRelationshipId(updatedBuyer.agency)

    const changedLabels = changedFields.map((field) => {
      switch (field) {
        case 'name':
          return 'name'

        case 'email':
          return 'email address'

        case 'alerts':
          return 'property alerts'

        default:
          return field
      }
    })

    const description =
      changedLabels.length === 1
        ? `Your ${changedLabels[0]} ${
            changedLabels[0] === 'property alerts' ? 'were' : 'was'
          } updated.`
        : `Your ${changedLabels.join(', ')} were updated.`

    await createActivity({
      type: ActivityTypes.BUYER_UPDATED,
      title: 'Profile updated',
      description,
      severity: 'info',
      entityType: 'buyer',
      entityId: String(updatedBuyer.id),
      buyer: String(updatedBuyer.id),
      agency: buyerAgencyId || undefined,
      metadata: {
        changedFields,
        changes,
        source: 'buyer-profile',
      },
    })

    return NextResponse.json({
      ok: true,
      buyer: updatedBuyer,
    })
  } catch (error: unknown) {
    console.error('Update buyer profile error:', error)

    const message = error instanceof Error ? error.message : 'Could not update your profile.'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    )
  }
}
