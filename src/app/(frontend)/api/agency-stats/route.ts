import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const leadsThisMonth = await payload.count({
    collection: 'valuation-leads',
    where: {
      createdAt: {
        greater_than_equal: startOfMonth,
      },
    },
    overrideAccess: true,
  })

  const newLeads = await payload.count({
    collection: 'valuation-leads',
    where: {
      status: {
        equals: 'new',
      },
    },
    overrideAccess: true,
  })

  const valuationsBooked = await payload.count({
    collection: 'valuation-leads',
    where: {
      status: {
        equals: 'valuation-booked',
      },
    },
    overrideAccess: true,
  })

  const instructionsWon = await payload.count({
    collection: 'valuation-leads',
    where: {
      status: {
        equals: 'instruction-won',
      },
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
