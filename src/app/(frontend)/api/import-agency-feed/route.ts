import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

function createSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapPropertyStatus(status: string) {
  const cleanStatus = status.toLowerCase().trim()

  if (cleanStatus === 'sold') return 'sold'

  if (
    cleanStatus === 'reserved' ||
    cleanStatus === 'under offer' ||
    cleanStatus === 'under-offer'
  ) {
    return 'reserved'
  }

  return 'for-sale'
}

async function uploadImageFromUrl(payload: any, imageUrl: string, alt: string) {
  const existingImage = await payload.find({
    collection: 'media',
    limit: 1,
    where: {
      crmImageUrl: {
        equals: imageUrl,
      },
    },
    overrideAccess: true,
  })

  if (existingImage.docs[0]) {
    return {
      media: existingImage.docs[0],
      reused: true,
    }
  }

  const res = await fetch(imageUrl)

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const rawFilename = imageUrl.split('/').pop()?.split('?')[0]

  const filename =
    rawFilename && rawFilename.includes('.') ? rawFilename : `${createSlug(alt)}-${Date.now()}.jpg`

  const media = await payload.create({
    collection: 'media',
    data: {
      alt,
      crmImageUrl: imageUrl,
    },
    file: {
      data: buffer,
      mimetype: contentType,
      name: filename,
      size: buffer.length,
    },
    overrideAccess: true,
  })

  return {
    media,
    reused: false,
  }
}

function getImageUrls(feedProperty: any) {
  const rawImages = feedProperty.images?.image

  if (!rawImages) return []

  if (Array.isArray(rawImages)) {
    return rawImages.map((image) => String(image).trim()).filter(Boolean)
  }

  return [String(rawImages).trim()].filter(Boolean)
}

function getAmenityNames(feedProperty: any) {
  const rawAmenities = feedProperty.amenities?.amenity

  if (!rawAmenities) return []

  if (Array.isArray(rawAmenities)) {
    return rawAmenities.map((amenity) => String(amenity).trim()).filter(Boolean)
  }

  return [String(rawAmenities).trim()].filter(Boolean)
}

async function findPropertyType(payload: any, propertyTypeName: string) {
  if (!propertyTypeName) return null

  const result = await payload.find({
    collection: 'property-types',
    limit: 1,
    where: {
      name: {
        equals: propertyTypeName,
      },
    },
    overrideAccess: true,
  })

  return result.docs[0] || null
}

async function findAmenities(payload: any, amenityNames: string[]) {
  const allAmenities = await payload.find({
    collection: 'amenities',
    limit: 100,
    overrideAccess: true,
  })

  const amenityIds = []

  for (const amenityName of amenityNames) {
    const cleanFeedName = amenityName.toLowerCase().trim()

    const match = allAmenities.docs.find((amenity: any) => {
      return (
        String(amenity.name || '')
          .toLowerCase()
          .trim() === cleanFeedName
      )
    })

    if (match) {
      amenityIds.push(match.id)
    }
  }

  return amenityIds
}

async function findOrCreateAgent(payload: any, feedAgent: any, agencyId: string) {
  const agentName = String(feedAgent?.name || '').trim()
  const agentEmail = String(feedAgent?.email || '').trim()
  const agentPhone = String(feedAgent?.phone || '').trim()

  if (!agentName && !agentEmail) return null

  if (agentEmail) {
    const existingByEmail = await payload.find({
      collection: 'agents',
      limit: 1,
      where: {
        and: [
          {
            email: {
              equals: agentEmail,
            },
          },
          {
            agency: {
              equals: agencyId,
            },
          },
        ],
      },
      overrideAccess: true,
    })

    if (existingByEmail.docs[0]) {
      return existingByEmail.docs[0]
    }
  }

  if (agentName) {
    const existingByName = await payload.find({
      collection: 'agents',
      limit: 1,
      where: {
        and: [
          {
            name: {
              equals: agentName,
            },
          },
          {
            agency: {
              equals: agencyId,
            },
          },
        ],
      },
      overrideAccess: true,
    })

    if (existingByName.docs[0]) {
      return existingByName.docs[0]
    }
  }

  const slugBase = createSlug(agentName || agentEmail)
  const slug = `${slugBase}-${agencyId}`

  const agent = await payload.create({
    collection: 'agents',
    data: {
      name: agentName || agentEmail,
      slug,
      email: agentEmail || undefined,
      phone: agentPhone || undefined,
      agency: agencyId,
    },
    overrideAccess: true,
  })

  return agent
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const agencies = await payload.find({
    collection: 'agencies',
    limit: 1,
    where: {
      'crm.enabled': {
        equals: true,
      },
    },
    overrideAccess: true,
  })

  const agency = agencies.docs[0]

  if (!agency) {
    return NextResponse.json({
      ok: false,
      message: 'No agency with CRM enabled found.',
    })
  }

  if (agency.crm?.type !== 'generic-xml') {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      message: `CRM type "${agency.crm?.type}" is not importable yet.`,
    })
  }

  if (!agency.crm?.feedUrl) {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      message: 'CRM feed URL is missing.',
    })
  }

  try {
    const res = await fetch(agency.crm.feedUrl)

    if (!res.ok) {
      await payload.create({
        collection: 'import-logs',
        data: {
          agencyName: agency.name,
          status: 'failed',
          errorMessage: `Feed could not be fetched. Status: ${res.status}`,
        },
        overrideAccess: true,
      })

      return NextResponse.json({
        ok: false,
        agency: agency.name,
        feedUrl: agency.crm.feedUrl,
        status: res.status,
        message: 'Feed could not be fetched.',
      })
    }

    const xml = await res.text()

    const parser = new XMLParser({
      ignoreAttributes: false,
    })

    const parsed = parser.parse(xml)

    const rawProperties = parsed?.properties?.property
    const feedProperties = Array.isArray(rawProperties)
      ? rawProperties
      : rawProperties
        ? [rawProperties]
        : []

    let created = 0
    let updated = 0
    let skipped = 0
    let imagesUploaded = 0
    let imagesReused = 0
    let agentsCreatedOrMatched = 0
    let amenitiesMatched = 0

    for (const feedProperty of feedProperties) {
      const reference = String(feedProperty.reference || '').trim()

      if (!reference) {
        skipped++
        continue
      }

      const title = String(feedProperty.title || 'Imported property')
      const slug = createSlug(`${title}-${reference}`)

      const regionName = String(feedProperty.region || '').trim()
      const townName = String(feedProperty.town || '').trim()
      const propertyTypeName = String(feedProperty.propertyType || '').trim()
      const status = mapPropertyStatus(String(feedProperty.status || 'For Sale'))
      const amenityNames = getAmenityNames(feedProperty)

      const regionResult = regionName
        ? await payload.find({
            collection: 'regions',
            limit: 1,
            where: {
              name: {
                equals: regionName,
              },
            },
            overrideAccess: true,
          })
        : null

      const townResult = townName
        ? await payload.find({
            collection: 'towns',
            limit: 1,
            where: {
              name: {
                equals: townName,
              },
            },
            overrideAccess: true,
          })
        : null

      const region = regionResult?.docs[0]
      const town = townResult?.docs[0]
      const propertyType = await findPropertyType(payload, propertyTypeName)
      const amenityIds = await findAmenities(payload, amenityNames)
      const agent = await findOrCreateAgent(payload, feedProperty.agent, agency.id)

      if (!region || !town) {
        skipped++
        continue
      }

      if (agent) {
        agentsCreatedOrMatched++
      }

      amenitiesMatched += amenityIds.length

      const imageUrls = getImageUrls(feedProperty)
      const uploadedImages = []

      for (const imageUrl of imageUrls) {
        const result = await uploadImageFromUrl(payload, imageUrl, title)

        uploadedImages.push(result.media)

        if (result.reused) {
          imagesReused++
        } else {
          imagesUploaded++
        }
      }

      const existing = await payload.find({
        collection: 'properties',
        limit: 1,
        where: {
          reference: {
            equals: reference,
          },
        },
        overrideAccess: true,
      })

      const propertyData: any = {
        title,
        slug,
        reference,
        status,
        price: Number(feedProperty.price || 0),
        bedrooms: Number(feedProperty.bedrooms || 0),
        bathrooms: Number(feedProperty.bathrooms || 0),
        latitude: Number(feedProperty.latitude || 0),
        longitude: Number(feedProperty.longitude || 0),
        excerpt: String(feedProperty.description || ''),
        agency: agency.id,
        region: region.id,
        town: town.id,
      }

      if (propertyType) {
        propertyData.propertyType = propertyType.id
      }

      if (amenityIds.length > 0) {
        propertyData.amenities = amenityIds
      }

      if (agent) {
        propertyData.agent = agent.id
      }

      if (uploadedImages.length > 0) {
        propertyData.featuredImage = uploadedImages[0].id
        propertyData.gallery = uploadedImages.map((image) => image.id)
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'properties',
          id: existing.docs[0].id,
          data: propertyData,
          overrideAccess: true,
        })

        updated++
      } else {
        await payload.create({
          collection: 'properties',
          data: propertyData,
          overrideAccess: true,
        })

        created++
      }
    }

    await payload.create({
      collection: 'import-logs',
      data: {
        agencyName: agency.name,
        status: 'success',
        found: feedProperties.length,
        created,
        updated,
        skipped,
        imagesUploaded,
        imagesReused,
        agentsMatched: agentsCreatedOrMatched,
        amenitiesMatched,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      agency: agency.name,
      feedUrl: agency.crm.feedUrl,
      found: feedProperties.length,
      created,
      updated,
      skipped,
      imagesUploaded,
      imagesReused,
      agentsCreatedOrMatched,
      amenitiesMatched,
      message: 'Feed imported successfully.',
    })
  } catch (error) {
    await payload.create({
      collection: 'import-logs',
      data: {
        agencyName: agency.name,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: false,
      agency: agency.name,
      feedUrl: agency.crm.feedUrl,
      message: 'Feed import failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
