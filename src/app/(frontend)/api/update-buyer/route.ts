import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { ActivityTypes, createActivity } from '@/lib/activity'

function getRelationshipId(value: unknown) {
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

  const trimmedValue = value.trim()

  return trimmedValue || null
}

function getBuyerDisplayName(buyer: { name?: string | null; email?: string | null }) {
  return buyer.name?.trim() || buyer.email?.trim() || 'Buyer'
}

export async function POST(req: Request) {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const { user } = await payload.auth({
      headers: await headers(),
    })

    if (!user || user.collection !== 'users') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Not authorised.',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await req.json()) as Record<string, unknown>
    const buyerId = String(body.buyerId || '').trim()

    if (!buyerId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing buyer ID.',
        },
        {
          status: 400,
        },
      )
    }

    const existingBuyer = await payload.findByID({
      collection: 'buyers',
      id: buyerId,
      depth: 0,
      overrideAccess: true,
    })

    const isSuperAdmin = user.role === 'super-admin'
    const agencyId = getRelationshipId(user.agency)
    const buyerAgencyId = getRelationshipId(existingBuyer.agency)

    if (!isSuperAdmin && agencyId !== buyerAgencyId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Not authorised.',
        },
        {
          status: 403,
        },
      )
    }

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
      const email = String(body.email || '').trim()

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

      if (email !== existingBuyer.email) {
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
      return NextResponse.json(
        {
          ok: false,
          error: 'No buyer changes were submitted.',
        },
        {
          status: 400,
        },
      )
    }

    const updatedBuyer = await payload.update({
      collection: 'buyers',
      id: buyerId,
      depth: 1,
      overrideAccess: true,
      data,
    })

    if (buyerAgencyId) {
      const buyerName = getBuyerDisplayName(updatedBuyer)

      await createActivity({
        type: ActivityTypes.BUYER_UPDATED,
        title: 'Buyer profile updated',
        description: `${buyerName}'s ${changedFields.join(', ')} ${
          changedFields.length === 1 ? 'was' : 'were'
        } updated.`,
        severity: 'info',
        entityType: 'buyer',
        entityId: String(updatedBuyer.id),
        agency: buyerAgencyId,
        user: String(user.id),
        metadata: {
          changedFields,
          changes,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      buyer: updatedBuyer,
    })
  } catch (error: unknown) {
    console.error('Update buyer error:', error)

    const message = error instanceof Error ? error.message : 'Could not update buyer.'

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
