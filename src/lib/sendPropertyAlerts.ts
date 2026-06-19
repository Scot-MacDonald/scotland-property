import configPromise from '@payload-config'
import { getPayload } from 'payload'

function getRelationshipId(value: any) {
  if (!value) return null
  return typeof value === 'object' ? String(value.id) : String(value)
}

function propertyMatchesSearch(property: any, queryString: string) {
  const params = new URLSearchParams(queryString)

  const region = params.get('region')
  const town = params.get('town')
  const type = params.get('type')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const bedrooms = params.get('bedrooms')

  if (region && getRelationshipId(property.region) !== region) return false
  if (town && getRelationshipId(property.town) !== town) return false
  if (type && getRelationshipId(property.propertyType) !== type) return false
  if (minPrice && Number(property.price || 0) < Number(minPrice)) return false
  if (maxPrice && Number(property.price || 0) > Number(maxPrice)) return false
  if (bedrooms && Number(property.bedrooms || 0) < Number(bedrooms)) return false

  return true
}

async function alertAlreadySent(
  payload: any,
  buyerId: string,
  propertyId: string,
  queryString: string,
) {
  const existing = await payload.find({
    collection: 'alert-logs',
    limit: 1,
    where: {
      and: [
        {
          buyer: {
            equals: buyerId,
          },
        },
        {
          property: {
            equals: propertyId,
          },
        },
        {
          savedSearchQuery: {
            equals: queryString,
          },
        },
      ],
    },
    overrideAccess: true,
  })

  return Boolean(existing.docs[0])
}

export async function sendPropertyAlerts(propertyId: string) {
  const payload = await getPayload({ config: configPromise })

  const property = await payload.findByID({
    collection: 'properties',
    id: propertyId,
    depth: 2,
    overrideAccess: true,
  })

  if (!property) {
    return {
      ok: false,
      message: 'Property not found.',
      emailsSent: 0,
      emailsSkipped: 0,
    }
  }

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

  let emailsSent = 0
  let emailsSkipped = 0

  const matchedBuyers = []
  const skippedBuyers = []

  for (const buyer of buyers.docs) {
    if (!buyer.email) continue

    const savedSearches = Array.isArray(buyer.savedSearches) ? buyer.savedSearches : []

    const matchingSearches = savedSearches.filter((search: any) =>
      propertyMatchesSearch(property, search.queryString),
    )

    if (matchingSearches.length === 0) {
      continue
    }

    const unsentMatchingSearches = []

    for (const search of matchingSearches) {
      const alreadySent = await alertAlreadySent(payload, buyer.id, property.id, search.queryString)

      if (alreadySent) {
        emailsSkipped++
        skippedBuyers.push({
          email: buyer.email,
          search: search.label,
          reason: 'already sent',
        })
      } else {
        unsentMatchingSearches.push(search)
      }
    }

    if (unsentMatchingSearches.length === 0) {
      continue
    }

    await payload.sendEmail({
      to: buyer.email,
      subject: `New Property Match: ${property.title}`,
      html: `
        <h1>${property.title}</h1>

        <p>A property matching your saved search has been listed.</p>

        <p>Price: £${Number(property.price || 0).toLocaleString('en-GB')}</p>

        <p>
          <a href="http://localhost:3000/property/${property.slug}">
            View Property
          </a>
        </p>
      `,
    })

    emailsSent++

    for (const search of unsentMatchingSearches) {
      await payload.create({
        collection: 'alert-logs',
        data: {
          buyer: buyer.id,
          buyerEmail: buyer.email,
          property: property.id,
          propertyTitle: property.title,
          savedSearchLabel: search.label || 'Saved Search',
          savedSearchQuery: search.queryString,
          sentAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
    }

    matchedBuyers.push({
      email: buyer.email,
      matches: unsentMatchingSearches.length,
    })
  }

  return {
    ok: true,
    property: property.title,
    emailsSent,
    emailsSkipped,
    matchedBuyers,
    skippedBuyers,
  }
}
