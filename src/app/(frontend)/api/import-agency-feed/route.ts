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

  if (!rawImages) {
    return []
  }

  if (Array.isArray(rawImages)) {
    return rawImages.map((image) => String(image).trim()).filter(Boolean)
  }

  return [String(rawImages).trim()].filter(Boolean)
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

      if (!region || !town) {
        skipped++
        continue
      }

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
      message: 'Feed imported successfully.',
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      agency: agency.name,
      feedUrl: agency.crm.feedUrl,
      message: 'Feed import failed.',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
