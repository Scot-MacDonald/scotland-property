import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized',
      },
      { status: 401 },
    )
  }

  const isSuperAdmin = user.collection === 'users' && user.role === 'super-admin'

  const agencyId =
    user.collection === 'users'
      ? typeof user.agency === 'object'
        ? user.agency?.id
        : user.agency
      : null

  const now = new Date()

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const baseFilters =
    !isSuperAdmin && agencyId
      ? [
          {
            assignedAgency: {
              equals: agencyId,
            },
          },
        ]
      : []

  const leadsThisMonth = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: startOfMonth,
          },
        },
        ...baseFilters,
      ],
    },
    overrideAccess: true,
  })

  const newLeads = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        {
          status: {
            equals: 'new',
          },
        },
        ...baseFilters,
      ],
    },
    overrideAccess: true,
  })

  const valuationsBooked = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        {
          status: {
            equals: 'valuation-booked',
          },
        },
        ...baseFilters,
      ],
    },
    overrideAccess: true,
  })

  const instructionsWon = await payload.count({
    collection: 'valuation-leads',
    where: {
      and: [
        {
          status: {
            equals: 'instruction-won',
          },
        },
        ...baseFilters,
      ],
    },
    overrideAccess: true,
  })

  const conversionRate =
    leadsThisMonth.totalDocs > 0
      ? Math.round((instructionsWon.totalDocs / leadsThisMonth.totalDocs) * 100)
      : 0

  return NextResponse.json({
    ok: true,
    leadsThisMonth: leadsThisMonth.totalDocs,
    newLeads: newLeads.totalDocs,
    valuationsBooked: valuationsBooked.totalDocs,
    instructionsWon: instructionsWon.totalDocs,
    conversionRate,
  })
}
