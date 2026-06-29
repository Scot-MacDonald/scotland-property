import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { emailTemplate } from '@/lib/emailTemplates'

function buildPropertyWhereFromQueryString(queryString: string, sinceIso: string) {
  const params = new URLSearchParams(queryString)

  const filters: any[] = [
    {
      createdAt: {
        greater_than_equal: sinceIso,
      },
    },
  ]

  const region = params.get('region')
  const town = params.get('town')
  const type = params.get('type')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const bedrooms = params.get('bedrooms')

  if (region) {
    filters.push({
      region: {
        equals: region,
      },
    })
  }

  if (town) {
    filters.push({
      town: {
        equals: town,
      },
    })
  }

  if (type) {
    filters.push({
      propertyType: {
        equals: type,
      },
    })
  }

  if (minPrice) {
    filters.push({
      price: {
        greater_than_equal: Number(minPrice),
      },
    })
  }

  if (maxPrice) {
    filters.push({
      price: {
        less_than_equal: Number(maxPrice),
      },
    })
  }

  if (bedrooms) {
    filters.push({
      bedrooms: {
        greater_than_equal: Number(bedrooms),
      },
    })
  }

  return {
    and: filters,
  }
}

function getPropertyUrl(property: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return `${baseUrl}/property/${property.slug}`
}

function formatPrice(value?: number | null) {
  if (!value) return 'Price on request'

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value)
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  const since = new Date()
  since.setDate(since.getDate() - 1)
  const sinceIso = since.toISOString()

  const buyers = await payload.find({
    collection: 'buyers',
    depth: 0,
    limit: 500,
    where: {
      alertsEnabled: {
        equals: true,
      },
    },
    overrideAccess: true,
  })

  let searchesChecked = 0
  let emailsSent = 0
  let matchesFound = 0

  for (const buyer of buyers.docs as any[]) {
    if (!buyer.email) continue

    const savedSearches = buyer.savedSearches || []

    for (const savedSearch of savedSearches) {
      if (!savedSearch.queryString) continue

      searchesChecked++

      const properties = await payload.find({
        collection: 'properties',
        depth: 1,
        limit: 10,
        sort: '-createdAt',
        where: buildPropertyWhereFromQueryString(savedSearch.queryString, sinceIso),
        overrideAccess: true,
      })

      if (properties.docs.length === 0) continue

      matchesFound += properties.docs.length

      const propertyItems = properties.docs
        .map((property: any) => {
          const url = getPropertyUrl(property)

          return `
            <li style="margin-bottom: 18px;">
              <strong>${property.title}</strong><br />
              ${formatPrice(property.price)}<br />
              ${property.bedrooms ? `${property.bedrooms} bedrooms<br />` : ''}
              <a href="${url}">View property</a>
            </li>
          `
        })
        .join('')

      await payload.sendEmail({
        to: buyer.email,
        subject: `${properties.docs.length} new propert${
          properties.docs.length === 1 ? 'y' : 'ies'
        } matching your saved search`,
        html: emailTemplate({
          title: 'New Properties Matching Your Search',
          content: `
    <p>
      We found ${properties.docs.length} new propert${
        properties.docs.length === 1 ? 'y' : 'ies'
      } matching:
    </p>

    <p><strong>${savedSearch.label || 'Saved search'}</strong></p>

    <ul>
      ${propertyItems}
    </ul>

    <p style="margin-top:40px;">
      You are receiving this because you enabled property alerts.
    </p>
  `,
        }),
      })

      emailsSent++
    }
  }

  return NextResponse.json({
    ok: true,
    buyersFound: buyers.totalDocs,
    searchesChecked,
    matchesFound,
    emailsSent,
  })
}
