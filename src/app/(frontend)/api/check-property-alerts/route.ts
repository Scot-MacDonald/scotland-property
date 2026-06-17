import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

function propertyMatchesSearch(property: any, queryString: string) {
  const params = new URLSearchParams(queryString)

  const region = params.get('region')
  const town = params.get('town')
  const type = params.get('type')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const bedrooms = params.get('bedrooms')

  if (region && typeof property.region === 'object' && String(property.region.id) !== region) {
    return false
  }

  if (town && typeof property.town === 'object' && String(property.town.id) !== town) {
    return false
  }

  if (
    type &&
    typeof property.propertyType === 'object' &&
    String(property.propertyType.id) !== type
  ) {
    return false
  }

  if (minPrice && Number(property.price || 0) < Number(minPrice)) {
    return false
  }

  if (maxPrice && Number(property.price || 0) > Number(maxPrice)) {
    return false
  }

  if (bedrooms && Number(property.bedrooms || 0) < Number(bedrooms)) {
    return false
  }

  return true
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const buyers = await payload.find({
    collection: 'buyers',
    where: {
      alertsEnabled: {
        equals: true,
      },
    },
    limit: 100,
    overrideAccess: true,
  })

  const properties = await payload.find({
    collection: 'properties',
    limit: 1,
    sort: '-createdAt',
    depth: 2,
    overrideAccess: true,
  })

  const property = properties.docs[0]

  if (!property) {
    return NextResponse.json({
      ok: false,
      message: 'No properties found',
    })
  }

  for (const buyer of buyers.docs) {
    if (!buyer.email) continue

    const savedSearches = buyer.savedSearches || []

    const hasMatch = savedSearches.some((search: any) =>
      propertyMatchesSearch(property, search.queryString),
    )

    if (!hasMatch) {
      continue
    }

    await payload.sendEmail({
      to: buyer.email,
      subject: `New Property Match: ${property.title}`,
      html: `
      <h1>${property.title}</h1>

      <p>
        A new property matching your saved search has been listed.
      </p>

      <p>
        Price: £${property.price?.toLocaleString('en-GB')}
      </p>

      <p>
        <a href="http://localhost:3000/property/${property.slug}">
          View Property
        </a>
      </p>
    `,
    })
  }

  return NextResponse.json({
    ok: true,
    buyers: buyers.totalDocs,
    property: property.title,
  })
}
